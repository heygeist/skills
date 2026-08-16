# HeyGeist Skills

Open-source agent skills maintained by HeyGeist.

## Skills

### `social-image`

Create brand-aware social graphics from full source content and its social copy. The skill proposes headlines, builds structurally different candidates, renders square, landscape, and portrait canvases, verifies provenance, and runs deterministic export gates.

The package is brand-agnostic. It reads visual identity and reusable design context from the nearest workspace `DESIGN.md`, while still accepting user-supplied logos, fonts, authentic captures, and per-post instructions.

### `setup-heygeist`

Install HeyGeist's `DESIGN.md` plus an optional non-visual context pack into a workspace. The design file owns tokens, visual rationale, and social-image treatment; the context pack keeps product terminology, Thai caption guidance, and paths for approved assets separate.

## Local setup

```sh
git clone https://github.com/heygeist/skills.git
cd skills/skills/social-image
npm install
npx playwright install chromium
npm run check
npm run smoke

cd ../setup-heygeist
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

For HeyGeist work, configure each workspace once before creating its first post:

```text
Use $setup-heygeist to configure this workspace for HeyGeist posts.
```

Then invoke `$social-image`. The generic skill resolves root `DESIGN.md` as its visual source of truth and loads `.social-image/active-brand.json` only for non-visual context and approved assets.

Other brands can provide `DESIGN.md` alone or pair it with the same context-pack contract under `.social-image/brands/<brand-id>/` without forking the core skill.

## Development

See [CONTRIBUTING.md](CONTRIBUTING.md). Every change must keep the skill portable and pass both package validation and the Playwright smoke render.

## License

MIT. User-supplied logos, fonts, screenshots, and other brand materials retain their original licenses and usage restrictions.
