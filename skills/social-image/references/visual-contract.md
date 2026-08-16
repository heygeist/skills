# Visual Contract

## Brand sources

- Brandbook: `assets/brand/brandbook/index.html`
- Wordmark: `assets/brand/brandbook/wordmark-primary.png`
- Crownheart master: `assets/brand/brandbook/mascot.png`
- Crownheart frames: `assets/pets/heygeist-pets/crownheart-geist-frames/`
- Thai font: `assets/references/fonts/NotoSansThai-Variable.ttf`
- Latin fonts: `projects/videos/geist-pet-roam/assets/fonts/`
- Base template: `templates/facebook-single-image-text-post/template.html`
- Renderer: `tools/generators/render_facebook_single_image_text_post.py`

Use the canonical files unchanged. Do not redraw the wordmark or mascot.

## Per-post folders

- Create one self-contained project under `projects/posts/<post-slug>/`.
- Store authentic captures under that project's `assets/` folder.
- Store editable HTML, caption, and optional process notes at the project root.
- Store only approved PNG deliverables under the project's `exports/` folder.
- Store previews, alternate layouts, and rejected versions under the project's ignored `working/` folder.
- Never reuse another post's project folder, even when copying its HTML as a starting point.

## Format

- Canvas: 1080 × 1080 px
- High-resolution export: 2160 × 2160 px
- Primary outer margin: 54–56 px
- Background: white
- Ink: `#20201C`
- Mango: `#FF8442`
- Sky: `#56C4F0`
- Thai headline/body: Noto Sans Thai
- Latin headline/support: Figtree

## Standard feature layout

Use this reading order:

1. Eyebrow
2. Two-line hook
3. One-line explanation
4. Authentic near-black proof panel
5. One Crownheart overlapping the proof panel

Keep the hook short and readable at 360 px. Use no more than four mascot-color sparkles.

## Two-option comparison layout

Use this reading order:

1. Eyebrow
2. Direct comparison headline
3. One-line chooser question
4. Two equal cards
5. Authentic proof strip
6. Optional short chooser reminder

Rules:

- Use identical card dimensions and text baselines.
- Use a 24 px gap between cards.
- Give each card equal visual weight.
- Map one mascot to each card only when the mapping adds meaning.
- Keep mascots clear of copy and align them consistently.
- Put technical detail in the caption rather than shrinking it into the image.

## Authentic capture crop

- Store the untouched capture in the post project's `assets/` folder.
- Crop through CSS with `overflow: hidden`; do not recreate UI.
- Set `margin: 0` on `<figure>` proof containers. Browser default figure margins otherwise shift an apparently centered panel.
- Keep enlargement modest. A 1.0–1.4× enlargement is preferable for low-resolution UI captures.
- Preserve a product-identifying cue such as the composer, prompt, controls, or app chrome.

Example from the Grill Me comparison capture:

```css
.proof-panel {
  left: 54px;
  width: 972px;
  height: 134px;
  margin: 0;
  overflow: hidden;
}

.proof-panel img {
  top: -121px;
  left: -104px;
  width: 1150px;
}
```

Treat these coordinates as source-specific, not a universal preset.

## Visual QA

Inspect both 1080 and 360 px versions.

- Confirm clear hierarchy and a single dominant hook.
- Confirm equal structural margins.
- Confirm card text and option names remain readable.
- Confirm mascot placement does not cover copy.
- Confirm the proof crop is centered, sharp, and authentic.
- Confirm the canonical wordmark is used unchanged.
- Confirm no element is clipped by the canvas.
- Confirm tertiary labels are either readable or intentionally decorative at 360 px.
