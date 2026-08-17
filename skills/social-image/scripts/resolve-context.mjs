#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const startArgument = process.argv.slice(2).find((argument) => !argument.startsWith('--'));
let cursor = path.resolve(startArgument ?? process.cwd());
if (fs.existsSync(cursor) && fs.statSync(cursor).isFile()) cursor = path.dirname(cursor);

function result(value) {
  console.log(JSON.stringify(value, null, 2));
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function collectFiles(root) {
  if (!fs.existsSync(root)) return [];
  const files = [];
  const stack = [root];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const resolved = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(resolved);
      else if (entry.isFile()) files.push(resolved);
    }
  }
  return files.sort();
}

function findWorkspace(start) {
  let current = start;
  while (true) {
    const designSystem = path.join(current, 'DESIGN.md');
    const configRoot = path.join(current, '.social-image');
    if (fs.existsSync(designSystem) || fs.existsSync(configRoot)) {
      return { workspace: current, designSystem, configRoot };
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

const candidates = {
  design_system: found.designSystem,
  context: path.join(found.configRoot, 'context.md'),
  caption_contract: path.join(found.configRoot, 'caption.md'),
  sources: path.join(found.configRoot, 'sources.md'),
  asset_manifest: path.join(found.configRoot, 'asset-manifest.json'),
};
const files = Object.fromEntries(
  Object.entries(candidates).filter(([, file]) => fs.existsSync(file) && fs.statSync(file).isFile()),
);
const missing = Object.entries(candidates)
  .filter(([, file]) => !fs.existsSync(file) || !fs.statSync(file).isFile())
  .map(([key]) => key);

let manifest = { schema_version: 1, assets: [], references: [] };
if (files.asset_manifest) {
  try {
    manifest = JSON.parse(fs.readFileSync(files.asset_manifest, 'utf8'));
  } catch (error) {
    fail(`invalid asset-manifest.json: ${error.message}`);
  }
  if (manifest.schema_version !== 1 || !Array.isArray(manifest.assets) || !Array.isArray(manifest.references)) {
    fail('asset-manifest.json has an unsupported schema');
  }
}

const assetsRoot = path.join(found.configRoot, 'assets');
const assets = [];
for (const entry of manifest.assets) {
  const resolved = path.resolve(found.configRoot, entry.path ?? '');
  const relative = path.relative(assetsRoot, resolved);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
    fail(`asset ${entry.id} escapes the workspace asset library`);
  }
  if (!fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) {
    fail(`asset ${entry.id} is missing: ${resolved}`);
  }
  if (sha256(resolved) !== entry.sha256) {
    fail(`asset ${entry.id} checksum mismatch: ${resolved}`);
  }
  assets.push({ ...entry, absolute_path: resolved });
}

const referenced = new Set(manifest.assets.map((entry) => entry.path));
const orphanedAssets = collectFiles(assetsRoot)
  .map((file) => path.relative(found.configRoot, file).split(path.sep).join('/'))
  .filter((relative) => !referenced.has(relative));
const legacyPaths = [
  path.join(found.configRoot, 'active-brand.json'),
  path.join(found.configRoot, 'brands'),
].filter((candidate) => fs.existsSync(candidate));

result({
  found: true,
  workspace: found.workspace,
  design_ready: Boolean(files.design_system),
  context_ready: Boolean(files.context && files.caption_contract),
  complete: missing.length === 0,
  files,
  assets,
  references: manifest.references,
  missing,
  orphaned_assets: orphanedAssets,
  legacy_paths: legacyPaths,
});
