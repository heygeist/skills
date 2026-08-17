# Brand Input

## Evidence order

Use brand evidence in this order:

1. Explicit user instructions for this project
2. The nearest workspace `DESIGN.md`
3. A canonical supplied brand guide or design-token source
4. Approved logo, icon, and font files
5. Current product or marketing surfaces
6. Representative published work

Treat examples as evidence, not templates. When sources conflict, prefer the most canonical and recent source and report the conflict.

## Minimum brand brief

A usable brand layer may include:

- Brand name and approved logo files
- Background, foreground, accent, muted, and border colors
- Display and body font families with redistribution rights
- Tone and language guidance
- Image, illustration, icon, or mascot rules
- Prohibited treatments and required legal marks

Do not block when these are absent. Use the neutral starter tokens, system fonts, and no logo. Ask only when an unresolved choice would materially change the result.

## Asset handling

- Copy approved brand assets into the post's `assets/brand/` directory.
- Preserve originals; resize and crop in HTML/CSS.
- Never trace, redraw, recolor, or synthesize a logo unless the user explicitly requests a new identity and has authority to do so.
- Do not bundle third-party fonts without their license files.
- Record any non-obvious source or usage restriction in a short HTML comment or project note.

## DESIGN.md contract

Treat `DESIGN.md` as the single source of truth for reusable visual decisions. Read both its machine-readable frontmatter and its prose rationale. Exact tokens control values; prose controls semantic usage and exceptions.

Keep product terminology in `.social-image/context.md` and caption voice in `.social-image/caption.md`. Keep per-post source content and social copy with the post. Do not duplicate those into `DESIGN.md`.

## Runtime token mapping

Copy `assets/base.css` into the project and edit the values between:

```css
/* SOCIAL-IMAGE-TOKENS:START */
/* SOCIAL-IMAGE-TOKENS:END */
```

Keep these variables defined:

- `--si-bg`: primary canvas/background role
- `--si-fg`: primary text/foreground role
- `--si-accent`: active signal or CTA role
- `--si-muted`: secondary text role
- `--si-surface`: card or proof-surface role
- `--si-border`: divider or hairline role
- `--si-display-font`: approved display/headline family and fallbacks
- `--si-body-font`: approved body family and fallbacks

Resolve roles from token meaning and prose, not token names alone. Use the neutral value for a missing role and report the fallback. Do not edit `DESIGN.md` merely to mirror `--si-*` names.

Confirm readable contrast and font availability in the rendered PNG, not only in source code.
