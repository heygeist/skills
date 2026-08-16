# Contributing

Thank you for improving HeyGeist Skills.

## Setup

```sh
cd skills/social-image
npm install
npx playwright install chromium
npm run check
npm run smoke

cd ../setup-heygeist
npm install
npm run check
npm run smoke
```

## Social-image rules

- Keep the skill brand-agnostic and runnable outside this repository.
- Resolve bundled resources relative to the installed skill directory.
- Do not add machine-specific paths, private workspace names, proprietary brand assets, or unlicensed fonts.
- Keep `SKILL.md` concise and route detailed guidance to `references/`.
- Treat `assets/example.html` as a worked example, not a fixed layout template.
- Add or update a smoke fixture when changing the renderer contract.
- Preserve honest `real`, `example`, and `generated` provenance semantics.
- Keep brand-specific visual rules in workspace `DESIGN.md`, never in the generic core or context pack.
- Keep only non-visual product language, caption guidance, and approved-asset pointers in `.social-image/brands/<brand-id>/`.
- Follow the versioned schema-2 `brand.json` contract when adding a setup skill.

## Pull requests

Describe the user-visible behavior, validation performed, and any compatibility impact. Keep unrelated changes out of the same pull request.
