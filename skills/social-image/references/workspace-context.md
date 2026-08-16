# Workspace Context

Use the nearest workspace containing root `DESIGN.md` or `.social-image/`:

```text
<workspace>/
├── DESIGN.md
└── .social-image/
    ├── context.md
    ├── caption.md
    ├── sources.md
    ├── asset-manifest.json
    └── assets/
        ├── logos/
        ├── mascots/
        ├── icons/
        ├── illustrations/
        ├── photos/
        ├── fonts/
        ├── templates/
        ├── references/
        └── other/
```

Run `scripts/resolve-context.mjs <workspace>`. It verifies every manifest checksum and returns absolute paths plus metadata for approved assets.

## Roles

- `DESIGN.md`: normative visual tokens, rationale, post-style tendencies, platform variants, asset usage, and visual guardrails
- `context.md`: reusable product identity, audience, terminology, facts, claims, limitations, and common subjects
- `caption.md`: reusable language, voice, formatting, CTA, platform, and avoidance guidance
- `sources.md`: human-readable provenance, ownership, license, restrictions, roles, and checksums
- `asset-manifest.json`: machine-readable asset and external-reference index

One workspace has one canonical profile. Assets marked `canonical` may appear in final work when their restrictions permit it. Use `reference-only` material to understand the visual world; do not publish or redistribute it unless separately approved.

## Application

1. Read every resolved context file relevant to the post.
2. Select only assets whose semantic role and restrictions match the current post.
3. Copy used assets into the post's self-contained `assets/brand/` directory; never link final HTML back to workspace context.
4. Map semantic roles from `DESIGN.md` into the copied `base.css` token block.
5. Let the current source content choose the composition. Reusable context constrains identity, not the story structure.

Report checksum failures, missing files, preserved legacy context, and orphaned assets before composing. Use `$setup-social-image` to create, migrate, or update workspace context.
