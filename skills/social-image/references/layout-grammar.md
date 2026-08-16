# Layout Grammar

Compose for the content. Reuse the canvas contract and design tokens, not a fixed arrangement.

## Canvas contract

| Key | Size | Typical role |
|---|---:|---|
| `square` | 2048 × 2048 | Rich master composition |
| `landscape` | 1200 × 630 | Link card; headline-led and reduced |
| `portrait` | 1080 × 1350 | Feed portrait; master reading order with less detail |

The HTML receives the active key through `html[data-canvas]`. Use that selector to make deliberate per-canvas decisions.

## Stable zones

Most successful compositions contain some subset of:

1. Brand or source identifier
2. Eyebrow or category
3. Dominant headline
4. Clarifying subhead
5. Proof, artifact, quote, chart, or comparison
6. Provenance label
7. CTA or closing thought

The order and geometry may change. Keep one dominant hook and one clear reading path.

## Structure selection

| Content shape | Useful starting structure |
|---|---|
| Before and after | Split or transformation path |
| Two legitimate choices | Equal comparison cards |
| One strong artifact | Artifact-led crop with supporting hook |
| Strong quotation | Type-led composition |
| Process or sequence | Numbered path or connected steps |
| Quantitative change | One dominant number with restrained context |
| Abstract argument | Metaphor, diagram, or type-only treatment |

Build three structurally different candidates. Changing colors, mascot position, or decoration does not create a new structure.

## Headline rules

- Prefer one or two intentional lines.
- Insert line breaks by phrase; do not let the browser choose a fragile break.
- Keep each line below 92% of the content width.
- Match the language and tone of the supplied copy.
- Make the subhead explain while the headline hooks.

## Secondary canvases

Treat secondary canvases as edited compositions:

- `landscape`: retain the hook, source identity, and at most one supporting idea. Remove dense proof by default.
- `portrait`: preserve the master reading order but reduce supporting detail and media height.
- Use `.landscape-drop` and `.portrait-drop` intentionally.

## Small-size review

At 360 px, confirm that the headline, source identity, and central proof or idea remain recognizable. Tertiary labels may become decorative, but must not become misleading.
