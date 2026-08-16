#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const argv = process.argv.slice(2);

function flag(name, fallback = null) {
  const index = argv.indexOf(`--${name}`);
  return index === -1 ? fallback : argv[index + 1];
}

function has(name) {
  return argv.includes(`--${name}`);
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

const target = path.resolve(flag('target', process.cwd()));
if (!fs.existsSync(target) || !fs.statSync(target).isDirectory()) {
  fail(`target workspace is not a directory: ${target}`);
}
if (path.parse(target).root === target) {
  fail('refusing to install workspace configuration at a filesystem root');
}

const setupDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourcePack = path.join(setupDir, 'assets', 'context-pack');
const sourceDesign = path.join(setupDir, 'assets', 'DESIGN.md');
const configRoot = path.join(target, '.social-image');
const brandsRoot = path.join(configRoot, 'brands');
const destination = path.join(brandsRoot, 'heygeist');
const activePath = path.join(configRoot, 'active-brand.json');
const designPath = path.join(target, 'DESIGN.md');
const force = has('force');

if (fs.existsSync(destination) && !force) {
  fail(`HeyGeist context already exists at ${destination}; inspect it and rerun with --force to update`);
}

if (fs.existsSync(designPath) && !force) {
  fail(`DESIGN.md already exists at ${designPath}; inspect it and rerun with --force to replace it`);
}

if (fs.existsSync(activePath) && !force) {
  try {
    const active = JSON.parse(fs.readFileSync(activePath, 'utf8'));
    if (active.brand !== 'heygeist') {
      fail(`workspace already activates brand "${active.brand}"; rerun with --force to switch`);
    }
  } catch (error) {
    fail(`cannot read existing active brand config: ${error.message}`);
  }
}

const optionalInputs = {
  logo: flag('logo'),
  mascot: flag('mascot'),
  font_display: flag('font-display'),
  font_body: flag('font-body'),
};

for (const [key, input] of Object.entries(optionalInputs)) {
  if (input && (!fs.existsSync(path.resolve(input)) || !fs.statSync(path.resolve(input)).isFile())) {
    fail(`${key} asset is not a readable file: ${input}`);
  }
}

const preservedOptionalAssets = {};
const existingManifestPath = path.join(destination, 'brand.json');
if (force && fs.existsSync(existingManifestPath)) {
  try {
    const existingManifest = JSON.parse(fs.readFileSync(existingManifestPath, 'utf8'));
    for (const [key, relativePath] of Object.entries(existingManifest.optional_assets ?? {})) {
      const resolved = path.resolve(destination, relativePath);
      if (resolved.startsWith(`${destination}${path.sep}`) && fs.existsSync(resolved)) {
        preservedOptionalAssets[key] = relativePath;
      }
    }
  } catch {
    // A forced update may repair an unreadable legacy manifest.
  }
}

fs.mkdirSync(brandsRoot, { recursive: true });
fs.cpSync(sourcePack, destination, { recursive: true, force: true });
fs.mkdirSync(path.join(destination, 'assets'), { recursive: true });
for (const legacyFile of ['visual.md', 'theme.css']) {
  fs.rmSync(path.join(destination, legacyFile), { force: true });
}

const manifestPath = path.join(destination, 'brand.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
manifest.optional_assets = preservedOptionalAssets;

for (const [key, input] of Object.entries(optionalInputs)) {
  if (!input) continue;
  const source = path.resolve(input);
  const extension = path.extname(source).toLowerCase();
  const filename = `${key.replaceAll('_', '-')}${extension}`;
  const output = path.join(destination, 'assets', filename);
  fs.copyFileSync(source, output);
  manifest.optional_assets[key] = path.posix.join('assets', filename);
}

fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
fs.writeFileSync(activePath, `${JSON.stringify({ schema_version: 1, brand: 'heygeist' }, null, 2)}\n`, 'utf8');
fs.copyFileSync(sourceDesign, designPath);

console.log(`installed HeyGeist context: ${destination}`);
console.log(`installed design system: ${designPath}`);
console.log(`active brand: heygeist`);
for (const [key, value] of Object.entries(manifest.optional_assets)) {
  console.log(`installed ${key}: ${value}`);
}
