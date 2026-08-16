---
name: research
description: Investigate a question against high-trust primary sources and capture the findings in the repository. Use when the user wants a topic researched, docs or API facts gathered, reading legwork delegated to a background agent, or visual-identity findings synthesized into DESIGN.md.
---

# Research

Spin up a **background agent** to do the research while you continue useful work.

## Route the artifact

Choose the destination before dispatching the agent:

- For visual identity, brand tokens, UI styling rules, design-system research, or an explicit DESIGN.md request, update the repository's existing `DESIGN.md`. If none exists, use `.stitch/DESIGN.md` for a Stitch-specific workflow and root `DESIGN.md` otherwise.
- For every other topic, match the repository's research-note convention. If none exists, choose a sensible Markdown path and report it.

Treat `DESIGN.md` as a downstream design-system input, not a generic research notebook. Preserve unrelated existing content.

## Delegate the research

Its job:

1. Inspect the chosen artifact and relevant repository sources before researching externally.
2. Investigate the question against **primary sources**—official docs, source code, specifications, first-party APIs, approved brand guidance, assets, and design files. Follow every claim back to the source that owns it.
3. Write the findings to the chosen artifact and cite each claim's source.
4. Report the artifact path, principal findings, unresolved gaps, and any inferences.

## Write DESIGN.md

For the DESIGN.md branch:

- Use the canonical uppercase filename and preserve the repository's existing location.
- Follow the current [Google DESIGN.md specification](https://github.com/google-labs-code/design.md/blob/main/docs/spec.md): machine-readable tokens in YAML frontmatter and human-readable rationale in Markdown.
- Keep supported sections in canonical order: Overview, Colors, Typography, Layout, Elevation & Depth, Shapes, Components, then Do's and Don'ts. Preserve useful extension sections.
- Put verified exact values in frontmatter. Keep recommendations and uncertain inferences in prose, clearly labeled; never present them as sourced facts.
- Cite evidence near the corresponding rationale or in a Sources extension section. Keep unrelated research out of DESIGN.md.
- Validate with `npx @google/design.md lint <path>` when the CLI is available. Fix errors and report remaining warnings.
