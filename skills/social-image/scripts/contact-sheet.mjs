#!/usr/bin/env node
/** Combine candidate PNGs into a labeled contact sheet. */

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const argv = process.argv.slice(2);

function flag(name, fallback = null) {
  const index = argv.indexOf(`--${name}`);
  return index === -1 ? fallback : argv[index + 1];
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  })[character]);
}

const images = argv.filter((argument) => (
  !argument.startsWith('--')
  && /\.png$/i.test(argument)
  && fs.existsSync(argument)
));

if (!images.length) {
  console.error('usage: contact-sheet.mjs <a.png> <b.png> ... [--out sheet.png] [--cell 640]');
  process.exit(2);
}

const output = path.resolve(flag('out', 'contact-sheet.png'));
const cell = Number(flag('cell', 640));
if (!Number.isFinite(cell) || cell < 100) {
  console.error('--cell must be a number of at least 100');
  process.exit(2);
}

const gap = 36;
const padding = 40;
const labelHeight = 58;
const width = padding * 2 + images.length * cell + (images.length - 1) * gap;
const height = padding * 2 + cell + labelHeight;

const cards = images.map((image, index) => `
  <figure style="margin:0;width:${cell}px">
    <img src="${pathToFileURL(path.resolve(image)).href}" alt="Candidate ${index + 1}"
      style="display:block;width:${cell}px;height:${cell}px;object-fit:contain;background:#f4f4f4;border:1px solid #ddd;border-radius:14px">
    <figcaption style="margin-top:16px;font:600 20px/1.3 -apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;color:#171717">
      ${String.fromCharCode(65 + index)} · ${escapeHtml(path.basename(image))}
    </figcaption>
  </figure>`).join('');

const html = `<!doctype html><meta charset="utf-8">
<body style="margin:0;background:#fff;padding:${padding}px;display:flex;gap:${gap}px;align-items:flex-start">
${cards}
</body>`;

fs.mkdirSync(path.dirname(output), { recursive: true });
const temporaryHtml = path.join(path.dirname(output), `.contact-sheet-${process.pid}.html`);
fs.writeFileSync(temporaryHtml, html, 'utf8');

try {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(temporaryHtml).href, { waitUntil: 'networkidle' });
  await page.screenshot({ path: output, fullPage: false });
  await browser.close();
} finally {
  fs.rmSync(temporaryHtml, { force: true });
}

console.log(`  wrote ${path.relative(process.cwd(), output)} (${images.length} candidates)`);
