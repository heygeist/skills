---
name: setup-heygeist
description: Install or update the HeyGeist DESIGN.md and non-visual context used by the brand-agnostic social-image skill. Use when a workspace needs HeyGeist design tokens and rationale, product terminology, Thai caption voice, provenance rules, and optional approved assets before creating social posts with $social-image.
---

# Setup HeyGeist

Configure one workspace so the generic `$social-image` skill can consume HeyGeist's visual system from `DESIGN.md` and its non-visual context from `.social-image/`.

## Inputs

Resolve:

- Target workspace directory; default to the current workspace when clear.
- Optional canonical wordmark, mascot, and font files supplied by the user or already present locally.
- Whether an existing `DESIGN.md` or HeyGeist context pack may be replaced.

Do not download, redraw, generate, or substitute a missing logo or mascot. `DESIGN.md` and the text context can be installed without optional assets.

## Install

Run from any location:

```sh
node <setup-heygeist-dir>/scripts/install.mjs \
  --target <workspace>
```

Add only assets that are available and approved:

```sh
node <setup-heygeist-dir>/scripts/install.mjs \
  --target <workspace> \
  --logo <wordmark-file> \
  --mascot <mascot-file> \
  --font-display <display-font-file> \
  --font-body <body-font-file>
```

The installer writes:

```text
<workspace>/
├── DESIGN.md                    # visual system and social-image design context
└── .social-image/
    ├── active-brand.json
    └── brands/
        └── heygeist/
            ├── brand.json
            ├── context.md       # product terms and factual guardrails
            ├── caption.md       # copy voice and platform rules
            └── assets/          # only supplied approved assets
```

It refuses to replace an existing `DESIGN.md`, context pack, or different active brand unless `--force` is supplied. Use `--force` only after inspecting the existing configuration. A forced migration preserves readable approved assets already named in the pack manifest.

## Verify

Confirm the installer reports `heygeist` as active. When `$social-image` is installed as a sibling skill, also run:

```sh
node <social-image-dir>/scripts/resolve-brand.mjs <workspace>
```

Require `found: true`, `brand: "heygeist"`, `files.design_system` pointing to root `DESIGN.md`, and no missing required files. Optional assets may resolve to `null`; that means `$social-image` must use a text brand label or omit the asset.

## Hand off

Tell the user that setup is workspace-local and complete. Their next request can be:

```text
Use $social-image to create a HeyGeist social image.

Full source:
[content, URL, or path]

Social copy:
[finished caption]
```

Do not create a post during setup unless the user also asks for one.
