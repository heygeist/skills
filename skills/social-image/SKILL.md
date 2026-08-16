---
name: social-image
description: Create, revise, render, and QA Geist-branded Facebook single-image posts and accompanying Thai captions in this repository. Use when Codex needs to make a one-shot Facebook image, social post cover, two-option comparison graphic, authentic Codex or agent proof crop, or final 1080/2160 Facebook export that follows the Geist brand system.
---

# Geist Facebook Single-Image Post

Create a publish-ready square image, editable HTML, and Facebook caption from a topic, brief, source capture, or existing draft.

## Folder contract

Create one self-contained project folder per post. Never scatter a post across root-level `assets/` and `exports/`, and never reuse another post's folder.

```text
projects/posts/<post-slug>/
├── assets/
│   └── <descriptive-capture-name>.png
├── exports/
│   ├── <post-slug>-1080.png
│   └── <post-slug>-2160.png
├── working/                   # previews and rejected variants; ignored by Git
├── <post-slug>.html
├── caption.md
└── PROCESS.md                 # only when requested
```

Keep every post-specific artifact inside this folder. Shared brand assets, fonts, templates, and render tools remain at the workspace root.

## Load context

1. Read `CONTEXT.md` for canonical Geist terminology.
2. Read `assets/brand/brandbook/index.html` before making visual decisions.
3. Read [references/visual-contract.md](references/visual-contract.md) for layout, assets, crop, and export rules.
4. Read [references/caption-contract.md](references/caption-contract.md) when writing or revising the accompanying caption.
5. Inspect relevant existing exports and source captures. Do not assume the latest-looking file is canonical.

## Build the post

### 1. Ground the story

- Verify claims from the named Skill, product source, codebase, or supplied material.
- Find discoverable facts locally instead of asking the user.
- Resolve the audience, communication goal, single takeaway, tone, prohibited claims, and desired CTA.
- Ask only when a missing decision would materially change the result.
- Explain technical concepts in plain language when the audience may not write code.

### 2. Choose the layout

- Use the standard hook + authentic proof layout for a feature, workflow, or single concept.
- Use two equal cards for a two-option comparison. Keep both options visually equal unless the brief explicitly recommends one.
- Use one Crownheart by default. Use two only when each mascot has a clear comparison role.
- Keep unfamiliar detail such as ADR or glossary terminology out of the image; explain it in the caption.

### 3. Prepare authentic proof

- Prefer real product or Agent App captures.
- Never recreate chat UI or proof text in HTML.
- If an essential proof capture is unavailable, do not fabricate it; stop before final export and report the blocker.
- Import the original capture into `projects/posts/<post-slug>/assets/` with a descriptive filename.
- Crop with an overflow-hidden CSS container so the source remains reproducible.
- Remove irrelevant chrome and margins while preserving enough UI to establish authenticity.
- Avoid enlarging low-resolution captures enough to blur the text.

### 4. Create the editable source

- Create the dedicated `projects/posts/<post-slug>/` project folder, then create `<post-slug>.html` inside it.
- Reuse `templates/facebook-single-image-text-post/template.html` when its reading order fits.
- Build a custom HTML composition only when the topic requires a comparison or another materially different information structure.
- Reuse the canonical wordmark, approved Crownheart frames, Noto Sans Thai, and Figtree. Do not redraw or recolor them.
- Preserve unrelated workspace changes.

### 5. Write the caption

- Create `projects/posts/<post-slug>/caption.md`.
- Use conversational Thai, short mobile paragraphs, and the Geist standalone `.` separators.
- Match the requested reading time. For educational comparison posts, default to about 2–3 minutes.
- Give a concrete non-technical example before explaining specialized files or terms.
- Include one honest limitation and one low-friction CTA.

### 6. Render and inspect

Run:

```sh
python tools/generators/render_facebook_single_image_text_post.py \
  projects/posts/<post-slug>/<post-slug>.html \
  --output-dir projects/posts/<post-slug>/exports \
  --basename <post-slug>
```

Confirm the 1080 × 1080 and 2160 × 2160 outputs exist.

Create a temporary 360 × 360 preview and inspect it. Keep the hook, option names, chooser copy, and core proof recognizable at that size.

### 7. Review and refine

- Inspect the 1080 export visually after every meaningful layout change.
- If subagents are available, give one fresh reviewer the raw 1080 export and ask only for hierarchy, alignment, spacing, balance, crop, and 360 px readability. Do not leak the intended fix.
- Separate release blockers from optional polish.
- When comparing variants, preserve the approved baseline under the post's `working/` folder and render a separately named option there.
- Promote the chosen variant back to the canonical HTML and export names only after the user confirms it.

## Deliverables

Hand off:

- `<post-slug>-1080.png`
- `<post-slug>-2160.png`
- `<post-slug>.html`
- `caption.md`

Link to each final artifact and show the 1080 image in the response. Do not call a working option final until it has passed visual QA and user approval.
