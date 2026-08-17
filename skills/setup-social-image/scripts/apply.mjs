#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice(2);
const categories = new Set([
  'logos',
  'mascots',
  'icons',
  'illustrations',
  'photos',
  'fonts',
  'templates',
  'references',
  'other',
]);
const statuses = new Set(['canonical', 'reference-only']);

function flag(name) {
  const index = argv.indexOf(`--${name}`);
  return index === -1 ? null : argv[index + 1];
}

function has(name) {
  return argv.includes(`--${name}`);
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

function readJson(target, label) {
  try {
    return JSON.parse(fs.readFileSync(target, 'utf8'));
  } catch (error) {
    fail(`cannot read ${label}: ${error.message}`);
  }
}

function requiredText(value, label) {
  if (typeof value !== 'string' || !value.trim()) fail(`${label} must be a non-empty string`);
  return value;
}

function validateId(value, label) {
  const id = requiredText(value, label);
  if (!/^[a-z0-9][a-z0-9-]*$/.test(id)) {
    fail(`${label} must use lowercase letters, digits, and hyphens`);
  }
  return id;
}

function sha256(target) {
  return crypto.createHash('sha256').update(fs.readFileSync(target)).digest('hex');
}

function within(root, target) {
  const relative = path.relative(path.resolve(root), path.resolve(target));
  return relative !== '' && !relative.startsWith('..') && !path.isAbsolute(relative);
}

function safeFilename(value, fallback) {
  const original = path.basename(value || fallback);
  const extension = path.extname(original).toLowerCase().replace(/[^a-z0-9.]/g, '');
  const stem = path.basename(original, path.extname(original))
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '') || fallback;
  return `${stem}${extension}`;
}

function collisionName(filename, hash, length = 8) {
  const extension = path.extname(filename);
  const stem = path.basename(filename, extension);
  return `${stem}-${hash.slice(0, length)}${extension}`;
}

function markdownCell(value) {
  return String(value ?? '')
    .replaceAll('\\', '\\\\')
    .replaceAll('|', '\\|')
    .replace(/\r?\n/g, ' ')
    .trim();
}

function renderSources(manifest) {
  const rows = [
    '# Social Image Sources',
    '',
    'Generated from `.social-image/asset-manifest.json`. Edit context through `$setup-social-image` so checksums and copied paths remain consistent.',
    '',
    '| ID | Role | Status | Type | Source | Copied path | Ownership / license | Restrictions | SHA-256 |',
    '|---|---|---|---|---|---|---|---|---|',
  ];

  for (const asset of manifest.assets) {
    rows.push(`| ${[
      asset.id,
      asset.role,
      asset.status,
      asset.type,
      asset.source,
      asset.path,
      `${asset.ownership}; ${asset.license}`,
      asset.restrictions,
      asset.sha256,
    ].map(markdownCell).join(' | ')} |`);
  }

  for (const reference of manifest.references) {
    rows.push(`| ${[
      reference.id,
      reference.role,
      reference.status,
      reference.type,
      reference.source,
      '',
      `${reference.ownership}; ${reference.license}`,
      reference.restrictions,
      '',
    ].map(markdownCell).join(' | ')} |`);
  }

  rows.push('');
  return `${rows.join('\n')}\n`;
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

function stageTextFile(target, content) {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const temporary = path.join(
    path.dirname(target),
    `.${path.basename(target)}.${process.pid}.${crypto.randomBytes(4).toString('hex')}.tmp`,
  );
  fs.writeFileSync(temporary, content, 'utf8');
  return temporary;
}

const targetArgument = flag('target');
const planArgument = flag('plan');
const dryRun = has('dry-run');
if (!targetArgument) fail('--target is required');
if (!planArgument) fail('--plan is required');

const target = path.resolve(targetArgument);
const planPath = path.resolve(planArgument);
if (!fs.existsSync(target) || !fs.statSync(target).isDirectory()) {
  fail(`target workspace is not a directory: ${target}`);
}
if (path.parse(target).root === target) fail('refusing to configure a filesystem root');
if (!fs.existsSync(planPath) || !fs.statSync(planPath).isFile()) {
  fail(`plan is not a readable file: ${planPath}`);
}

const plan = readJson(planPath, 'plan');
if (plan.schema_version !== 1) fail('plan must use schema_version 1');
if (!dryRun && plan.approved !== true) fail('plan must contain approved: true before workspace writes');
if (plan.assets !== undefined && !Array.isArray(plan.assets)) fail('plan.assets must be an array');
if (plan.references !== undefined && !Array.isArray(plan.references)) fail('plan.references must be an array');

const designMd = requiredText(plan.documents?.design_md, 'documents.design_md');
const contextMd = requiredText(plan.documents?.context_md, 'documents.context_md');
const captionMd = requiredText(plan.documents?.caption_md, 'documents.caption_md');
if (!designMd.startsWith('---\n') || !/^name:\s*.+$/m.test(designMd)) {
  fail('documents.design_md must contain DESIGN.md frontmatter with name');
}

const configRoot = path.join(target, '.social-image');
const assetsRoot = path.join(configRoot, 'assets');
const manifestPath = path.join(configRoot, 'asset-manifest.json');
let existingManifest = { schema_version: 1, assets: [], references: [] };
if (fs.existsSync(manifestPath)) {
  existingManifest = readJson(manifestPath, 'existing asset manifest');
  if (existingManifest.schema_version !== 1 || !Array.isArray(existingManifest.assets) || !Array.isArray(existingManifest.references)) {
    fail('existing asset-manifest.json has an unsupported schema');
  }
}

const seenIds = new Set();
const assetEntries = new Map(existingManifest.assets.map((entry) => [entry.id, entry]));
const referenceEntries = new Map(existingManifest.references.map((entry) => [entry.id, entry]));
const assetActions = [];
const scheduledOutputs = new Map();

for (const raw of plan.assets ?? []) {
  const id = validateId(raw.id, 'asset id');
  if (seenIds.has(id)) fail(`duplicate plan id: ${id}`);
  seenIds.add(id);
  if (!categories.has(raw.category)) fail(`asset ${id} has unsupported category: ${raw.category}`);
  if (!statuses.has(raw.status)) fail(`asset ${id} has unsupported status: ${raw.status}`);

  const sourcePath = path.resolve(requiredText(raw.source_path, `asset ${id} source_path`));
  if (!fs.existsSync(sourcePath) || !fs.statSync(sourcePath).isFile()) {
    fail(`asset ${id} source_path is not a readable file: ${sourcePath}`);
  }

  const hash = sha256(sourcePath);
  const categoryRoot = path.join(assetsRoot, raw.category);
  const existingIdentical = [...assetEntries.values()].find((entry) => {
    if (entry.category !== raw.category || entry.sha256 !== hash || typeof entry.path !== 'string') return false;
    const resolved = path.resolve(configRoot, entry.path);
    return within(assetsRoot, resolved) && fs.existsSync(resolved) && fs.statSync(resolved).isFile();
  });

  let output;
  let action;
  if (existingIdentical) {
    output = path.resolve(configRoot, existingIdentical.path);
    action = 'reuse';
  } else {
    const filename = safeFilename(raw.filename, id);
    output = path.join(categoryRoot, filename);
    if (scheduledOutputs.has(output)) {
      if (scheduledOutputs.get(output) === hash) {
        action = 'reuse';
      } else {
        let length = 8;
        output = path.join(categoryRoot, collisionName(filename, hash, length));
        while (
          (scheduledOutputs.has(output) && scheduledOutputs.get(output) !== hash)
          || (fs.existsSync(output) && sha256(output) !== hash)
        ) {
          length += 4;
          output = path.join(categoryRoot, collisionName(filename, hash, length));
        }
        action = scheduledOutputs.has(output) || fs.existsSync(output) ? 'reuse' : 'copy';
      }
    } else if (fs.existsSync(output)) {
      if (sha256(output) === hash) {
        action = 'reuse';
      } else {
        let length = 8;
        output = path.join(categoryRoot, collisionName(filename, hash, length));
        while (fs.existsSync(output) && sha256(output) !== hash) {
          length += 4;
          output = path.join(categoryRoot, collisionName(filename, hash, length));
        }
        action = fs.existsSync(output) ? 'reuse' : 'copy';
      }
    } else {
      action = 'copy';
    }
  }

  const entry = {
    id,
    category: raw.category,
    type: requiredText(raw.type, `asset ${id} type`),
    role: requiredText(raw.role, `asset ${id} role`),
    status: raw.status,
    source: requiredText(raw.source, `asset ${id} source`),
    ownership: requiredText(raw.ownership, `asset ${id} ownership`),
    license: requiredText(raw.license, `asset ${id} license`),
    restrictions: requiredText(raw.restrictions, `asset ${id} restrictions`),
    path: path.relative(configRoot, output).split(path.sep).join('/'),
    sha256: hash,
  };
  assetEntries.set(id, entry);
  referenceEntries.delete(id);
  scheduledOutputs.set(output, hash);
  assetActions.push({ id, action, source_path: sourcePath, output, entry });
}

for (const raw of plan.references ?? []) {
  const id = validateId(raw.id, 'reference id');
  if (seenIds.has(id)) fail(`duplicate plan id: ${id}`);
  seenIds.add(id);
  if (!statuses.has(raw.status)) fail(`reference ${id} has unsupported status: ${raw.status}`);
  referenceEntries.set(id, {
    id,
    type: requiredText(raw.type, `reference ${id} type`),
    role: requiredText(raw.role, `reference ${id} role`),
    status: raw.status,
    source: requiredText(raw.source, `reference ${id} source`),
    ownership: requiredText(raw.ownership, `reference ${id} ownership`),
    license: requiredText(raw.license, `reference ${id} license`),
    restrictions: requiredText(raw.restrictions, `reference ${id} restrictions`),
  });
  assetEntries.delete(id);
}

const manifest = {
  schema_version: 1,
  assets: [...assetEntries.values()].sort((left, right) => left.id.localeCompare(right.id)),
  references: [...referenceEntries.values()].sort((left, right) => left.id.localeCompare(right.id)),
};

const textTargets = [
  { label: 'DESIGN.md', target: path.join(target, 'DESIGN.md'), content: designMd },
  { label: 'context.md', target: path.join(configRoot, 'context.md'), content: contextMd },
  { label: 'caption.md', target: path.join(configRoot, 'caption.md'), content: captionMd },
  { label: 'sources.md', target: path.join(configRoot, 'sources.md'), content: renderSources(manifest) },
  { label: 'asset-manifest.json', target: manifestPath, content: `${JSON.stringify(manifest, null, 2)}\n` },
].map((item) => ({
  ...item,
  action: !fs.existsSync(item.target)
    ? 'create'
    : fs.readFileSync(item.target, 'utf8') === item.content
      ? 'unchanged'
      : 'update',
}));

const referencedPaths = new Set(manifest.assets.map((entry) => entry.path));
const orphanedAssets = collectFiles(assetsRoot)
  .map((file) => path.relative(configRoot, file).split(path.sep).join('/'))
  .filter((relative) => !referencedPaths.has(relative));
const legacyPaths = [
  path.join(configRoot, 'active-brand.json'),
  path.join(configRoot, 'brands'),
].filter((candidate) => fs.existsSync(candidate));

const summary = {
  target,
  dry_run: dryRun,
  approved: plan.approved === true,
  documents: textTargets.map(({ label, target: output, action }) => ({ label, path: output, action })),
  assets: assetActions.map(({ id, action, output, entry }) => ({ id, action, path: output, sha256: entry.sha256 })),
  orphaned_assets: orphanedAssets,
  preserved_legacy_paths: legacyPaths,
};

if (dryRun) {
  console.log(JSON.stringify(summary, null, 2));
  process.exit(0);
}

const stagedAssets = [];
for (const asset of assetActions.filter((item) => item.action === 'copy')) {
  fs.mkdirSync(path.dirname(asset.output), { recursive: true });
  const temporary = `${asset.output}.${process.pid}.${crypto.randomBytes(4).toString('hex')}.tmp`;
  fs.copyFileSync(asset.source_path, temporary);
  if (sha256(temporary) !== asset.entry.sha256) {
    fs.rmSync(temporary, { force: true });
    for (const staged of stagedAssets) fs.rmSync(staged.temporary, { force: true });
    fail(`checksum changed while copying asset ${asset.id}`);
  }
  stagedAssets.push({ ...asset, temporary });
}

const changedText = textTargets.filter((item) => item.action !== 'unchanged');
const stagedText = changedText.map((item) => ({ ...item, temporary: stageTextFile(item.target, item.content) }));
const existingChanged = changedText.filter((item) => fs.existsSync(item.target));
let backupPath = null;
if (existingChanged.length) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  backupPath = path.join(configRoot, 'backups', timestamp);
  fs.mkdirSync(backupPath, { recursive: true });
  for (const item of existingChanged) {
    fs.copyFileSync(item.target, path.join(backupPath, path.basename(item.target)));
  }
}

const committedAssets = [];
const committedText = [];
try {
  for (const asset of stagedAssets) {
    fs.renameSync(asset.temporary, asset.output);
    committedAssets.push(asset);
  }
  for (const item of stagedText) {
    fs.renameSync(item.temporary, item.target);
    committedText.push(item);
  }
} catch (error) {
  for (const item of committedText.reverse()) {
    if (existingChanged.some((existing) => existing.target === item.target)) {
      fs.copyFileSync(path.join(backupPath, path.basename(item.target)), item.target);
    } else {
      fs.rmSync(item.target, { force: true });
    }
  }
  for (const asset of committedAssets.reverse()) fs.rmSync(asset.output, { force: true });
  for (const asset of stagedAssets) fs.rmSync(asset.temporary, { force: true });
  for (const item of stagedText) fs.rmSync(item.temporary, { force: true });
  fail(`workspace transaction failed and was rolled back: ${error.message}`);
}

summary.backup = backupPath;
summary.orphaned_assets = collectFiles(assetsRoot)
  .map((file) => path.relative(configRoot, file).split(path.sep).join('/'))
  .filter((relative) => !referencedPaths.has(relative));
console.log(JSON.stringify(summary, null, 2));
