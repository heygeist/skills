# HeyGeist Skills

Open-source agent skills maintained by HeyGeist.

## Skills

### `social-image`

Create brand-aware social graphics from full source content and its social copy. The skill proposes headlines, builds structurally different candidates, renders square, landscape, and portrait canvases, verifies provenance, and runs deterministic export gates.

The package is brand-agnostic. It ships with a neutral starter grammar and accepts user-supplied brand guides, tokens, logos, fonts, and authentic captures.

### `setup-heygeist`

Install the optional HeyGeist context pack into a workspace. It adds HeyGeist terminology, Thai caption guidance, visual tokens, provenance labels, and paths for user-supplied approved assets without changing the generic `social-image` skill.

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

Then invoke `$social-image`. The generic skill discovers `.social-image/active-brand.json` and loads the installed pack automatically.

Other brands can implement the same pack contract under `.social-image/brands/<brand-id>/` without forking the core skill.

## Development

See [CONTRIBUTING.md](CONTRIBUTING.md). Every change must keep the skill portable and pass both package validation and the Playwright smoke render.

## License

MIT. User-supplied logos, fonts, screenshots, and other brand materials retain their original licenses and usage restrictions.
