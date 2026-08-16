#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const skillDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const temporaryDir = fs.mkdtempSync(path.join(os.tmpdir(), 'social-image-smoke-'));
const renderer = path.join(skillDir, 'scripts', 'shot.mjs');
const contactSheet = path.join(skillDir, 'scripts', 'contact-sheet.mjs');
const resolver = path.join(skillDir, 'scripts', 'resolve-brand.mjs');
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
  if (!designContext.found || designContext.brand !== null) {
    throw new Error('standalone DESIGN.md did not resolve without a context pack');
  }
  if (designContext.files.design_system !== path.join(designOnlyWorkspace, 'DESIGN.md')) {
    throw new Error('standalone DESIGN.md resolved to the wrong path');
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
