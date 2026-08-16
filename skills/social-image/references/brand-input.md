# Brand Input

## Evidence order

Use brand evidence in this order:

1. Explicit user instructions for this project
2. A canonical brand guide or design-token source
3. Approved logo, icon, and font files
4. Current product or marketing surfaces
5. Representative published work

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

## Token contract

Copy `assets/base.css` into the project and edit the values between:

```css
/* SOCIAL-IMAGE-TOKENS:START */
/* SOCIAL-IMAGE-TOKENS:END */
```

Keep these variables defined:

- `--si-bg`
- `--si-fg`
- `--si-accent`
- `--si-muted`
- `--si-surface`
- `--si-border`
- `--si-display-font`
- `--si-body-font`

Confirm readable contrast and font availability in the rendered PNG, not only in source code.
