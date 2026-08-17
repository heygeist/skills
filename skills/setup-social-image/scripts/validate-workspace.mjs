#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const target = path.resolve(process.argv[2] ?? process.cwd());
const configRoot = path.join(target, '.social-image');
const assetsRoot = path.join(configRoot, 'assets');
const failures = [];
const warnings = [];

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function collectFiles(root) {
  if (!fs.existsSync(root)) return [];
  const files = [];
  const pending = [root];
  while (pending.length) {
    const directory = pending.pop();
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) pending.push(absolute);
      else if (entry.isFile()) files.push(absolute);
    }
  }
  return files;
}

if (!fs.existsSync(target) || !fs.statSync(target).isDirectory()) {
  failures.push(`workspace is not a directory: ${target}`);
}

const requiredText = [
  path.join(target, 'DESIGN.md'),
  path.join(configRoot, 'context.md'),
  path.join(configRoot, 'caption.md'),
  path.join(configRoot, 'sources.md'),
];
for (const file of requiredText) {
  if (!fs.existsSync(file) || !fs.statSync(file).isFile() || !fs.readFileSync(file, 'utf8').trim()) {
    failures.push(`missing or empty file: ${file}`);
    continue;
  }
  const content = fs.readFileSync(file, 'utf8');
  if (/UNCONFIRMED(?:_| )INFERENCE|\bTODO\b/i.test(content)) {
    failures.push(`unconfirmed inference or TODO marker remains in ${file}`);
  }
}

const manifestPath = path.join(configRoot, 'asset-manifest.json');
let manifest = null;
if (!fs.existsSync(manifestPath)) {
  failures.push(`missing asset manifest: ${manifestPath}`);
} else {
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    if (manifest.schema_version !== 1 || !Array.isArray(manifest.assets) || !Array.isArray(manifest.references)) {
      failures.push('asset-manifest.json has an unsupported schema');
    }
  } catch (error) {
    failures.push(`invalid asset-manifest.json: ${error.message}`);
  }
}

const referenced = new Set();
for (const entry of manifest?.assets ?? []) {
  const resolved = path.resolve(configRoot, entry.path ?? '');
  const relative = path.relative(assetsRoot, resolved);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
    failures.push(`asset ${entry.id} escapes the asset library`);
    continue;
  }
  referenced.add(path.relative(configRoot, resolved).split(path.sep).join('/'));
  if (!fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) {
    failures.push(`asset ${entry.id} is missing: ${resolved}`);
  } else if (sha256(resolved) !== entry.sha256) {
    failures.push(`asset ${entry.id} checksum mismatch: ${resolved}`);
  }
}

const orphaned = collectFiles(assetsRoot)
  .map((file) => path.relative(configRoot, file).split(path.sep).join('/'))
  .filter((relative) => !referenced.has(relative));
if (orphaned.length) warnings.push(`orphaned assets preserved: ${orphaned.join(', ')}`);

for (const legacy of [path.join(configRoot, 'active-brand.json'), path.join(configRoot, 'brands')]) {
  if (fs.existsSync(legacy)) warnings.push(`legacy context preserved: ${legacy}`);
}

const result = { valid: failures.length === 0, failures, warnings, orphaned_assets: orphaned };
console.log(JSON.stringify(result, null, 2));
if (failures.length) process.exit(1);
