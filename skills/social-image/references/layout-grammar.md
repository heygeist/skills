# Layout Grammar

The shared system every GEIST social image is built on. This is a **grammar, not a
layout** — it fixes the vocabulary (canvas, zones, scale, colour) and leaves the
arrangement to the content.

All of it is implemented in `templates/geist-social-image/base.css`. Link that file; do
not restate its values in a post's `<style>`.

## Canvas

| Canvas | Size | Role |
|---|---|---|
| master | 2048 × 2048 | the image. Authoring happens here. |
| link card | 1200 × 630 | link/OG preview. Headline-led, no proof panel. |
| portrait | 1080 × 1350 | feed portrait. Master's reading order, ~0.53 scale. |

Master padding: 118 top, 128 sides, 110 bottom → **1792px content width**.

`html,body` are locked to the canvas with `overflow:hidden`, so an overflow becomes a gate
failure you can find rather than an image that is silently cut.

## The eight zones

Keep the order. Skip any zone the content does not need — an image with no proof panel is
a legitimate image.

| # | Zone | Size | Weight | Colour |
|---|---|---|---|---|
| 1 | Eyebrow, top left | 34px, tracking .16em, caps | 700 | `--mango-text` |
| 2 | Wordmark, top right | 360px wide **image** | — | canonical PNG |
| 3 | Headline | 148px, line-height 1.16 | 800 | `--ink` |
| 4 | Subhead | 48px | 650 | `--muted-fg` |
| 5 | Provenance label + hairline | 31px, tracking .19em, caps | 700 | `--label` |
| 6 | Proof panel | radius 34px, padding 52/56 | — | `--panel` |
| 7 | Footer | 64px bold, or 44px with a mango dot | 800 / 650 | ink + `--muted-fg` |
| 8 | The Spirit, bottom right | 190–420px wide | — | canonical mascot |

**Type.** Figtree for latin, Noto Sans Thai for Thai, weights 650–800. Same stack as the
product (`src/app/layout.tsx`, ADR-058).

**The wordmark is an image.** `assets/brand/brandbook/wordmark-primary.png` (1546×373),
used unchanged per ADR-0002. Never set `GEIST.` as live text — a redrawn wordmark is how a
lockup drifts, and it has already happened once in this brand's history.

## Colour

Every surface is white. Mango marks what is alive. Sky is illustration only. The warm
`#ECE7DE` hairline carries the depth — warmth never lives in a fill.

Mango has three steps, each with one job:

| Token | Value | Contrast on white | Use for |
|---|---|---|---|
| `--primary` | `#FF8442` | 2.43:1 | fills, bars, the wordmark's full stop, the heart |
| `--primary-hover` | `#E5661D` | 3.36:1 | control borders |
| `--mango-text` | `#C24E0E` | 4.78:1 | small text labels — clears AA |

Every value is vendored from pet-hub's `bun run brand:tokens`. **Never hand-edit a hex**;
the token gate fails the render.

## Headline

The headline is a **reaction, not a title**. `วอดส์?!!` and `อันนี้ไม่ได้สั่งหนิ ทำมาทำไม` are
reactions. "Introducing X" is a title.

- Write what the reader feels, not what the product does.
- Two lines, spoken Thai. Break by phrase with `<br>` — never let the browser choose.
- The subhead explains. The headline reacts.
- Playful, warm, a little teasing. Never corporate.

**On line width.** The retired 55–65% rule was never true. Measured against the shipped
corpus:

| Image | lines, % of content width |
|---|---|
| `final-b1` (2048) | 72.9%, 79.7% |
| `grill-me-vs` (1080) | 76.9% |
| `wait-what` (1080) | ~33%, ~40% |

A statement headline runs ~70–80%; a short reaction runs far below. Both are correct. The
gate therefore enforces no band — it fails only at **≥92%**, where a line is one glyph from
breaking somewhere you did not choose.

At 148px a Thai headline holds roughly 22 characters across 1792px.

## Composition catalogue — read, never instantiate

Arrangements that have carried real posts. They exist so you start from solved problems,
not so you fill one in. If the content wants a shape that is not here, build that shape.

| Shape | Fits content that is |
|---|---|
| **Proof leads** | one artifact worth showing; hook above, panel below, Spirit overlapping |
| **Side by side** | before/after with the same content in two forms |
| **Two equal cards** | a genuine choice between two options — identical dimensions and baselines, 24px-equivalent gap, equal weight unless the brief recommends one |
| **Prompt alone** | one line of input that is itself the story; large type in the dark panel |
| **Prompt → artifact** | a cause and its effect; composer, arrow, resulting file |
| **Stacked with a divider** | a long before and a short after, when a split would crush both |
| **Overlap** | the result physically covering the thing it replaces |
| **Result leads, inset** | the outcome at full size with the old way as a small inset |

Rules that survive whichever shape you choose: one dominant hook; equal structural margins;
the Spirit clear of copy; unfamiliar terminology (ADR names, glossary words) stays out of
the image and goes in the caption.

## Per-canvas zone tables

The smaller canvases are **compositions, not a reflow**. Mark what each sheds in the post
HTML with `.og-drop` and `.portrait-drop`.

**1200 × 630 — link card.** Landscape and small; it cannot hold a two-line 148px headline
plus a panel. Keeps eyebrow, headline, subhead, wordmark, Spirit. Drops the proof panel,
its provenance label, and usually the footer. Padding 58/64/54; headline 78px; subhead 28px;
wordmark 196px; Spirit 168px.

**1080 × 1350 — portrait.** Keeps the master's reading order at ~0.53 scale, panel included.
Padding 74/68/66; headline 80px; subhead 27px; panel radius 20px with 21px body; Spirit
222px. **Always scope a crop width per canvas** — an unscoped `width:1792px` on a capture
overflows here, and the overflow gate will catch it.
