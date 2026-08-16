---
version: alpha
name: HeyGeist
description: Warm, practical, lightly playful visual identity for HeyGeist product and social work.
omitted:
  - spacing
  - rounded
colors:
  canvas: "#ffffff"
  primary: "#20201c"
  mango: "#ff8442"
  muted: "#7c7567"
  surface: "#fafaf8"
  hairline: "#ece7de"
  mango-hover: "#e5661d"
  mango-text: "#c24e0e"
  sky: "#56c4f0"
  sky-deep: "#0f7396"
  sunshine: "#ffce52"
  mint: "#1fb89a"
typography:
  thai:
    fontFamily: Noto Sans Thai
  latin:
    fontFamily: Figtree
components:
  social-image-canvas:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.primary}"
  social-image-surface:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
  social-image-action:
    backgroundColor: "{colors.mango}"
    textColor: "{colors.primary}"
  social-image-muted-copy:
    textColor: "{colors.muted}"
  social-image-hairline:
    backgroundColor: "{colors.hairline}"
  social-image-action-hover:
    backgroundColor: "{colors.mango-hover}"
  social-image-accent-copy:
    textColor: "{colors.mango-text}"
  social-image-secondary:
    backgroundColor: "{colors.sky}"
  social-image-secondary-copy:
    textColor: "{colors.sky-deep}"
  social-image-sunshine:
    backgroundColor: "{colors.sunshine}"
  social-image-mint:
    backgroundColor: "{colors.mint}"
---

# HeyGeist Design System

## Overview

HeyGeist should feel warm, practical, and lightly playful. Social graphics explain unfamiliar agent concepts through one strong idea and a clear artifact, never through decorative complexity or unsupported spectacle.

Use the canonical `GEIST.` wordmark and Crownheart Geist files unchanged when approved assets are installed. Treat other Pets as supporting characters unless the brief gives one a specific role.

## Colors

- **Canvas (`{colors.canvas}`):** Primary background.
- **Primary (`{colors.primary}`):** Ink color for primary type and navigation.
- **Mango (`{colors.mango}`):** Active signal, CTA, and focused emphasis.
- **Muted (`{colors.muted}`):** Secondary copy and metadata.
- **Surface (`{colors.surface}`):** Subtle cards and proof containers.
- **Hairline (`{colors.hairline}`):** Warm borders and separation.
- **Mango Hover (`{colors.mango-hover}`):** Interactive hover state.
- **Mango Text (`{colors.mango-text}`):** Accessible Mango-family foreground where filled Mango is unsuitable.
- **Sky (`{colors.sky}`) and Sky Deep (`{colors.sky-deep}`):** Illustration and secondary comparison roles.
- **Sunshine (`{colors.sunshine}`) and Mint (`{colors.mint}`):** Supporting illustration accents.

Keep white dominant. Reserve Mango for active meaning. Use Sky and the supporting accents when the content needs a second role, not as ambient decoration.

## Typography

Use Noto Sans Thai for Thai and Figtree for Latin when approved font files are installed. Use the runtime's configured system fallbacks when they are unavailable.

For social headlines, prefer spoken Thai arranged into one or two intentional lines. Make the headline a human reaction rather than a product title; let the subhead explain what prompted it.

## Layout

Build around one dominant hook and one clear reading path. Let the source content choose the structure—artifact, comparison, quote, sequence, before/after, or data—rather than repeating a brand template.

Use white negative space as an active part of the composition. Keep each headline line within the renderer's safe width and reduce supporting detail deliberately for landscape and portrait canvases.

## Elevation & Depth

Create depth with warm hairlines and restrained surface shifts. Prefer `{colors.hairline}` borders over large warm filled backgrounds or heavy shadows.

## Shapes

Let the generic social-image canvas grammar determine structural radii. Keep shapes quiet enough that typography and proof remain dominant.

## Components

- **Wordmark:** Use only an approved canonical file. Preserve its aspect ratio and color.
- **Mascot:** Use Crownheart Geist by default when one mascot is needed and an approved asset is installed. Preserve the original file.
- **Proof container:** Use `{components.social-image-surface}` with a warm hairline.
- **Active signal:** Use `{components.social-image-action}` for compact emphasis, not large decorative fields.
- **Brand fallback:** Use a plain text brand label when no approved wordmark is available.

## Do's and Don'ts

- Do keep the canvas white, type Ink, and active signals Mango.
- Do use authentic product artifacts when the visual claim depends on product behavior.
- Do keep wordmark and mascot assets unchanged.
- Do explain unfamiliar product language in supporting copy.
- Don't redraw, trace, recolor, or generate the wordmark or mascot.
- Don't use Sky or supporting accents as default decoration.
- Don't put a `REAL` label on a mock, recreation, or generated image.
- Don't imply performance, quality, or time-saving claims through visual treatment when the source does not support them.

## Social Image Provenance

Map runtime provenance values to these visible HeyGeist labels:

- `real`: `REAL …`, naming the source only when it produced the capture.
- `example`: `ตัวอย่าง · EXAMPLE`.
- `generated`: `ภาพประกอบ AI · AI ILLUSTRATION`.

Treat an incorrect `REAL` label as a release blocker.
