# Brand Packs

A brand pack is optional workspace configuration for `social-image`. It supplies identity context and tokens without coupling the generic skill to one brand.

## Discovery

Look for this structure in the current workspace or a parent directory:

```text
.social-image/
├── active-brand.json
└── brands/
    └── <brand-id>/
        ├── brand.json
        ├── context.md
        ├── caption.md
        ├── visual.md
        ├── theme.css
        └── assets/              # optional approved assets
```

Run `scripts/resolve-brand.mjs <workspace>` to resolve and validate it. If no pack is active, use supplied brand material or the neutral fallback.

## Active brand

`.social-image/active-brand.json` contains:

```json
{
  "schema_version": 1,
  "brand": "example-brand"
}
```

The brand ID must contain only lowercase letters, digits, and hyphens.

## Manifest

`brand.json` contains:

```json
{
  "schema_version": 1,
  "id": "example-brand",
  "display_name": "Example Brand",
  "context": "context.md",
  "caption_contract": "caption.md",
  "visual_contract": "visual.md",
  "theme": "theme.css",
  "optional_assets": {
    "logo": "assets/logo.svg"
  }
}
```

Require the context, caption contract, visual contract, and theme to exist. Optional assets may be absent; never fabricate a missing logo, mascot, or font.

## Application

1. Read the manifest and required Markdown files.
2. Copy the generic `assets/base.css` into the post project.
3. Replace its `SOCIAL-IMAGE-TOKENS` block with the pack's `theme.css` token block.
4. Copy only the approved optional assets used by this post.
5. Let the source content determine the layout. A brand pack must not impose one arrangement.

Setup skills may install brand packs. For example, `$setup-heygeist` installs and activates the HeyGeist pack without changing the generic `social-image` skill.
