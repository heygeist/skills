#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const skillDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const temporaryDir = fs.mkdtempSync(path.join(os.tmpdir(), 'social-image-smoke-'));
const renderer = path.join(skillDir, 'scripts', 'shot.mjs');
const contactSheet = path.join(skillDir, 'scripts', 'contact-sheet.mjs');
const resolver = path.join(skillDir, 'scripts', 'resolve-context.mjs');
const example = path.join(skillDir, 'assets', 'example.html');

function run(args) {
  const result = spawnSync(process.execPath, args, { cwd: skillDir, stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function expectFailure(args, expectedMessage) {
  const result = spawnSync(process.execPath, args, { cwd: skillDir, encoding: 'utf8' });
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`;
  if (result.status === 0 || !output.includes(expectedMessage)) {
    throw new Error(`expected renderer failure containing: ${expectedMessage}`);
  }
}

try {
  const designOnlyWorkspace = path.join(temporaryDir, 'design-only');
  const nestedWorkspace = path.join(designOnlyWorkspace, 'projects', 'sample');
  fs.mkdirSync(nestedWorkspace, { recursive: true });
  fs.writeFileSync(path.join(designOnlyWorkspace, 'DESIGN.md'), '---\nname: Smoke\n---\n\n## Overview\n\nSmoke design.\n', 'utf8');
  const resolved = spawnSync(process.execPath, [resolver, nestedWorkspace], {
    cwd: skillDir,
    encoding: 'utf8',
  });
  if (resolved.status !== 0) throw new Error(resolved.stderr || 'DESIGN.md resolver failed');
  const designContext = JSON.parse(resolved.stdout);
  if (!designContext.found || !designContext.design_ready || designContext.context_ready) {
    throw new Error('standalone DESIGN.md did not resolve without a context pack');
  }
  if (designContext.files.design_system !== path.join(designOnlyWorkspace, 'DESIGN.md')) {
    throw new Error('standalone DESIGN.md resolved to the wrong path');
  }

  const configRoot = path.join(designOnlyWorkspace, '.social-image');
  const logoDir = path.join(configRoot, 'assets', 'logos');
  const logo = path.join(logoDir, 'logo.svg');
  fs.mkdirSync(logoDir, { recursive: true });
  fs.writeFileSync(path.join(configRoot, 'context.md'), '# Product Context\n\nSmoke context.\n', 'utf8');
  fs.writeFileSync(path.join(configRoot, 'caption.md'), '# Caption Guidance\n\nSmoke voice.\n', 'utf8');
  fs.writeFileSync(path.join(configRoot, 'sources.md'), '# Sources\n\nSmoke source.\n', 'utf8');
  fs.writeFileSync(logo, '<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0h10v10H0z"/></svg>\n');
  const logoHash = crypto.createHash('sha256').update(fs.readFileSync(logo)).digest('hex');
  fs.writeFileSync(path.join(configRoot, 'asset-manifest.json'), `${JSON.stringify({
    schema_version: 1,
    assets: [{
      id: 'primary-logo', category: 'logos', type: 'logo', role: 'Primary mark',
      status: 'canonical', source: 'smoke fixture', ownership: 'Example', license: 'Test only',
      restrictions: 'None', path: 'assets/logos/logo.svg', sha256: logoHash,
    }],
    references: [],
  }, null, 2)}\n`, 'utf8');
  const completeResolution = spawnSync(process.execPath, [resolver, nestedWorkspace], {
    cwd: skillDir,
    encoding: 'utf8',
  });
  if (completeResolution.status !== 0) throw new Error(completeResolution.stderr || 'context resolver failed');
  const completeContext = JSON.parse(completeResolution.stdout);
  if (!completeContext.complete || !completeContext.context_ready || completeContext.assets.length !== 1) {
    throw new Error('complete workspace context did not resolve');
  }

  run([renderer, example, '--out', temporaryDir, '--basename', 'smoke', '--preview']);

  const expected = [
    'smoke-square.png',
    'smoke-landscape.png',
    'smoke-portrait.png',
    'smoke-360-preview.png',
  ];

  for (const file of expected) {
    const target = path.join(temporaryDir, file);
    if (!fs.existsSync(target) || fs.statSync(target).size === 0) {
      throw new Error(`missing smoke-test output: ${file}`);
    }
  }

  run([
    contactSheet,
    path.join(temporaryDir, 'smoke-square.png'),
    '--out',
    path.join(temporaryDir, 'contact-sheet.png'),
  ]);

  fs.copyFileSync(path.join(skillDir, 'assets', 'base.css'), path.join(temporaryDir, 'base.css'));
  const missingProvenance = fs.readFileSync(example, 'utf8').replace(' data-provenance="example"', '');
  const invalidExample = path.join(temporaryDir, 'missing-provenance.html');
  fs.writeFileSync(invalidExample, missingProvenance, 'utf8');
  expectFailure([
    renderer,
    invalidExample,
    '--out',
    path.join(temporaryDir, 'invalid-output'),
    '--canvas',
    'square',
  ], 'missing data-provenance');

  console.log('social-image smoke test passed');
} finally {
  fs.rmSync(temporaryDir, { recursive: true, force: true });
}
