#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const startArg = process.argv.slice(2).find((argument) => !argument.startsWith('--'));
let cursor = path.resolve(startArg ?? process.cwd());
if (fs.existsSync(cursor) && fs.statSync(cursor).isFile()) cursor = path.dirname(cursor);

function result(value) {
  console.log(JSON.stringify(value, null, 2));
}

function findWorkspace(start) {
  let current = start;
  while (true) {
    const activeBrand = path.join(current, '.social-image', 'active-brand.json');
    const designSystem = path.join(current, 'DESIGN.md');
    if (fs.existsSync(activeBrand) || fs.existsSync(designSystem)) {
      return {
        workspace: current,
        activeBrand: fs.existsSync(activeBrand) ? activeBrand : null,
        designSystem: fs.existsSync(designSystem) ? designSystem : null,
      };
    }
    const parent = path.dirname(current);
    if (parent === current) return null;
    current = parent;
  }
}

const found = findWorkspace(cursor);
if (!found) {
  result({ found: false, start: cursor });
  process.exit(0);
}

const files = {};
if (found.designSystem) files.design_system = found.designSystem;

if (!found.activeBrand) {
  result({
    found: true,
    workspace: found.workspace,
    brand: null,
    manifest: null,
    files,
    optional_assets: {},
  });
  process.exit(0);
}

let active;
try {
  active = JSON.parse(fs.readFileSync(found.activeBrand, 'utf8'));
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

if (manifest.schema_version !== 2 || manifest.id !== active.brand) {
  console.error('brand manifest must use schema_version 2 and match active-brand.json; rerun its setup skill with --force to migrate');
  process.exit(1);
}

if (!found.designSystem) {
  console.error(`active brand "${active.brand}" requires DESIGN.md at ${path.join(found.workspace, 'DESIGN.md')}`);
  process.exit(1);
}

const required = ['context', 'caption_contract'];
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
