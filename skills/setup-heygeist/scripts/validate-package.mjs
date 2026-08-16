#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const skillDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const required = [
  'SKILL.md',
  'agents/openai.yaml',
  'assets/context-pack/brand.json',
  'assets/context-pack/context.md',
  'assets/context-pack/caption.md',
  'assets/context-pack/visual.md',
  'assets/context-pack/theme.css',
  'scripts/install.mjs',
  'scripts/smoke-test.mjs',
];
const failures = [];

for (const relativePath of required) {
  if (!fs.existsSync(path.join(skillDir, relativePath))) failures.push(`missing ${relativePath}`);
}

const skill = fs.readFileSync(path.join(skillDir, 'SKILL.md'), 'utf8');
if (!/^name: setup-heygeist$/m.test(skill)) failures.push('skill name must be setup-heygeist');
if (!skill.includes('$social-image')) failures.push('setup skill must hand off to $social-image');

const manifest = JSON.parse(fs.readFileSync(path.join(skillDir, 'assets/context-pack/brand.json'), 'utf8'));
if (manifest.schema_version !== 1 || manifest.id !== 'heygeist') failures.push('invalid HeyGeist pack manifest');

for (const key of ['context', 'caption_contract', 'visual_contract', 'theme']) {
  if (!fs.existsSync(path.join(skillDir, 'assets/context-pack', manifest[key] ?? ''))) {
    failures.push(`manifest points to missing ${key}`);
  }
}

if (failures.length) {
  for (const failure of failures) console.error(`FAIL ${failure}`);
  process.exit(1);
}

console.log('setup-heygeist package validation passed');
