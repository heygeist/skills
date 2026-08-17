#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const skillDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];

function read(relativePath) {
  return fs.readFileSync(path.join(skillDir, relativePath), 'utf8');
}

const skill = read('SKILL.md');
const metadata = read('agents/openai.yaml');
const frontmatter = skill.match(/^---\n([\s\S]*?)\n---\n/);

if (!frontmatter) failures.push('SKILL.md is missing YAML frontmatter');
if (!/^name: social-image$/m.test(frontmatter?.[1] ?? '')) failures.push('skill name must be social-image');
if (!/^description: .+/m.test(frontmatter?.[1] ?? '')) failures.push('skill description is missing');
if (!metadata.includes('$social-image')) failures.push('agents/openai.yaml must invoke $social-image');

const requiredFiles = [
  'assets/base.css',
  'assets/example.html',
  'references/brand-input.md',
  'references/workspace-context.md',
  'references/caption-contract.md',
  'references/image-generation.md',
  'references/layout-grammar.md',
  'references/visual-contract.md',
  'scripts/contact-sheet.mjs',
  'scripts/resolve-context.mjs',
  'scripts/shot.mjs',
  'scripts/smoke-test.mjs',
  'scripts/validate-package.mjs',
  'package.json',
  'package-lock.json',
];

for (const relativePath of requiredFiles) {
  if (!fs.existsSync(path.join(skillDir, relativePath))) failures.push(`missing ${relativePath}`);
}

for (const match of skill.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
  const link = match[1];
  if (!link.includes('://') && !fs.existsSync(path.join(skillDir, link))) {
    failures.push(`broken SKILL.md link: ${link}`);
  }
}

const forbidden = [
  /facebook-page-assets/i,
  /Desktop\/work/i,
  /\.agents\/skills/i,
  /Crownheart/i,
  /GEIST-TOKENS/i,
  /NotoSansThai/i,
  /templates\/geist-social-image/i,
];

const textFiles = [
  'SKILL.md',
  'agents/openai.yaml',
  ...requiredFiles.filter((file) => /\.(?:md|css|html|mjs)$/.test(file) && file !== 'scripts/validate-package.mjs'),
];

for (const relativePath of textFiles) {
  const content = read(relativePath);
  for (const pattern of forbidden) {
    if (pattern.test(content)) failures.push(`${relativePath} contains forbidden workspace-specific text: ${pattern}`);
  }
}

if (failures.length) {
  for (const failure of failures) console.error(`FAIL ${failure}`);
  process.exit(1);
}

console.log('social-image package validation passed');
