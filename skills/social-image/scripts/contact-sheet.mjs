#!/usr/bin/env node
/**
 * Compose candidate renders into one contact sheet, so consistency between
 * variants reads at a glance.
 *
 * Usage:
 *   node .agents/skills/geist-social-image/scripts/contact-sheet.mjs \
 *     projects/posts/<slug>/working/*-2048.png \
 *     --out projects/posts/<slug>/working/contact-sheet.png
 *
 * Options:
 *   --out <file>    output path (default: ./contact-sheet.png)
 *   --cell <px>     rendered width per candidate (default: 640)
 *
 * Uses the browser we already depend on rather than an image library: the sheet
 * is laid out in HTML and screenshotted, same path as every other render here.
 */

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice(2);
const flag = (n, d = null) => { const i = argv.indexOf(`--${n}`); return i === -1 ? d : argv[i + 1]; };

const images = argv.filter((a) => !a.startsWith('--') && /\.png$/i.test(a) && fs.existsSync(a));
if (!images.length) {
  console.error('usage: contact-sheet.mjs <a.png> <b.png> ... [--out sheet.png] [--cell 640]');
  process.exit(2);
}
const out = path.resolve(flag('out', 'contact-sheet.png'));
const cell = Number(flag('cell', 640));
const gap = 36;
const pad = 40;
const labelH = 58;

// Candidates are square masters; a non-square input still fits because the cell
// is width-constrained and the row is aligned to the tallest item.
const width = pad * 2 + images.length * cell + (images.length - 1) * gap;
const height = pad * 2 + cell + labelH;

const cards = images.map((p, i) => `
  <figure style="margin:0;width:${cell}px">
    <img src="file://${path.resolve(p)}" style="display:block;width:${cell}px;height:auto;
         border:1px solid #ECE7DE;border-radius:14px">
    <figcaption style="margin-top:16px;font:600 20px/1.3 -apple-system,system-ui,sans-serif;
         color:#20201C">${String.fromCharCode(65 + i)} · ${path.basename(p)}</figcaption>
  </figure>`).join('');

const html = `<!doctype html><meta charset="utf-8">
<body style="margin:0;background:#fff;padding:${pad}px;display:flex;gap:${gap}px;align-items:flex-start">
${cards}
</body>`;

const tmp = path.join(path.dirname(out), `.contact-sheet-${process.pid}.html`);
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(tmp, html, 'utf8');

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
await page.goto(`file://${tmp}`, { waitUntil: 'networkidle' });
await page.screenshot({ path: out, fullPage: false });
await browser.close();
fs.unlinkSync(tmp);

console.log(`  wrote ${path.relative(process.cwd(), out)}  (${images.length} candidates)`);
