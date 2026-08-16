# Visual Contract

Assets, provenance, crop, and export rules. The zone system, type scale, colour and
composition catalogue live in [layout-grammar.md](layout-grammar.md).

## Brand sources

| What | Where |
|---|---|
| Brandbook | `assets/brand/brandbook/index.html` |
| Wordmark | `assets/brand/brandbook/wordmark-primary.png` (1546×373) |
| Crownheart master | `assets/brand/brandbook/mascot.png` (835×940) |
| Crownheart frames | `assets/pets/heygeist-pets/crownheart-geist-frames/` (192×208 cells) |
| Thai font | `assets/references/fonts/NotoSansThai-Variable.ttf` |
| Latin fonts | `projects/videos/geist-pet-roam/assets/fonts/` + `assets/references/fonts/figtree-latin-700-normal.woff2` |
| Stylesheet | `templates/geist-social-image/base.css` |
| Worked example | `templates/geist-social-image/reference-example.html` (+ `.png`) |
| Renderer | `.agents/skills/geist-social-image/scripts/shot.mjs` |

Use the canonical files unchanged. **Never redraw, recolour, or generate the wordmark or
the mascot** (ADR-0002). A generated mascot is the worst version of this failure: it drifts
every time it is made.

## Per-post folders

- One self-contained project under `projects/posts/<post-slug>/`.
- `assets/` — **authentic captures only**. A file here is a real screenshot.
- `generated/` — **synthetic imagery only**, each with its `.json` sidecar.
- Editable HTML, `caption.md`, optional `PROCESS.md` at the project root.
- `exports/` — approved PNG deliverables only.
- `working/` — candidates, rejects, previews. Git-ignored.
- Never reuse another post's folder, even when starting from its HTML.

## Format

- Canvases: 2048×2048 master, 1200×630 link card, 1080×1350 portrait.
- Background: white. Ink `#20201C`. Muted `#7C7567`. Hairline `#ECE7DE`.
- Mango `#FF8442` / `#E5661D` / `#C24E0E`, one job each. Sky `#56C4F0`, illustration only.
- All colour comes from the vendored `GEIST-TOKENS` block. Hand-editing a hex fails the gate.

Exports are named `<post-slug>-2048.png`, `<post-slug>-1200x630.png`,
`<post-slug>-1080x1350.png`. The older `-1080`/`-2160` names belong to posts published
before the 2048 master; those posts are frozen and are not re-rendered.

## Provenance — three values, and only three

The label is a promise, not decoration. The tone doctrine is explicit: warmth is allowed in
what GEIST **promises**; fiction is not allowed in what GEIST **describes**.

| Label | Means | Source |
|---|---|---|
| `REAL …` (e.g. `Real response · Codex`) | a genuine capture | a file in `assets/` |
| `ตัวอย่าง · EXAMPLE` | a hand-built mock | authored in HTML |
| `ภาพประกอบ AI · AI ILLUSTRATION` | generated imagery | a file in `generated/` |

Rules:

- `REAL` over anything that is not a capture is a **release blocker**, not a style choice.
- Name an agent only if that agent produced it. `Real output` alone is correct when the
  post may travel into a community for a different tool.
- A mock is permitted — but it takes the `EXAMPLE` label with it.
- The folder is the gate: `assets/` ⇒ may be `REAL`; `generated/` ⇒ never.

## Authentic capture crop

- Store the untouched original in the post's `assets/`.
- Crop through CSS with `overflow:hidden`. **Never recreate product UI in HTML.**
- `margin:0` on `<figure>` containers — the browser default silently shifts an apparently
  centred panel.
- **Capture floor: ≥1600px wide** for a full-panel proof at 2048 (≈1.12× enlargement).
  Keep enlargement at or under ~1.15×; below the floor, UI text visibly softens. Capture at
  retina or zoom the source UI first.
- Preserve a product-identifying cue — the composer, prompt, controls, or app chrome.
- Scope crop widths per canvas; an unscoped width overflows the smaller canvases.

Example (source-specific coordinates, never a preset):

```css
.proof img{ width:1792px; top:50%; left:0; transform:translateY(-50%); }
html[data-canvas="1080x1350"] .proof img{ width:944px; }
```

## Visual QA

Automated gates are in `shot.mjs`. These are the reads no probe replaces — do them at full
size **and** at 360px:

- One dominant hook, clear hierarchy.
- Equal structural margins.
- Card text and option names still readable at 360px.
- The Spirit does not cover copy.
- The crop is centred, sharp, and authentic.
- The canonical wordmark is used unchanged.
- No element clipped by the canvas.
- No Thai mark cut above or below the line.
- Tertiary labels either readable at 360px or intentionally decorative.
