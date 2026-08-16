#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const setupDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const socialImageDir = path.resolve(setupDir, '..', 'social-image');
const installer = path.join(setupDir, 'scripts', 'install.mjs');
const resolver = path.join(socialImageDir, 'scripts', 'resolve-brand.mjs');
const renderer = path.join(socialImageDir, 'scripts', 'shot.mjs');
const temporaryWorkspace = fs.mkdtempSync(path.join(os.tmpdir(), 'setup-heygeist-smoke-'));

function run(command, args, options = {}) {
  return spawnSync(command, args, {
    cwd: setupDir,
    encoding: 'utf8',
    ...options,
  });
}

try {
  const logo = path.join(temporaryWorkspace, 'approved-logo.svg');
  fs.writeFileSync(logo, '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"/>\n', 'utf8');
  const install = run(process.execPath, [installer, '--target', temporaryWorkspace, '--logo', logo]);
  if (install.status !== 0) throw new Error(install.stderr || 'installer failed');

  const nestedWorkspace = path.join(temporaryWorkspace, 'projects', 'sample');
  fs.mkdirSync(nestedWorkspace, { recursive: true });
  const resolve = run(process.execPath, [resolver, nestedWorkspace]);
  if (resolve.status !== 0) throw new Error(resolve.stderr || 'resolver failed');
  const result = JSON.parse(resolve.stdout);
  if (!result.found || result.brand !== 'heygeist') throw new Error('HeyGeist pack did not resolve');
  if (!result.optional_assets.logo) throw new Error('approved optional logo did not resolve');

  const duplicate = run(process.execPath, [installer, '--target', temporaryWorkspace]);
  if (duplicate.status === 0) throw new Error('installer overwrote an existing pack without --force');

  const update = run(process.execPath, [installer, '--target', temporaryWorkspace, '--force']);
  if (update.status !== 0) throw new Error(update.stderr || 'forced update failed');

  const project = path.join(temporaryWorkspace, 'integration-post');
  const exportsDir = path.join(project, 'exports');
  fs.mkdirSync(project, { recursive: true });
  const baseCss = fs.readFileSync(path.join(socialImageDir, 'assets', 'base.css'), 'utf8');
  const themeCss = fs.readFileSync(result.files.theme, 'utf8');
  const tokenBlock = themeCss.match(/\/\* SOCIAL-IMAGE-TOKENS:START \*\/[\s\S]*?\/\* SOCIAL-IMAGE-TOKENS:END \*\//)?.[0];
  if (!tokenBlock) throw new Error('HeyGeist theme does not contain a token block');
  const themedCss = baseCss.replace(
    /\/\* SOCIAL-IMAGE-TOKENS:START \*\/[\s\S]*?\/\* SOCIAL-IMAGE-TOKENS:END \*\//,
    tokenBlock,
  );
  fs.writeFileSync(path.join(project, 'base.css'), themedCss, 'utf8');
  const example = fs.readFileSync(path.join(socialImageDir, 'assets', 'example.html'), 'utf8')
    .replace('YOUR BRAND', 'HEYGEIST');
  fs.writeFileSync(path.join(project, 'post.html'), example, 'utf8');

  const render = run(process.execPath, [
    renderer,
    path.join(project, 'post.html'),
    '--out',
    exportsDir,
    '--basename',
    'heygeist',
    '--canvas',
    'square',
  ]);
  if (render.status !== 0) throw new Error(render.stderr || render.stdout || 'themed render failed');
  if (!fs.existsSync(path.join(exportsDir, 'heygeist-square.png'))) {
    throw new Error('themed integration render was not written');
  }

  console.log('setup-heygeist smoke test passed');
} finally {
  fs.rmSync(temporaryWorkspace, { recursive: true, force: true });
}
