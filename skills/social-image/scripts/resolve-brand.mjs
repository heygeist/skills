#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const startArg = process.argv.slice(2).find((argument) => !argument.startsWith('--'));
let cursor = path.resolve(startArg ?? process.cwd());
if (fs.existsSync(cursor) && fs.statSync(cursor).isFile()) cursor = path.dirname(cursor);

function result(value) {
  console.log(JSON.stringify(value, null, 2));
}

function findConfig(start) {
  let current = start;
  while (true) {
    const candidate = path.join(current, '.social-image', 'active-brand.json');
    if (fs.existsSync(candidate)) return { workspace: current, config: candidate };
    const parent = path.dirname(current);
    if (parent === current) return null;
    current = parent;
  }
}

const found = findConfig(cursor);
if (!found) {
  result({ found: false, start: cursor });
  process.exit(0);
}

let active;
try {
  active = JSON.parse(fs.readFileSync(found.config, 'utf8'));
} catch (error) {
  console.error(`invalid active brand config: ${error.message}`);
  process.exit(1);
}

if (active.schema_version !== 1 || !/^[a-z0-9-]+$/.test(active.brand ?? '')) {
  console.error('active-brand.json must use schema_version 1 and a lowercase hyphenated brand ID');
  process.exit(1);
}

const brandsRoot = path.join(found.workspace, '.social-image', 'brands');
const brandDir = path.resolve(brandsRoot, active.brand);
if (!brandDir.startsWith(`${path.resolve(brandsRoot)}${path.sep}`)) {
  console.error('resolved brand path escapes the brands directory');
  process.exit(1);
}

const manifestPath = path.join(brandDir, 'brand.json');
if (!fs.existsSync(manifestPath)) {
  console.error(`brand manifest does not exist: ${manifestPath}`);
  process.exit(1);
}

let manifest;
try {
  manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
} catch (error) {
  console.error(`invalid brand manifest: ${error.message}`);
  process.exit(1);
}

if (manifest.schema_version !== 1 || manifest.id !== active.brand) {
  console.error('brand manifest schema or ID does not match active-brand.json');
  process.exit(1);
}

const required = ['context', 'caption_contract', 'visual_contract', 'theme'];
const files = {};
const missing = [];

for (const key of required) {
  const relativePath = manifest[key];
  const resolved = typeof relativePath === 'string' ? path.resolve(brandDir, relativePath) : '';
  if (!resolved || !resolved.startsWith(`${brandDir}${path.sep}`) || !fs.existsSync(resolved)) {
    missing.push(key);
  } else {
    files[key] = resolved;
  }
}

if (missing.length) {
  console.error(`brand pack is missing required file(s): ${missing.join(', ')}`);
  process.exit(1);
}

const optionalAssets = {};
for (const [key, relativePath] of Object.entries(manifest.optional_assets ?? {})) {
  const resolved = path.resolve(brandDir, relativePath);
  optionalAssets[key] = resolved.startsWith(`${brandDir}${path.sep}`) && fs.existsSync(resolved)
    ? resolved
    : null;
}

result({
  found: true,
  workspace: found.workspace,
  brand: active.brand,
  brand_dir: brandDir,
  manifest: manifestPath,
  files,
  optional_assets: optionalAssets,
});
