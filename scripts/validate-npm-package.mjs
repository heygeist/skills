#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];
const required = [
  'package.json',
  'package-lock.json',
  'bin/heygeist-skills.mjs',
  'skills/setup-social-image/SKILL.md',
  'skills/social-image/SKILL.md',
  'LICENSE',
  'README.md',
];

for (const relative of required) {
  if (!fs.existsSync(path.join(root, relative))) failures.push(`missing ${relative}`);
}

const manifest = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
if (manifest.name !== '@heygeist/skills') failures.push('package name must be @heygeist/skills');
if (manifest.private === true) failures.push('root npm installer package must not be private');
if (manifest.bin?.['heygeist-skills'] !== 'bin/heygeist-skills.mjs') failures.push('package bin is missing');
if (manifest.publishConfig?.access !== 'public') failures.push('scoped package must publish publicly');
if (!manifest.files?.includes('skills/setup-social-image/SKILL.md') || !manifest.files?.includes('skills/social-image/SKILL.md')) {
  failures.push('both skill bundles must be included in npm files');
}

const cli = path.join(root, 'bin', 'heygeist-skills.mjs');
if (fs.existsSync(cli) && !(fs.statSync(cli).mode & 0o111)) failures.push('installer CLI must be executable');

if (failures.length) {
  for (const failure of failures) console.error(`FAIL ${failure}`);
  process.exit(1);
}

console.log('npm installer package validation passed');
