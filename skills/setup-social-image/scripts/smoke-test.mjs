#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const skillDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const applyScript = path.join(skillDir, 'scripts', 'apply.mjs');
const validateScript = path.join(skillDir, 'scripts', 'validate-workspace.mjs');
const temporaryWorkspace = fs.mkdtempSync(path.join(os.tmpdir(), 'setup-social-image-smoke-'));
const fixtureDir = path.join(temporaryWorkspace, 'intake-fixtures');
const planPath = path.join(temporaryWorkspace, 'approved-plan.json');

function run(command, args) {
  const result = spawnSync(command, args, { cwd: skillDir, encoding: 'utf8' });
  if (result.status !== 0) throw new Error(result.stderr || result.stdout || `${command} failed`);
  return result.stdout.trim() ? JSON.parse(result.stdout) : null;
}

function writePlan(plan) {
  fs.writeFileSync(planPath, `${JSON.stringify(plan, null, 2)}\n`, 'utf8');
}

try {
  fs.mkdirSync(fixtureDir, { recursive: true });
  const legacyContext = path.join(temporaryWorkspace, '.social-image', 'brands', 'legacy', 'context.md');
  fs.mkdirSync(path.dirname(legacyContext), { recursive: true });
  fs.writeFileSync(legacyContext, '# Legacy context\n', 'utf8');
  const primaryLogo = path.join(fixtureDir, 'primary.svg');
  const alternateLogo = path.join(fixtureDir, 'alternate.svg');
  const mascot = path.join(fixtureDir, 'mascot.svg');
  fs.writeFileSync(primaryLogo, '<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0h10v10H0z"/></svg>\n');
  fs.writeFileSync(alternateLogo, '<svg xmlns="http://www.w3.org/2000/svg"><circle cx="5" cy="5" r="5"/></svg>\n');
  fs.writeFileSync(mascot, '<svg xmlns="http://www.w3.org/2000/svg"><path d="M5 0l5 10H0z"/></svg>\n');

  const plan = {
    schema_version: 1,
    approved: true,
    documents: {
      design_md: '---\nversion: alpha\nname: Example\ncolors:\n  primary: "#111111"\n---\n\n# Example Design System\n\n## Overview\n\nClear and direct.\n',
      context_md: '# Product Context\n\n## Identity\n\nExample product.\n\n## Explicit Gaps\n\nAudience research is pending.\n',
      caption_md: '# Caption Guidance\n\n## Defaults\n\nUse concise English.\n\n## Explicit Gaps\n\nNo hashtag policy is established.\n',
    },
    assets: [
      {
        id: 'primary-logo', source_path: primaryLogo, source: 'user supplied', filename: 'mark.svg',
        category: 'logos', type: 'logo', role: 'Primary mark', status: 'canonical',
        ownership: 'Example', license: 'Internal', restrictions: 'Use unchanged',
      },
      {
        id: 'alternate-logo', source_path: alternateLogo, source: 'user supplied', filename: 'mark.svg',
        category: 'logos', type: 'logo', role: 'Alternate mark', status: 'canonical',
        ownership: 'Example', license: 'Internal', restrictions: 'Use unchanged',
      },
      {
        id: 'primary-mascot', source_path: mascot, source: 'user supplied', filename: 'mascot.svg',
        category: 'mascots', type: 'mascot', role: 'Primary character', status: 'canonical',
        ownership: 'Example', license: 'Internal', restrictions: 'Use unchanged',
      },
    ],
    references: [
      {
        id: 'brand-site', source: 'https://example.com', type: 'website', role: 'Current surface',
        status: 'reference-only', ownership: 'Example', license: 'Reference only', restrictions: 'Do not redistribute media',
      },
    ],
  };
  writePlan(plan);

  const dryRun = run(process.execPath, [applyScript, '--target', temporaryWorkspace, '--plan', planPath, '--dry-run']);
  if (!dryRun.dry_run || fs.existsSync(path.join(temporaryWorkspace, 'DESIGN.md'))) {
    throw new Error('dry run mutated the workspace');
  }

  const applied = run(process.execPath, [applyScript, '--target', temporaryWorkspace, '--plan', planPath]);
  if (applied.assets.filter((asset) => asset.action === 'copy').length !== 3) {
    throw new Error('initial apply did not copy every approved asset');
  }
  if (applied.preserved_legacy_paths.length !== 1 || !fs.existsSync(legacyContext)) {
    throw new Error('initial apply did not preserve and report legacy context');
  }
  const manifestPath = path.join(temporaryWorkspace, '.social-image', 'asset-manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  if (manifest.assets.length !== 3 || manifest.references.length !== 1) {
    throw new Error('asset manifest did not preserve the approved context');
  }
  const logoPaths = manifest.assets.filter((asset) => asset.category === 'logos').map((asset) => asset.path);
  if (new Set(logoPaths).size !== 2 || !logoPaths.some((file) => /-[a-f0-9]{8}\.svg$/.test(file))) {
    throw new Error('same-name assets did not receive collision-safe paths');
  }

  const validation = run(process.execPath, [validateScript, temporaryWorkspace]);
  if (!validation.valid) throw new Error('configured workspace did not validate');

  const repeated = run(process.execPath, [applyScript, '--target', temporaryWorkspace, '--plan', planPath]);
  if (repeated.assets.some((asset) => asset.action !== 'reuse') || repeated.backup !== null) {
    throw new Error('repeated setup was not idempotent');
  }

  fs.writeFileSync(primaryLogo, '<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 5h10"/></svg>\n');
  plan.documents.context_md = plan.documents.context_md.replace('Example product.', 'Updated example product.');
  writePlan(plan);
  const updated = run(process.execPath, [applyScript, '--target', temporaryWorkspace, '--plan', planPath]);
  if (!updated.backup || updated.orphaned_assets.length === 0) {
    throw new Error('updated setup did not back up context and preserve replaced assets');
  }

  console.log('setup-social-image smoke test passed');
} finally {
  fs.rmSync(temporaryWorkspace, { recursive: true, force: true });
}
