import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cli = path.join(repositoryRoot, 'bin', 'heygeist-skills.mjs');

function temporaryDirectory(label) {
  return fs.mkdtempSync(path.join(os.tmpdir(), `${label}-`));
}

function run(args, cwd = repositoryRoot) {
  return spawnSync(process.execPath, [cli, ...args], { cwd, encoding: 'utf8' });
}

function json(result) {
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return JSON.parse(result.stdout);
}

test('lists every bundled skill', () => {
  const result = json(run(['list', '--json']));
  assert.deepEqual(result.skills, ['setup-social-image', 'social-image']);
});

test('installs both skills and repeats without mutation', () => {
  const temporary = temporaryDirectory('heygeist-install-all');
  const target = path.join(temporary, 'skills');
  try {
    const installed = json(run(['install', '--target', target, '--skip-deps', '--json']));
    assert.deepEqual(installed.skills.map((entry) => entry.action), ['install', 'install']);

    for (const name of ['setup-social-image', 'social-image']) {
      const skillRoot = path.join(target, name);
      assert.equal(fs.existsSync(path.join(skillRoot, 'SKILL.md')), true);
      assert.equal(fs.existsSync(path.join(skillRoot, '.heygeist-install.json')), true);
      assert.equal(fs.existsSync(path.join(skillRoot, 'node_modules')), false);
    }

    const repeated = json(run(['install', '--target', target, '--skip-deps', '--json']));
    assert.deepEqual(repeated.skills.map((entry) => entry.action), ['unchanged', 'unchanged']);
    assert.equal(fs.existsSync(path.join(temporary, 'skill-backups')), false);
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
});

test('dry run reports the plan without creating its target', () => {
  const temporary = temporaryDirectory('heygeist-dry-run');
  const target = path.join(temporary, 'skills');
  try {
    const result = json(run(['social-image', '--target', target, '--skip-deps', '--dry-run', '--json']));
    assert.equal(result.dry_run, true);
    assert.equal(result.skills[0].action, 'install');
    assert.equal(fs.existsSync(target), false);
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
});

test('changed installations require force and are backed up on replacement', () => {
  const temporary = temporaryDirectory('heygeist-force');
  const target = path.join(temporary, 'skills');
  try {
    json(run(['setup-social-image', '--target', target, '--skip-deps', '--json']));
    const skillFile = path.join(target, 'setup-social-image', 'SKILL.md');
    fs.appendFileSync(skillFile, '\nLOCAL CHANGE\n', 'utf8');

    const blocked = run(['setup-social-image', '--target', target, '--skip-deps', '--json']);
    assert.notEqual(blocked.status, 0);
    assert.match(blocked.stderr, /rerun with --force/);
    assert.match(fs.readFileSync(skillFile, 'utf8'), /LOCAL CHANGE/);

    const replaced = json(run(['setup-social-image', '--target', target, '--skip-deps', '--force', '--json']));
    assert.equal(replaced.skills[0].action, 'update');
    assert.ok(replaced.skills[0].backup);
    assert.match(fs.readFileSync(path.join(replaced.skills[0].backup, 'SKILL.md'), 'utf8'), /LOCAL CHANGE/);
    assert.doesNotMatch(fs.readFileSync(skillFile, 'utf8'), /LOCAL CHANGE/);
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
});

test('repo scope installs at the repository root from a nested directory', () => {
  const temporary = temporaryDirectory('heygeist-repo-scope');
  const nested = path.join(temporary, 'packages', 'example');
  try {
    fs.mkdirSync(path.join(temporary, '.git'));
    fs.mkdirSync(nested, { recursive: true });
    const result = json(run(['social-image', '--scope', 'repo', '--skip-deps', '--json'], nested));
    assert.equal(result.target, path.join(fs.realpathSync(temporary), '.agents', 'skills'));
    assert.equal(fs.existsSync(path.join(result.target, 'social-image', 'SKILL.md')), true);
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
});

test('unknown skills fail before creating a target', () => {
  const temporary = temporaryDirectory('heygeist-unknown');
  const target = path.join(temporary, 'skills');
  try {
    const result = run(['install', 'unknown-skill', '--target', target, '--skip-deps']);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /unknown skill/);
    assert.equal(fs.existsSync(target), false);
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
});

test('npm package contains the CLI and complete skill bundles', () => {
  const packed = spawnSync('npm', ['pack', '--dry-run', '--json', '--ignore-scripts'], {
    cwd: repositoryRoot,
    encoding: 'utf8',
  });
  assert.equal(packed.status, 0, packed.stderr || packed.stdout);
  const [result] = JSON.parse(packed.stdout);
  const files = new Set(result.files.map((entry) => entry.path));
  assert.equal(files.has('bin/heygeist-skills.mjs'), true);
  assert.equal(files.has('skills/setup-social-image/SKILL.md'), true);
  assert.equal(files.has('skills/social-image/SKILL.md'), true);
  assert.equal([...files].some((file) => file.includes('/node_modules/')), false);
});
