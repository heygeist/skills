---
name: setup-heygeist
description: Install or update the HeyGeist brand context pack used by the brand-agnostic social-image skill. Use when a new workspace needs HeyGeist terminology, Thai caption voice, visual tokens, provenance rules, and optional approved logo, mascot, or font assets configured before creating social posts with $social-image.
---

# Setup HeyGeist

Configure one workspace so the generic `$social-image` skill can produce HeyGeist work without embedding HeyGeist rules in its core package.

## Inputs

Resolve:

- Target workspace directory; default to the current workspace when clear.
- Optional canonical wordmark, mascot, and font files supplied by the user or already present locally.
- Whether an existing HeyGeist pack may be updated.

Do not download, redraw, generate, or substitute a missing logo or mascot. The text context and theme can be installed without optional assets.

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
<workspace>/.social-image/
├── active-brand.json
└── brands/
    └── heygeist/
        ├── brand.json
        ├── context.md
        ├── caption.md
        ├── visual.md
        ├── theme.css
        └── assets/              # only supplied approved assets
```

It refuses to replace an existing pack or a different active brand unless `--force` is supplied. Use `--force` only after inspecting the existing configuration.

## Verify

Confirm the installer reports `heygeist` as active. When `$social-image` is installed as a sibling skill, also run:

```sh
node <social-image-dir>/scripts/resolve-brand.mjs <workspace>
```

Require `found: true`, `brand: "heygeist"`, and no missing required files. Optional assets may resolve to `null`; that means `$social-image` must use a text brand label or omit the asset.

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
