#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bundleRoot = path.join(packageRoot, 'skills');
const packageJson = JSON.parse(fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf8'));
const ignoredNames = new Set(['.DS_Store', 'node_modules']);
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

function fail(message, code = 1) {
  const error = new Error(message);
  error.exitCode = code;
  throw error;
}

function parseArguments(argv) {
  const options = {
    command: null,
    skills: [],
    scope: 'user',
    target: null,
    force: false,
    dryRun: false,
    skipDependencies: false,
    skipBrowser: false,
    json: false,
    help: false,
    version: false,
  };

  const positional = [];
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--scope' || argument === '--target') {
      const value = argv[index + 1];
      if (!value || value.startsWith('--')) fail(`${argument} requires a value`);
      options[argument === '--scope' ? 'scope' : 'target'] = value;
      index += 1;
    } else if (argument === '--force') options.force = true;
    else if (argument === '--dry-run') options.dryRun = true;
    else if (argument === '--skip-deps') options.skipDependencies = true;
    else if (argument === '--skip-browser') options.skipBrowser = true;
    else if (argument === '--json') options.json = true;
    else if (argument === '--help' || argument === '-h') options.help = true;
    else if (argument === '--version' || argument === '-v') options.version = true;
    else if (argument.startsWith('-')) fail(`unknown option: ${argument}`);
    else positional.push(argument);
  }

  options.command = positional[0] ?? 'install';
  options.skills = positional.slice(1);
  if (!['install', 'list'].includes(options.command)) {
    if (availableSkills().includes(options.command)) {
      options.skills = positional;
      options.command = 'install';
    } else {
      fail(`unknown command: ${options.command}`);
    }
  }
  if (!['user', 'repo'].includes(options.scope)) fail('--scope must be user or repo');
  if (options.skipDependencies) options.skipBrowser = true;
  return options;
}

function skillMetadata(directory) {
  const skillFile = path.join(directory, 'SKILL.md');
  if (!fs.existsSync(skillFile) || !fs.statSync(skillFile).isFile()) return null;
  const content = fs.readFileSync(skillFile, 'utf8');
  const match = content.match(/^---\n[\s\S]*?^name:\s*([^\n]+)\n[\s\S]*?^---$/m);
  if (!match) fail(`invalid SKILL.md frontmatter: ${skillFile}`);
  return { name: match[1].trim(), directory };
}

function availableSkills() {
  if (!fs.existsSync(bundleRoot)) return [];
  return fs.readdirSync(bundleRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => skillMetadata(path.join(bundleRoot, entry.name)))
    .filter(Boolean)
    .map((entry) => entry.name)
    .sort();
}

function findRepositoryRoot(start) {
  let current = path.resolve(start);
  while (true) {
    if (fs.existsSync(path.join(current, '.git'))) return current;
    const parent = path.dirname(current);
    if (parent === current) return null;
    current = parent;
  }
}

function expandTarget(value) {
  if (value === '~') return os.homedir();
  if (value.startsWith(`~${path.sep}`) || value.startsWith('~/')) {
    return path.join(os.homedir(), value.slice(2));
  }
  return path.resolve(value);
}

function resolveSkillsRoot(options) {
  if (options.target) return expandTarget(options.target);
  if (options.scope === 'user') return path.join(os.homedir(), '.agents', 'skills');
  const repositoryRoot = findRepositoryRoot(process.cwd());
  if (!repositoryRoot) fail('--scope repo requires running inside a Git repository or using --target');
  return path.join(repositoryRoot, '.agents', 'skills');
}

function assertSafeRoot(target) {
  const resolved = path.resolve(target);
  if (path.parse(resolved).root === resolved) fail('refusing to use a filesystem root as the skills target');
  if (resolved === os.homedir()) fail('refusing to use the home directory itself as the skills target');
  return resolved;
}

function isWithin(root, target) {
  const relative = path.relative(path.resolve(root), path.resolve(target));
  return relative !== '' && !relative.startsWith('..') && !path.isAbsolute(relative);
}

function collectFiles(root, relative = '') {
  const files = [];
  for (const entry of fs.readdirSync(path.join(root, relative), { withFileTypes: true })) {
    if (ignoredNames.has(entry.name)) continue;
    const child = path.join(relative, entry.name);
    if (entry.isDirectory()) files.push(...collectFiles(root, child));
    else if (entry.isFile()) files.push(child);
    else fail(`unsupported bundled entry: ${path.join(root, child)}`);
  }
  return files.sort();
}

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function bundleMatches(source, destination) {
  if (!fs.existsSync(destination) || !fs.statSync(destination).isDirectory()) return false;
  const files = collectFiles(source);
  return files.every((relative) => {
    const installed = path.join(destination, relative);
    return fs.existsSync(installed)
      && fs.statSync(installed).isFile()
      && sha256(path.join(source, relative)) === sha256(installed);
  });
}

function copyBundle(source, destination) {
  fs.mkdirSync(destination, { recursive: true });
  for (const relative of collectFiles(source)) {
    const output = path.join(destination, relative);
    fs.mkdirSync(path.dirname(output), { recursive: true });
    fs.copyFileSync(path.join(source, relative), output);
  }
}

function dependencyReady(skillRoot) {
  const manifest = path.join(skillRoot, 'package.json');
  if (!fs.existsSync(manifest)) return true;
  const parsed = JSON.parse(fs.readFileSync(manifest, 'utf8'));
  const dependencies = Object.keys(parsed.dependencies ?? {});
  return dependencies.every((name) => fs.existsSync(path.join(skillRoot, 'node_modules', name, 'package.json')));
}

function run(command, args, cwd, quiet) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    stdio: quiet ? 'pipe' : 'inherit',
  });
  if (result.status !== 0) {
    const detail = quiet ? `${result.stdout ?? ''}${result.stderr ?? ''}`.trim() : '';
    fail(`${command} ${args.join(' ')} failed${detail ? `: ${detail}` : ''}`);
  }
}

function installDependencies(skillRoot, options) {
  const manifestPath = path.join(skillRoot, 'package.json');
  const lockPath = path.join(skillRoot, 'package-lock.json');
  if (!fs.existsSync(manifestPath) || !fs.existsSync(lockPath)) return false;
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  if (!Object.keys(manifest.dependencies ?? {}).length) return false;

  run(npmCommand, ['ci', '--omit=dev', '--ignore-scripts'], skillRoot, options.json);
  if (!options.skipBrowser && manifest.dependencies?.playwright) {
    const playwrightCli = path.join(skillRoot, 'node_modules', 'playwright', 'cli.js');
    run(process.execPath, [playwrightCli, 'install', 'chromium'], skillRoot, options.json);
  }
  return true;
}

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

function renderHelp() {
  return `HeyGeist Skills ${packageJson.version}

Usage:
  heygeist-skills install [skill...] [options]
  heygeist-skills [skill...] [options]
  heygeist-skills list [--json]

Options:
  --scope user|repo   Install to ~/.agents/skills or <repo>/.agents/skills (default: user)
  --target <path>     Install directly into a custom skills directory
  --force             Replace changed installations after creating a backup
  --dry-run           Show the plan without writing files or installing dependencies
  --skip-deps         Copy skills without npm dependencies
  --skip-browser      Install npm dependencies without downloading Chromium
  --json              Print machine-readable output
  --version           Print the installer version
  --help              Show this help

Available skills: ${availableSkills().join(', ')}`;
}

function install(options) {
  const available = availableSkills();
  if (!available.length) fail('the npm package contains no skills');
  const selected = options.skills.length ? [...new Set(options.skills)] : available;
  const unknown = selected.filter((name) => !available.includes(name));
  if (unknown.length) fail(`unknown skill${unknown.length === 1 ? '' : 's'}: ${unknown.join(', ')}`);

  const skillsRoot = assertSafeRoot(resolveSkillsRoot(options));
  const backupRoot = path.join(path.dirname(skillsRoot), 'skill-backups', timestamp());
  const operationId = `${process.pid}-${crypto.randomBytes(5).toString('hex')}`;
  const plan = selected.map((name) => {
    const source = path.join(bundleRoot, name);
    const destination = path.join(skillsRoot, name);
    if (!isWithin(skillsRoot, destination)) fail(`skill destination escapes target: ${name}`);
    const exists = fs.existsSync(destination);
    const matches = exists && bundleMatches(source, destination);
    const needsDependencies = !options.skipDependencies && !dependencyReady(destination);
    const action = !exists ? 'install' : matches && !options.force && !needsDependencies ? 'unchanged' : matches && !options.force ? 'repair' : 'update';
    if (exists && !matches && !options.force) {
      fail(`${name} differs from the packaged version; rerun with --force to back it up and replace it`);
    }
    return {
      name,
      source,
      destination,
      exists,
      matches,
      needsDependencies,
      action,
      backup: exists && action !== 'unchanged' ? path.join(backupRoot, name) : null,
      stage: path.join(skillsRoot, `.${name}.${operationId}.tmp`),
    };
  });

  const summary = {
    package: packageJson.name,
    version: packageJson.version,
    scope: options.target ? 'custom' : options.scope,
    target: skillsRoot,
    dry_run: options.dryRun,
    skills: plan.map(({ name, destination, action, backup }) => ({ name, destination, action, backup })),
    dependencies: options.skipDependencies ? 'skipped' : options.skipBrowser ? 'npm-only' : 'npm-and-chromium',
  };
  if (options.dryRun) return summary;

  fs.mkdirSync(skillsRoot, { recursive: true });
  const changed = plan.filter((item) => item.action !== 'unchanged');
  const staged = [];
  try {
    for (const item of changed) {
      if (!isWithin(skillsRoot, item.stage)) fail(`unsafe staging path for ${item.name}`);
      fs.rmSync(item.stage, { recursive: true, force: true });
      copyBundle(item.source, item.stage);
      if (!options.skipDependencies) installDependencies(item.stage, options);
      fs.writeFileSync(path.join(item.stage, '.heygeist-install.json'), `${JSON.stringify({
        package: packageJson.name,
        version: packageJson.version,
        skill: item.name,
        installed_at: new Date().toISOString(),
      }, null, 2)}\n`, 'utf8');
      staged.push(item);
    }
  } catch (error) {
    for (const item of staged) fs.rmSync(item.stage, { recursive: true, force: true });
    for (const item of changed) fs.rmSync(item.stage, { recursive: true, force: true });
    throw error;
  }

  const committed = [];
  const backedUp = [];
  try {
    for (const item of changed) {
      if (item.exists) {
        fs.mkdirSync(path.dirname(item.backup), { recursive: true });
        fs.renameSync(item.destination, item.backup);
        backedUp.push(item);
      }
      fs.renameSync(item.stage, item.destination);
      committed.push(item);
    }
  } catch (error) {
    for (const item of committed.reverse()) fs.rmSync(item.destination, { recursive: true, force: true });
    for (const item of backedUp.reverse()) {
      if (fs.existsSync(item.backup)) fs.renameSync(item.backup, item.destination);
    }
    for (const item of changed) fs.rmSync(item.stage, { recursive: true, force: true });
    fail(`installation failed and was rolled back: ${error.message}`);
  }

  return summary;
}

function printSummary(summary, json) {
  if (json) {
    console.log(JSON.stringify(summary, null, 2));
    return;
  }
  console.log(`${summary.dry_run ? 'Install plan' : 'HeyGeist skills ready'}: ${summary.target}`);
  for (const skill of summary.skills) {
    console.log(`  ${skill.action.padEnd(9)} ${skill.name}`);
    if (skill.backup && skill.action !== 'unchanged') console.log(`             backup: ${skill.backup}`);
  }
  if (!summary.dry_run) console.log('Restart Codex if the new skills do not appear automatically.');
}

let parsed;
try {
  parsed = parseArguments(process.argv.slice(2));
  if (parsed.help) console.log(renderHelp());
  else if (parsed.version) console.log(packageJson.version);
  else if (parsed.command === 'list') {
    const skills = availableSkills();
    if (parsed.json) console.log(JSON.stringify({ package: packageJson.name, version: packageJson.version, skills }, null, 2));
    else console.log(skills.join('\n'));
  } else {
    printSummary(install(parsed), parsed.json);
  }
} catch (error) {
  if (parsed?.json || process.argv.includes('--json')) {
    console.error(JSON.stringify({ error: error.message }, null, 2));
  } else {
    console.error(`Error: ${error.message}`);
  }
  process.exit(error.exitCode ?? 1);
}
