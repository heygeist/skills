# Workspace Contract

## Output

```text
<workspace>/
├── DESIGN.md
└── .social-image/
    ├── context.md
    ├── caption.md
    ├── sources.md
    ├── asset-manifest.json
    ├── assets/
    │   ├── logos/
    │   ├── mascots/
    │   ├── icons/
    │   ├── illustrations/
    │   ├── photos/
    │   ├── fonts/
    │   ├── templates/
    │   ├── references/
    │   └── other/
    └── backups/<timestamp>/
```

`asset-manifest.json` is the machine-readable source for checksums and asset metadata. `sources.md` is generated from it for humans and agents.

## Approved plan

Pass one JSON file to `scripts/apply.mjs`:

```json
{
  "schema_version": 1,
  "approved": true,
  "documents": {
    "design_md": "---\nname: Example\n---\n\n## Overview\n\n...\n",
    "context_md": "# Product Context\n\n...\n",
    "caption_md": "# Caption Guidance\n\n...\n"
  },
  "assets": [
    {
      "id": "primary-logo",
      "source_path": "/absolute/path/logo.svg",
      "source": "user-supplied canonical logo",
      "filename": "logo.svg",
      "category": "logos",
      "type": "logo",
      "role": "Primary wordmark",
      "status": "canonical",
      "ownership": "Owned by Example",
      "license": "Internal brand asset",
      "restrictions": "Use unchanged"
    }
  ],
  "references": [
    {
      "id": "brand-site",
      "source": "https://example.com",
      "type": "website",
      "role": "Current product surface",
      "status": "reference-only",
      "ownership": "Example",
      "license": "Reference only",
      "restrictions": "Do not redistribute media"
    }
  ]
}
```

IDs use lowercase letters, digits, and hyphens. Categories are fixed to the nine output directories; use `other` for new kinds. Status is `canonical` or `reference-only`.

The plan contains the full approved text documents but only new or changed assets and references. Existing manifest entries remain unless a plan entry with the same ID replaces their metadata. Replaced binary files remain on disk and are reported as orphaned; deletion always requires a separate explicit action.
