# Visual Contract

## Project boundaries

- Keep each post in one self-contained directory.
- Copy the starter stylesheet into the post; do not link back to the installed skill.
- Store approved brand files in `assets/brand/`.
- Store authentic untouched captures in `assets/captures/`.
- Store synthetic media in `generated/` with JSON sidecars.
- Keep candidates and previews in `working/`; keep approved outputs in `exports/`.

## Provenance

Use one of three machine-readable values:

| Value | Meaning |
|---|---|
| `data-provenance="real"` | Genuine capture or supplied factual artifact |
| `data-provenance="example"` | Hand-built mock, diagram, or illustrative sample |
| `data-provenance="generated"` | AI-generated or synthetic media |

Never use `real` for recreated UI, generated imagery, or a hand-built mock.

## Authentic captures

- Prefer original high-resolution captures.
- Use at least 1600 px source width when a capture fills a large portion of the square canvas.
- Crop through an overflow-hidden container; preserve the original file unchanged.
- Keep enough product or source context to make the proof credible.
- Avoid enlarging text screenshots until they blur.
- Remove private information before the file enters the project.

## Brand assets

- Use canonical files unchanged unless the brand guide explicitly permits modification.
- Preserve aspect ratios.
- Verify that bundled fonts and media may be redistributed.
- Use a text brand label only when no logo is supplied.
- Never infer endorsement from a public logo or website screenshot.

## Export QA

Inspect every final canvas and the 360 px preview:

- One dominant hook
- Clear reading order
- Intentional structural margins
- No clipped or overflowing content
- Sharp images and loaded fonts
- Correct provenance
- Sufficient contrast
- No accidental placeholders
- Platform-safe dimensions
