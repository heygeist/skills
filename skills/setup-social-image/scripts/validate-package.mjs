#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const skillDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const required = [
  'SKILL.md',
  'agents/openai.yaml',
  'assets/templates/DESIGN.md',
  'assets/templates/context.md',
  'assets/templates/caption.md',
  'references/intake.md',
  'references/workspace-contract.md',
  'scripts/apply.mjs',
  'scripts/smoke-test.mjs',
  'scripts/validate-package.mjs',
  'scripts/validate-workspace.mjs',
  'package.json',
  'package-lock.json',
];
const failures = [];

function read(relativePath) {
  return fs.readFileSync(path.join(skillDir, relativePath), 'utf8');
}

for (const relativePath of required) {
  if (!fs.existsSync(path.join(skillDir, relativePath))) failures.push(`missing ${relativePath}`);
}

const skill = read('SKILL.md');
const frontmatter = skill.match(/^---\n([\s\S]*?)\n---\n/);
if (!frontmatter) failures.push('SKILL.md is missing YAML frontmatter');
if (!/^name: setup-social-image$/m.test(frontmatter?.[1] ?? '')) failures.push('skill name must be setup-social-image');
if (!/^description: .+/m.test(frontmatter?.[1] ?? '')) failures.push('skill description is missing');
if (!read('agents/openai.yaml').includes('$setup-social-image')) {
  failures.push('agents/openai.yaml must invoke $setup-social-image');
}

for (const match of skill.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
  const link = match[1];
  if (!link.includes('://') && !fs.existsSync(path.join(skillDir, link))) {
    failures.push(`broken SKILL.md link: ${link}`);
  }
}

const genericFiles = required.filter((file) =>
  /\.(?:md|yaml)$/.test(file) || file.startsWith('assets/templates/'),
);
for (const relativePath of genericFiles) {
  const content = read(relativePath);
  for (const forbidden of [/setup-heygeist/i, /Crownheart/i, /GEIST\./, /HeyGeist palette/i]) {
    if (forbidden.test(content)) failures.push(`${relativePath} contains bundled brand-specific context: ${forbidden}`);
  }
}

if (failures.length) {
  for (const failure of failures) console.error(`FAIL ${failure}`);
  process.exit(1);
}

console.log('setup-social-image package validation passed');
