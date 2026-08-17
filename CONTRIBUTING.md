# Contributing

Thank you for improving HeyGeist Skills.

## Setup

```sh
npm ci
npm run check
npm test

cd skills/social-image
npm install
npx playwright install chromium
npm run check
npm run smoke

cd ../setup-social-image
npm install
npm run check
npm run smoke
```

The root package is the public `npx` installer. Before releasing it, verify the exact tarball contents and run an isolated install:

```sh
npm pack --dry-run
npm pack
npx --yes --package=./heygeist-skills-<version>.tgz heygeist-skills \
  --target <temporary-skills-directory> --skip-deps
```

Never publish from an uncommitted worktree. Scoped releases use `npm publish --access public` after the package name, version, tarball contents, tests, and release authorization are confirmed.

## Social-image rules

- Keep the skill brand-agnostic and runnable outside this repository.
- Resolve bundled resources relative to the installed skill directory.
- Do not add machine-specific paths, private workspace names, proprietary brand assets, or unlicensed fonts.
- Keep `SKILL.md` concise and route detailed guidance to `references/`.
- Treat `assets/example.html` as a worked example, not a fixed layout template.
- Add or update a smoke fixture when changing the renderer contract.
- Preserve honest `real`, `example`, and `generated` provenance semantics.
- Keep brand-specific visual rules in workspace `DESIGN.md`, never in the generic core.
- Keep reusable product context in `.social-image/context.md` and caption guidance in `.social-image/caption.md`.
- Track local and external assets in the schema-1 `.social-image/asset-manifest.json` with provenance, license, restrictions, status, and checksums where applicable.
- Preserve legacy and unreferenced assets during migration; removal requires a separate explicit action.

## Pull requests

Describe the user-visible behavior, validation performed, and any compatibility impact. Keep unrelated changes out of the same pull request.
