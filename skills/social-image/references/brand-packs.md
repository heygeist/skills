# Workspace Design Context

`DESIGN.md` is the canonical workspace source for visual identity, tokens, typography, component treatment, and design rationale. An optional context pack supplies non-visual product language, caption voice, and approved asset paths without coupling the generic skill to one brand.

## Discovery

Look for the nearest directory containing either `DESIGN.md` or `.social-image/active-brand.json`:

```text
<workspace>/
├── DESIGN.md                    # canonical visual design system
└── .social-image/
    ├── active-brand.json
    └── brands/
        └── <brand-id>/
            ├── brand.json
            ├── context.md       # product terms and factual guardrails
            ├── caption.md       # copy voice and platform rules
            └── assets/          # optional approved assets
```

Run `scripts/resolve-brand.mjs <workspace>` to resolve and validate it. A workspace may provide `DESIGN.md` without a context pack. If neither resolves, use supplied brand material or the neutral fallback.

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
  "schema_version": 2,
  "id": "example-brand",
  "display_name": "Example Brand",
  "context": "context.md",
  "caption_contract": "caption.md",
  "optional_assets": {
    "logo": "assets/logo.svg"
  }
}
```

Require the context and caption contract to exist. Require root `DESIGN.md` whenever a brand is active. Optional assets may be absent; never fabricate a missing logo, mascot, or font.

## Application

1. Read `DESIGN.md` for every visual decision and reusable token.
2. Read the context pack only for product language, caption behavior, and approved asset paths.
3. Copy the generic `assets/base.css` into the post project.
4. Map the semantic roles in `DESIGN.md` into the copied stylesheet's `SOCIAL-IMAGE-TOKENS` block.
5. Copy only the approved optional assets used by this post.
6. Let the source content determine the layout. A design system must not impose one arrangement.

Setup skills may install both artifacts. For example, `$setup-heygeist` writes root `DESIGN.md` and activates HeyGeist's non-visual context pack without changing the generic `social-image` skill.
