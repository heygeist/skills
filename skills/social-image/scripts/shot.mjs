#!/usr/bin/env node
/** Render social-image HTML to validated square, landscape, and portrait PNGs. */

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const CANVASES = {
  square: { width: 2048, height: 2048 },
  landscape: { width: 1200, height: 630 },
  portrait: { width: 1080, height: 1350 },
};

const REQUIRED_TOKENS = [
  '--si-bg',
  '--si-fg',
  '--si-accent',
  '--si-muted',
  '--si-surface',
  '--si-border',
  '--si-display-font',
  '--si-body-font',
];

const VALID_PROVENANCE = new Set(['real', 'example', 'generated']);
const argv = process.argv.slice(2);

function flag(name, fallback = null) {
  const index = argv.indexOf(`--${name}`);
  return index === -1 ? fallback : argv[index + 1];
}

function has(name) {
  return argv.includes(`--${name}`);
}

const htmlArg = argv.find((arg) => !arg.startsWith('--') && arg.endsWith('.html'));
if (!htmlArg) {
  console.error('usage: shot.mjs <html> [--out dir] [--basename name] [--canvas square,landscape,portrait] [--preview]');
  process.exit(2);
}

const html = path.resolve(htmlArg);
if (!fs.existsSync(html)) {
  console.error(`html source does not exist: ${html}`);
  process.exit(2);
}

const outDir = path.resolve(flag('out', path.join(path.dirname(html), 'exports')));
const basename = flag('basename', path.basename(html, '.html'));
const canvasKeys = flag('canvas', 'square,landscape,portrait')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

fs.mkdirSync(outDir, { recursive: true });

function pngSize(file) {
  const descriptor = fs.openSync(file, 'r');
  const buffer = Buffer.alloc(24);
  fs.readSync(descriptor, buffer, 0, 24, 0);
  fs.closeSync(descriptor);
  if (buffer.toString('ascii', 1, 4) !== 'PNG') return null;
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

const failures = [];
const warnings = [];
const written = [];
const browser = await chromium.launch({ args: ['--font-render-hinting=none'] });

for (const key of canvasKeys) {
  const canvas = CANVASES[key];
  if (!canvas) {
    failures.push(`unknown canvas "${key}"`);
    continue;
  }

  const page = await browser.newPage({
    viewport: canvas,
    deviceScaleFactor: 1,
  });
  const pageErrors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') pageErrors.push(message.text());
  });
  page.on('pageerror', (error) => pageErrors.push(String(error)));

  await page.goto(pathToFileURL(html).href, { waitUntil: 'networkidle' });
  await page.evaluate((canvasKey) => {
    document.documentElement.dataset.canvas = canvasKey;
  }, key);
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));

  const diagnostics = await page.evaluate(({ requiredTokens, validProvenance }) => {
    const rootStyles = getComputedStyle(document.documentElement);
    const missingTokens = requiredTokens.filter((token) => !rootStyles.getPropertyValue(token).trim());
    const brokenImages = [...document.images]
      .filter((image) => !image.complete || image.naturalWidth === 0)
      .map((image) => image.currentSrc || image.src || image.alt || '(unnamed image)');
    const invalidProvenance = [...document.querySelectorAll('[data-provenance]')]
      .map((element) => element.getAttribute('data-provenance'))
      .filter((value) => !validProvenance.includes(value));
    const missingProvenance = [...document.querySelectorAll('.proof')]
      .filter((element) => !element.hasAttribute('data-provenance'))
      .length;
    const frame = document.querySelector('.frame');
    const documentElement = document.documentElement;

    return {
      missingTokens,
      brokenImages,
      invalidProvenance,
      missingProvenance,
      hasFrame: Boolean(frame),
      documentOverflow: {
        width: documentElement.scrollWidth - documentElement.clientWidth,
        height: documentElement.scrollHeight - documentElement.clientHeight,
      },
      frameOverflow: frame
        ? {
            width: frame.scrollWidth - frame.clientWidth,
            height: frame.scrollHeight - frame.clientHeight,
          }
        : null,
    };
  }, { requiredTokens: REQUIRED_TOKENS, validProvenance: [...VALID_PROVENANCE] });

  if (pageErrors.length) {
    failures.push(`[${key}] ${pageErrors.length} browser error(s): ${pageErrors.slice(0, 3).join(' | ')}`);
  }
  if (diagnostics.missingTokens.length) {
    failures.push(`[${key}] missing design tokens: ${diagnostics.missingTokens.join(', ')}`);
  }
  if (diagnostics.brokenImages.length) {
    failures.push(`[${key}] broken image(s): ${diagnostics.brokenImages.join(', ')}`);
  }
  if (diagnostics.invalidProvenance.length) {
    failures.push(`[${key}] invalid provenance value(s): ${diagnostics.invalidProvenance.join(', ')}`);
  }
  if (diagnostics.missingProvenance) {
    failures.push(`[${key}] ${diagnostics.missingProvenance} .proof element(s) missing data-provenance`);
  }
  if (diagnostics.documentOverflow.width > 2 || diagnostics.documentOverflow.height > 2) {
    failures.push(`[${key}] document overflow: ${diagnostics.documentOverflow.width}px × ${diagnostics.documentOverflow.height}px`);
  }
  if (!diagnostics.hasFrame) {
    warnings.push(`[${key}] no .frame element; frame overflow could not be checked`);
  } else if (diagnostics.frameOverflow.width > 2 || diagnostics.frameOverflow.height > 2) {
    failures.push(`[${key}] frame overflow: ${diagnostics.frameOverflow.width}px × ${diagnostics.frameOverflow.height}px`);
  }

  const headline = await page.evaluate(() => {
    const element = document.querySelector('h1');
    const frame = document.querySelector('.frame');
    if (!element || !frame) return null;

    const frameStyles = getComputedStyle(frame);
    const contentWidth = frame.clientWidth
      - Number.parseFloat(frameStyles.paddingLeft)
      - Number.parseFloat(frameStyles.paddingRight);
    const range = document.createRange();
    range.selectNodeContents(element);
    const rows = new Map();

    for (const rect of range.getClientRects()) {
      if (rect.width < 1) continue;
      const row = Math.round(rect.top);
      const current = rows.get(row) ?? { left: rect.left, right: rect.right };
      rows.set(row, {
        left: Math.min(current.left, rect.left),
        right: Math.max(current.right, rect.right),
      });
    }

    return {
      contentWidth,
      lineWidths: [...rows.values()].map((row) => Math.round(row.right - row.left)),
    };
  });

  if (!headline) {
    warnings.push(`[${key}] no h1 headline found`);
  } else {
    const percentages = headline.lineWidths.map((width) => Math.round((width / headline.contentWidth) * 1000) / 10);
    if (percentages.some((percentage) => percentage >= 92)) {
      failures.push(`[${key}] headline line width ${percentages.join('%, ')}% is at wrap risk`);
    } else {
      console.log(`  ok  [${key}] headline lines ${percentages.join('%, ')}%`);
    }
  }

  const output = path.join(outDir, `${basename}-${key}.png`);
  await page.screenshot({ path: output, fullPage: false });
  written.push(output);

  const size = pngSize(output);
  if (!size || size.width !== canvas.width || size.height !== canvas.height) {
    failures.push(`[${key}] output dimensions are ${size ? `${size.width}x${size.height}` : 'unreadable'}; expected ${canvas.width}x${canvas.height}`);
  }

  if (has('preview') && key === 'square') {
    await page.setViewportSize({ width: 360, height: 360 });
    await page.evaluate(() => {
      document.documentElement.style.zoom = String(360 / 2048);
    });
    const preview = path.join(outDir, `${basename}-360-preview.png`);
    await page.screenshot({ path: preview, fullPage: false });
    written.push(preview);
  }

  await page.close();
}

await browser.close();

for (const file of written) console.log(`  wrote ${path.relative(process.cwd(), file)}`);
for (const warning of warnings) console.log(`  WARN  ${warning}`);
for (const failure of failures) console.log(`  FAIL  ${failure}`);
console.log(failures.length ? `\n${failures.length} gate failure(s).` : `\nall gates passed${warnings.length ? ` (${warnings.length} warning)` : ''}.`);
process.exit(failures.length ? 1 : 0);
