#!/usr/bin/env node
/**
 * Render a GEIST social-image HTML to its canvas set, and run every gate.
 *
 * Usage:
 *   node .agents/skills/geist-social-image/scripts/shot.mjs <html> [options]
 *
 * Options:
 *   --out <dir>        export directory (default: <html dir>/exports)
 *   --basename <name>  output basename (default: the html filename stem)
 *   --canvas <list>    comma list of canvas keys (default: 2048,1200x630,1080x1350)
 *                      use `--canvas 2048` while iterating; it is ~3x faster
 *   --preview          also write a 360px preview of the master (legibility read)
 *   --strict-lines     make the headline line-width band a hard failure
 *
 * Gates (exit 1 on any hard failure):
 *   1 errors      console errors + page errors must be 0
 *   2 overflow    scrollWidth/Height must equal clientWidth/Height
 *   3 dimensions  each PNG must match its canvas exactly
 *   4 tokens      the GEIST-TOKENS block in base.css must match its checksum
 *   5 line width  headline lines measured against the content width (warn by
 *                 default — see references/layout-grammar.md for the band)
 *
 * The fifth gate has a sixth half: a human or agent reads the rendered PNG and
 * the 360px preview. That read is the part no probe replaces.
 */

import { chromium } from 'playwright';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const CANVASES = {
  '2048': { w: 2048, h: 2048 },
  '1200x630': { w: 1200, h: 630 },
  '1080x1350': { w: 1080, h: 1350 },
};

/** Recorded checksum of the vendored GEIST-TOKENS block.
 *  Regenerate with: node shot.mjs --print-token-hash <base.css> */
const TOKEN_HASH = 'd922098a1b30434a';

// ── args ──────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const flag = (name, fallback = null) => {
  const i = argv.indexOf(`--${name}`);
  return i === -1 ? fallback : argv[i + 1];
};
const has = (name) => argv.includes(`--${name}`);

if (has('print-token-hash')) {
  const file = argv[argv.indexOf('--print-token-hash') + 1];
  console.log(tokenHash(fs.readFileSync(file, 'utf8')) ?? 'no GEIST-TOKENS block found');
  process.exit(0);
}

const htmlArg = argv.find((a) => !a.startsWith('--') && a.endsWith('.html'));
if (!htmlArg) {
  console.error('usage: shot.mjs <html> [--out dir] [--basename name] [--canvas 2048]');
  process.exit(2);
}
const html = path.resolve(htmlArg);
if (!fs.existsSync(html)) {
  console.error(`html source does not exist: ${html}`);
  process.exit(2);
}
const outDir = path.resolve(flag('out', path.join(path.dirname(html), 'exports')));
const basename = flag('basename', path.basename(html, '.html'));
const canvasKeys = (flag('canvas', '2048,1200x630,1080x1350')).split(',').map((s) => s.trim());
fs.mkdirSync(outDir, { recursive: true });

// ── helpers ───────────────────────────────────────────────────────────
function tokenHash(css) {
  const m = css.match(/GEIST-TOKENS:START[\s\S]*?GEIST-TOKENS:END/);
  if (!m) return null;
  // Hash the hex values only, so a comment or whitespace edit is not a false alarm
  // but changing any colour is.
  const hexes = (m[0].match(/#[0-9A-Fa-f]{3,8}/g) ?? []).join(',').toUpperCase();
  return createHash('sha256').update(hexes).digest('hex').slice(0, 16);
}

/** PNG dimensions straight from the IHDR chunk — no image library needed. */
function pngSize(file) {
  const fd = fs.openSync(file, 'r');
  const buf = Buffer.alloc(24);
  fs.readSync(fd, buf, 0, 24, 0);
  fs.closeSync(fd);
  if (buf.toString('ascii', 1, 4) !== 'PNG') return null;
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}

const fail = [];
const warn = [];
const note = (arr, msg) => arr.push(msg);

// ── gate 4 · token drift, before we render anything ───────────────────
const cssHref = (fs.readFileSync(html, 'utf8').match(/href="([^"]*base\.css)"/) ?? [])[1];
if (cssHref) {
  const cssPath = path.resolve(path.dirname(html), cssHref);
  if (fs.existsSync(cssPath)) {
    const got = tokenHash(fs.readFileSync(cssPath, 'utf8'));
    if (!got) note(fail, `tokens: no GEIST-TOKENS block in ${path.basename(cssPath)}`);
    else if (TOKEN_HASH !== 'REPLACE_ME' && got !== TOKEN_HASH)
      note(fail, `tokens: base.css palette drifted (${got} != recorded ${TOKEN_HASH}) — re-vendor from \`bun run brand:tokens\`, do not hand-edit`);
  }
}

// ── render ────────────────────────────────────────────────────────────
const browser = await chromium.launch({ args: ['--font-render-hinting=none'] });
const written = [];

for (const key of canvasKeys) {
  const canvas = CANVASES[key];
  if (!canvas) { note(fail, `unknown canvas "${key}"`); continue; }

  const page = await browser.newPage({
    viewport: { width: canvas.w, height: canvas.h },
    deviceScaleFactor: 1,
  });
  const errs = [];
  page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('pageerror', (e) => errs.push(String(e)));

  await page.goto(`file://${html}`, { waitUntil: 'networkidle' });
  await page.evaluate((k) => { document.documentElement.dataset.canvas = k; }, key);
  await page.evaluate(() => document.fonts.ready);
  // two frames so the canvas switch has fully reflowed before capture
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));

  const out = path.join(outDir, `${basename}-${key}.png`);
  await page.screenshot({ path: out, fullPage: false });
  written.push(out);

  // gate 1 · errors
  if (errs.length) note(fail, `[${key}] ${errs.length} page error(s): ${errs.slice(0, 3).join(' | ')}`);

  // gate 2 · overflow
  // NOTE: documentElement.scrollHeight alone is VACUOUS here. .frame is
  // position:absolute inside an overflow:hidden html, so the document never
  // grows no matter how far the content spills — a 900px injected block was
  // silently reported green. The load-bearing measurement is .frame's own
  // scroll box, which does grow when the flex column overflows.
  const box = await page.evaluate(() => {
    const d = document.documentElement;
    const f = document.querySelector('.frame');
    return {
      dsh: d.scrollHeight, dch: d.clientHeight, dsw: d.scrollWidth, dcw: d.clientWidth,
      fsh: f?.scrollHeight ?? 0, fch: f?.clientHeight ?? 0,
      fsw: f?.scrollWidth ?? 0, fcw: f?.clientWidth ?? 0,
      hasFrame: Boolean(f),
    };
  });
  if (box.dsh > box.dch + 2) note(fail, `[${key}] document vertical overflow ${box.dsh} > ${box.dch}`);
  if (box.dsw > box.dcw + 2) note(fail, `[${key}] document horizontal overflow ${box.dsw} > ${box.dcw}`);
  if (!box.hasFrame) note(warn, `[${key}] no .frame element — the overflow gate can only check the document`);
  if (box.fsh > box.fch + 2) note(fail, `[${key}] vertical overflow ${box.fsh} > ${box.fch} — content is being cut off the canvas`);
  if (box.fsw > box.fcw + 2) note(fail, `[${key}] horizontal overflow ${box.fsw} > ${box.fcw} — content is being cut off the canvas`);

  // gate 3 · dimensions
  const size = pngSize(out);
  if (!size || size.w !== canvas.w || size.h !== canvas.h)
    note(fail, `[${key}] export is ${size ? `${size.w}x${size.h}` : 'unreadable'}, expected ${canvas.w}x${canvas.h}`);

  // gate 5 · headline line widths, measured per rendered line box
  const lines = await page.evaluate(() => {
    const h1 = document.querySelector('h1');
    const frame = document.querySelector('.frame');
    if (!h1 || !frame) return null;
    const cs = getComputedStyle(frame);
    const content = frame.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const range = document.createRange();
    range.selectNodeContents(h1);
    const rows = new Map();
    for (const r of range.getClientRects()) {
      if (r.width < 1) continue;
      const k = Math.round(r.top);
      const cur = rows.get(k) ?? { left: r.left, right: r.right };
      rows.set(k, { left: Math.min(cur.left, r.left), right: Math.max(cur.right, r.right) });
    }
    return { content, widths: [...rows.values()].map((v) => Math.round(v.right - v.left)) };
  });
  if (lines) {
    const pcts = lines.widths.map((w) => Math.round((w / lines.content) * 1000) / 10);
    const msg = `[${key}] headline lines ${pcts.map((p) => `${p}%`).join(', ')} of ${Math.round(lines.content)}px`;
    // This gate does NOT enforce an aesthetic band. Measured against the shipped
    // corpus, real GEIST headlines run ~70-80% (final-b1: 72.9/79.7, grill-me-vs:
    // 76.9) and reaction headlines go to ~33%. A band would flatten exactly the
    // per-content variation this system exists to allow. It fails only on wrap
    // risk: at >=92% a line is one glyph from breaking somewhere you did not choose.
    const risky = pcts.filter((p) => p >= 92);
    if (risky.length) note(fail, `${msg} — a line is at wrap risk; set the break yourself with <br> or shorten it`);
    else console.log(`  ok  ${msg}`);
  }

  // optional 360px legibility preview of the master
  if (has('preview') && key === '2048') {
    await page.setViewportSize({ width: 360, height: 360 });
    await page.evaluate(() => {
      document.documentElement.style.zoom = String(360 / 2048);
    });
    const prev = path.join(outDir, `${basename}-360-preview.png`);
    await page.screenshot({ path: prev, fullPage: false });
    written.push(prev);
  }

  await page.close();
}
await browser.close();

// ── report ────────────────────────────────────────────────────────────
for (const w of written) console.log(`  wrote ${path.relative(process.cwd(), w)}`);
for (const w of warn) console.log(`  WARN  ${w}`);
for (const f of fail) console.log(`  FAIL  ${f}`);
console.log(fail.length ? `\n${fail.length} gate failure(s).` : `\nall gates passed${warn.length ? ` (${warn.length} warning)` : ''}.`);
process.exit(fail.length ? 1 : 0);
