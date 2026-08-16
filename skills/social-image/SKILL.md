---
name: social-image
description: Analyze supplied content and produce the GEIST-branded social image for it — composed for that content, rendered at 2048 plus link-card and portrait canvases, gated, and handed off with the editable HTML. Use when the user supplies full source content (a blog post, changelog, thread, feature, or brief) together with the social post copy and needs the post image made; also for a comparison graphic, an authentic agent-output proof crop, or a revision of an existing post image.
---

# GEIST Social Image

The user gives you two things: the **full content** (the article, changelog, feature, or
thread the post is about) and the **social post copy** they already wrote. Your job is to
read both and produce the image.

## Where this runs

**This skill operates inside the `geist-facebook-page-assets` workspace**, and every path
below is relative to its root:

```sh
cd ~/Desktop/work/geist/geist-facebook-page-assets
```

If the session started somewhere else — `pet-hub` is the usual case, since the source
content often lives there — change directory first. The brand assets, fonts, stylesheet,
renderer, and post folders all resolve from this root and from nowhere else. Read the
source content from wherever the user has it; write the post project here.

First run in a fresh clone needs `bun install` (playwright is the only dependency).

## The rule that outranks the rest

**Compose the image for the content. There is no house layout.**

There is no fill-in-the-blank template, and adding one is a regression. What is shared is
the *grammar* — tokens, zones, type scale, proof mechanics in
`templates/geist-social-image/base.css` — never an arrangement. Two posts about different
things should not resolve to the same picture.

`templates/geist-social-image/reference-example.html` is one solved composition to read.
`references/layout-grammar.md` catalogues arrangements that have worked. Both are there to
raise the floor, never to be instantiated.

## Folder contract

One self-contained project per post. Never scatter a post across root-level folders, and
never reuse another post's folder.

```text
projects/posts/<post-slug>/
├── assets/                    # AUTHENTIC captures only — real screenshots
├── generated/                 # synthetic imagery + its .json sidecar (see below)
├── exports/
│   ├── <post-slug>-2048.png
│   ├── <post-slug>-1200x630.png
│   └── <post-slug>-1080x1350.png
├── working/                   # candidates, rejects, previews; git-ignored
├── <post-slug>.html
├── caption.md                 # the user's copy, as supplied
└── PROCESS.md                 # only when requested
```

`assets/` vs `generated/` is not filing — it is the honesty gate. Anything in `generated/`
can never sit under a `REAL` label, and the folder is what makes that checkable.

## Load context

1. `CONTEXT.md` — canonical GEIST terminology.
2. `assets/brand/brandbook/index.html` — before any visual decision.
3. [references/layout-grammar.md](references/layout-grammar.md) — zones, type scale, canvases, composition catalogue.
4. [references/visual-contract.md](references/visual-contract.md) — assets, crop, provenance, export rules.
5. [references/caption-contract.md](references/caption-contract.md) — when checking the supplied caption.
6. [references/image-generation.md](references/image-generation.md) — only when HTML genuinely cannot render what is needed.
7. Existing exports under `projects/posts/*/exports/`. Do not assume the newest file is canonical.

## Build the image

### 1. Read both inputs and find the one thing

Read the full content *and* the social post copy. Resolve: who this is for, the single
takeaway, the tone, what must not be claimed, and what the reader should do next. Verify
every factual claim against the source, the codebase, or the named skill — find facts
yourself rather than asking. Ask only when a missing decision would change the result.

The image and the caption must not say the same sentence twice. The caption carries detail;
the image carries the hook.

### 2. Propose three headlines, then wait

Write **three** candidate headlines and show them to the user before composing anything.
A GEIST headline is a **reaction, not a title** — what the reader feels, not what the
product does. Two lines, spoken Thai, playful and a little teasing, never corporate.
The subhead explains; the headline reacts.

Do not proceed on your own pick.

### 3. Compose three variants for this content

Once the headline is chosen, build **three structurally different** compositions — not
three colourways of one layout. Let the content choose the structures: a before/after wants
a split, a single artifact wants the artifact to lead, a choice between two things wants two
equal cards, a striking quote wants type alone.

Each variant is its own HTML in `working/`. Render the master canvas only while iterating
(`--canvas 2048`) — it is ~3× faster.

### 4. Prepare the proof

- Prefer a real capture of the product or agent. Crop it in CSS with `overflow:hidden`;
  never recreate product UI in HTML.
- **Capture floor: ≥1600px wide** for anything filling the panel at 2048. Below that it
  visibly softens. Capture at retina, or zoom the source UI before capturing.
- Store the untouched original in `assets/`.
- A hand-built mock is allowed, but then the provenance label may not say `REAL` — see
  the three-value rule in [references/visual-contract.md](references/visual-contract.md).

### 5. Show the candidates and let the user pick

Render the three at 2048, build the contact sheet, and show **both** the sheet and the
three full-size images in your response:

```sh
node .agents/skills/geist-social-image/scripts/contact-sheet.mjs \
  projects/posts/<slug>/working/*-2048.png \
  --out projects/posts/<slug>/working/contact-sheet.png
```

The sheet is how consistency between candidates reads at a glance; the full-size is how you
see whether the Thai headline breathes. Do not call any variant final before the user says so.

### 6. Refine the winner, then export the canvas set

Promote the chosen variant to `projects/posts/<slug>/<slug>.html` and render everything:

```sh
node .agents/skills/geist-social-image/scripts/shot.mjs \
  projects/posts/<slug>/<slug>.html --preview
```

The three canvases are **compositions, not a reflow**. A 1200×630 link card cannot hold a
two-line 148px headline plus a proof panel — it drops to headline-led. Mark what each
smaller canvas sheds with `.og-drop` / `.portrait-drop`. Per-canvas zone tables are in
[references/layout-grammar.md](references/layout-grammar.md).

### 7. Pass every gate

`shot.mjs` runs five and exits non-zero on a hard failure:

| Gate | Fails when |
|---|---|
| errors | any console or page error |
| overflow | `scrollWidth/Height` exceeds the canvas — content is being cut |
| dimensions | an export is not exactly its canvas size |
| tokens | `base.css`'s `GEIST-TOKENS` block drifted from its checksum |
| line width | a headline line is ≥92% of content width — at wrap risk |

The sixth is not a probe: **look at the rendered PNG**, at full size and at 360px. Confirm
one dominant hook, equal structural margins, the mascot clear of copy, the crop sharp and
authentic, nothing clipped. If subagents are available, hand a fresh reviewer the raw 2048
export and ask only about hierarchy, alignment, spacing, balance, crop, and 360px
readability — do not leak the fix you have in mind.

Separate release blockers from optional polish.

### 8. Check the caption — do not rewrite it

The user supplies the caption. Save it verbatim as `caption.md`, then check it against
[references/caption-contract.md](references/caption-contract.md) and report what you find:
unsupported performance or time-saving claims, better/worse framing the facts do not carry,
a term used before it is explained, Markdown that will render literally on Facebook, an
image hook the caption contradicts.

Report; do not silently edit. Offer a rewrite only if asked.

### 9. When HTML genuinely cannot draw it

If the image needs something HTML and CSS cannot produce — a photographic scene, a realistic
object, an illustration no layout can stand in for — or if **three rounds of fixes have not
converged**, switch to generation. Read
[references/image-generation.md](references/image-generation.md) first. Output lands in
`generated/` with its sidecar and can never carry a `REAL` label.

## Deliverables

- `<post-slug>-2048.png`, `<post-slug>-1200x630.png`, `<post-slug>-1080x1350.png`
- `<post-slug>.html`
- `caption.md` plus your contract findings

Link each artifact and show the 2048 image in your response. Nothing is final until it has
passed the gates, been read at 360px, and been approved by the user.

## Two traps in this repo

- **`.gitignore` ignores `.agents/`.** Every file you add under it needs `git add -f` or it
  will look committed locally and never reach anyone else.
- **Never hand-edit a hex in `base.css`.** The palette is vendored from pet-hub's
  `bun run brand:tokens`; the token gate fails the render if it drifts. That drift is
  exactly how the earlier social kit ended up with a wrong ink and grey.
