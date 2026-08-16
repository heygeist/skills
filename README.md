# HeyGeist Skills

Open-source agent skills maintained by HeyGeist.

## Skills

### `social-image`

Create brand-aware social graphics from full source content and its social copy. The skill proposes headlines, builds structurally different candidates, renders square, landscape, and portrait canvases, verifies provenance, and runs deterministic export gates.

The package is brand-agnostic. It reads visual identity and reusable design context from the nearest workspace `DESIGN.md`, while still accepting user-supplied logos, fonts, authentic captures, and per-post instructions.

### `setup-social-image`

Interview the user, inspect supplied references, and prepare a brand-neutral social-image profile for a workspace. The approved profile uses root `DESIGN.md` for the visual system, `.social-image/context.md` for product context, `.social-image/caption.md` for writing guidance, and a provenance-aware semantic asset library that supports logos, mascots, icons, illustrations, photos, fonts, templates, references, and other media.

## Local setup

```sh
git clone https://github.com/heygeist/skills.git
cd skills/skills/social-image
npm install
npx playwright install chromium
npm run check
npm run smoke

cd ../setup-social-image
npm install
npm run check
npm run smoke
```

Install or copy the complete `skills/social-image/` folder into a compatible agent skill directory. Keep its `assets/`, `references/`, `scripts/`, package manifest, and lockfile together.

Invoke it with:

```text
Use $social-image.

Full source:
[paste, URL, or local path]

Social copy:
[finished caption]

Brand context and authentic captures:
[optional paths or instructions]
```

Configure each workspace once before creating its first post:

```text
Use $setup-social-image to configure this workspace.
```

Then invoke `$social-image`. It resolves the nearest root `DESIGN.md` together with `.social-image/context.md`, `.social-image/caption.md`, `.social-image/sources.md`, and `.social-image/asset-manifest.json`.

Legacy `.social-image/brands/` data may be proposed for migration, but setup never deletes or silently replaces it.

## Development

See [CONTRIBUTING.md](CONTRIBUTING.md). Every change must keep the skill portable and pass both package validation and the Playwright smoke render.

## License

MIT. User-supplied logos, fonts, screenshots, and other brand materials retain their original licenses and usage restrictions.
