---
name: social-image
description: Create, revise, render, and QA brand-aware social images from supplied source content and social copy. Use when Codex needs to produce square, landscape link-card, and portrait social graphics; compare multiple compositions; incorporate authentic screenshots; adapt to a supplied brand kit; or deliver editable HTML and validated PNG exports.
---

# Social Image

Turn full source content and its social post copy into a publish-ready image set. Compose for the content instead of filling a fixed template.

## Required inputs

Obtain both:

1. The full source content: article, changelog, thread, feature, launch brief, or equivalent.
2. The social post copy the image will accompany.

Accept pasted text, URLs, or readable local files. Also use any installed brand pack, supplied brand guide, logo, fonts, screenshots, output location, platform requirements, and image-generation policy.

If no brand pack or brand context is supplied or discoverable, use the neutral starter grammar in `assets/base.css`. Never invent a logo or imply a brand affiliation.

## Runtime

Operate from any writable workspace. Resolve bundled files relative to this skill directory; do not assume a repository name, home-directory layout, or agent-specific installation path.

On first use, install the local renderer dependency from the skill directory:

```sh
npm install
npx playwright install chromium
```

Write output to the user's requested location. Otherwise default to:

```text
social-images/<post-slug>/
├── assets/
│   ├── base.css               # copied from this skill, then brand-adjusted
│   ├── brand/                 # user-supplied logos and licensed fonts
│   └── captures/              # authentic, untouched screenshots
├── generated/                 # synthetic images and JSON provenance sidecars
├── exports/
│   ├── <post-slug>-square.png
│   ├── <post-slug>-landscape.png
│   └── <post-slug>-portrait.png
├── working/                   # candidate HTML, previews, and contact sheet
├── <post-slug>.html
└── caption.md
```

Keep each post self-contained. Final HTML must continue to render after the skill is moved or removed.

## Load context

1. Read [references/brand-packs.md](references/brand-packs.md) and resolve an active workspace brand pack.
2. Read [references/brand-input.md](references/brand-input.md) when brand material is supplied or branding is requested.
3. Read [references/layout-grammar.md](references/layout-grammar.md) before composing candidates.
4. Read [references/visual-contract.md](references/visual-contract.md) before using screenshots, mockups, or generated media.
5. Read [references/caption-contract.md](references/caption-contract.md) when checking the supplied social copy.
6. Read [references/image-generation.md](references/image-generation.md) only when generated imagery is needed.
7. Inspect relevant existing outputs and source files. Do not assume the newest-looking artifact is canonical.

## Build the image

### 1. Find the one thing

Read the full content and social copy. Resolve the audience, single takeaway, desired reaction, tone, prohibited claims, and CTA. Verify factual claims against supplied or discoverable sources.

Let the caption carry detail and the image carry the hook. Do not repeat the same sentence in both.

### 2. Establish the brand layer

Resolve the active workspace pack first:

```sh
node <skill-dir>/scripts/resolve-brand.mjs <workspace>
```

When a pack is active, read every required file named in its manifest. Treat the pack as brand context, not as a layout template.

Then use brand sources in this order: explicit instructions for the current post, active brand pack, canonical design tokens, approved logo files, licensed fonts, then representative existing work.

Copy `assets/base.css` into the post's `assets/` directory. Adjust only its `SOCIAL-IMAGE-TOKENS` block and font declarations to match verified brand material. Preserve the structural canvas rules.

When no brand source exists, retain the neutral starter tokens and use a plain text brand label only if the user supplies the name. For HeyGeist work, tell a new user to run `$setup-heygeist` once before continuing.

### 3. Propose three headlines, then wait

Write three candidate headlines in the content's language. Make each a reaction or hook rather than a document title. Keep it short enough for an intentional one- or two-line break.

Wait for the user to choose. Do not silently select one.

### 4. Compose three structural variants

Build three genuinely different compositions, not color variants of one arrangement. Let the content select the structure: comparison, artifact-led, quote-led, sequence, before/after, data-led, or another justified form.

Create each candidate as editable HTML under `working/`. Link the copied `assets/base.css` and keep arrangement-specific CSS inside the candidate.

Render only the square canvas while iterating:

```sh
node <skill-dir>/scripts/shot.mjs \
  <candidate.html> --out <working-dir> --canvas square
```

### 5. Use honest proof

Prefer authentic captures when showing a product, interface, result, or agent output. Store untouched originals in `assets/captures/` and crop through CSS. Never reconstruct an interface and label it as real.

Use `data-provenance="real"`, `data-provenance="example"`, or `data-provenance="generated"` on proof elements. Generated media belongs in `generated/` with its sidecar.

### 6. Present candidates

Render the three square candidates and create a contact sheet:

```sh
node <skill-dir>/scripts/contact-sheet.mjs \
  <working-dir>/*-square.png --out <working-dir>/contact-sheet.png
```

Show the contact sheet and full-size candidates. Wait for the user to choose a composition.

### 7. Refine and export

Promote the chosen HTML to `<post-slug>.html`. Compose each canvas intentionally; use `.landscape-drop` and `.portrait-drop` for detail that should not survive smaller formats.

Render the complete set:

```sh
node <skill-dir>/scripts/shot.mjs <post.html> --preview
```

The renderer produces:

- `square`: 2048 × 2048
- `landscape`: 1200 × 630
- `portrait`: 1080 × 1350

### 8. Pass the gates

Fix every hard failure reported by `shot.mjs`: browser errors, broken images, missing design tokens, overflow, wrong dimensions, or headline wrap risk.

Then inspect the square export at full size and the 360 px preview. Confirm one dominant hook, deliberate alignment, readable text, honest provenance, sharp media, and no accidental clipping.

### 9. Check the caption without silently rewriting it

Save the supplied social copy as `caption.md`. Report unsupported claims, contradictions, unexplained terms, or platform-hostile formatting. Rewrite only when requested.

### 10. Generate imagery only when justified

Use generated imagery only when layout, typography, diagrams, authentic captures, and supplied assets cannot communicate the idea. Follow the user's generation policy and [references/image-generation.md](references/image-generation.md).

## Deliverables

Hand off:

- `<post-slug>-square.png`
- `<post-slug>-landscape.png`
- `<post-slug>-portrait.png`
- `<post-slug>.html` with local assets
- `caption.md` plus caption-check findings

Show the square image in the response and link every artifact. Do not call a candidate final before user approval and visual QA.
