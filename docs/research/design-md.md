# Research: routing a skill artifact to `DESIGN.md`

_Researched 2026-08-16. The repository had no existing research-note convention, so this note is stored under `docs/research/`._

## Conclusion

`DESIGN.md` is not a generic Markdown research notebook. It is a portable description of a product or brand's visual identity for coding agents: exact design tokens plus prose that explains the design's intent and application. Google describes it as a persistent, structured design-system source of truth, and its draft specification is intended to work across tools and platforms ([Google's announcement](https://blog.google/innovation-and-ai/models-and-research/google-labs/stitch-design-md/), [official repository README](https://github.com/google-labs-code/design.md/blob/9bf8eae67128b6cc55ad9bf86665767deb4c11cd/README.md#designmd)).

The requested phrase “move the input of this skill to design md” most likely means **move the skill's output/destination to `DESIGN.md`**. In the current research skill, the question and sources are inputs; the Markdown file it writes is the output. There is one reasonable alternative reading: `DESIGN.md` is the research skill's output and then becomes an input to a downstream design or coding agent. Google's own Stitch extraction skill uses exactly this producer/consumer language: the skill writes `.stitch/DESIGN.md`, and that file becomes the input to the design-system management step ([official Stitch extraction skill](https://github.com/google-labs-code/stitch-skills/blob/535b0889a46868c9b08f8a7f7084db3c1958a2b6/plugins/stitch-design/skills/extract-design-md/SKILL.md#phase-3-write-the-designmd)).

Therefore:

- If the skill researches a visual identity or extracts a design system, direct its output to `DESIGN.md`.
- If it performs arbitrary research, keep its general Markdown research note and add a separate synthesis step that updates `DESIGN.md` only with verified visual-design facts. Sending unrelated findings into `DESIGN.md` would conflict with the format's documented purpose and canonical sections ([official format specification](https://github.com/google-labs-code/design.md/blob/9bf8eae67128b6cc55ad9bf86665767deb4c11cd/docs/spec.md#designmd-format)).

## What `DESIGN.md` is

The format is a self-contained, plain-text representation of the visual identity of a brand and product. It exists so stylistic choices remain consistent across design sessions, agents, and tools, while remaining understandable and editable by humans ([official format specification](https://github.com/google-labs-code/design.md/blob/9bf8eae67128b6cc55ad9bf86665767deb4c11cd/docs/spec.md#designmd-format)).

Google's format has two complementary layers:

1. Optional YAML frontmatter for machine-readable design tokens.
2. A Markdown body for human-readable design rationale and guidance.

The tokens are normative values; prose explains why they exist and how to apply them ([official README, “File Structure”](https://github.com/google-labs-code/design.md/blob/9bf8eae67128b6cc55ad9bf86665767deb4c11cd/README.md#file-structure)). Google's philosophy goes further: prose is the most important part because it captures how the design looks, feels, and behaves; tokens support that context rather than replace it ([official philosophy](https://github.com/google-labs-code/design.md/blob/9bf8eae67128b6cc55ad9bf86665767deb4c11cd/PHILOSOPHY.md#designmd-philosophy)).

The format remains a draft/alpha specification under active development, so a skill should avoid inventing stricter universal requirements than the official spec and should validate generated artifacts with the current CLI when practical ([Google's announcement](https://blog.google/innovation-and-ai/models-and-research/google-labs/stitch-design-md/), [official README status](https://github.com/google-labs-code/design.md/blob/9bf8eae67128b6cc55ad9bf86665767deb4c11cd/README.md#status)).

## Canonical filename and location

The canonical spelling used consistently by Google's repository, examples, documentation, and CLI is uppercase **`DESIGN.md`**. The official examples are all named `DESIGN.md`, and commands use forms such as `npx @google/design.md lint DESIGN.md` ([official examples](https://github.com/google-labs-code/design.md/tree/9bf8eae67128b6cc55ad9bf86665767deb4c11cd/examples), [official CLI reference](https://github.com/google-labs-code/design.md/blob/9bf8eae67128b6cc55ad9bf86665767deb4c11cd/README.md#cli-reference)).

Location is a workflow convention, not a requirement of the core format:

- The independent DesignMD explainer recommends placing `DESIGN.md` in the project root ([DesignMD explainer](https://designmd.ai/what-is-design-md)). This is a useful tool-agnostic default, but DesignMD is not the owner of Google's specification.
- Google's Stitch agent skills use `.stitch/DESIGN.md` as their product-specific workspace convention ([official Stitch skill](https://github.com/google-labs-code/stitch-skills/blob/535b0889a46868c9b08f8a7f7084db3c1958a2b6/plugins/stitch-design/skills/extract-design-md/SKILL.md#phase-3-write-the-designmd), [official Stitch skills index](https://github.com/google-labs-code/stitch-skills/blob/535b0889a46868c9b08f8a7f7084db3c1958a2b6/README.md#design-stitch-design)).
- Google's core specification defines the file's content but does not prescribe a repository path ([official specification](https://github.com/google-labs-code/design.md/blob/9bf8eae67128b6cc55ad9bf86665767deb4c11cd/docs/spec.md)).

An agent skill should therefore discover and preserve an existing repository convention. If neither `DESIGN.md` nor `.stitch/DESIGN.md` exists, use root `DESIGN.md` for a tool-agnostic artifact, or `.stitch/DESIGN.md` only when the workflow is explicitly Stitch-specific.

## Intended structure

The current alpha schema permits these frontmatter keys ([official schema](https://github.com/google-labs-code/design.md/blob/9bf8eae67128b6cc55ad9bf86665767deb4c11cd/docs/spec.md#schema)):

```yaml
---
version: alpha          # optional
name: Project Name
description: ...        # optional
omitted: [...]          # optional, documents intentionally absent sections
colors: {...}
typography: {...}
rounded: {...}
spacing: {...}
components: {...}
---
```

Token references use `{path.to.token}`. The body uses `##` headings. Relevant sections should appear in this order:

1. Overview (alias: Brand & Style)
2. Colors
3. Typography
4. Layout (alias: Layout & Spacing)
5. Elevation & Depth (alias: Elevation)
6. Shapes
7. Components
8. Do's and Don'ts

Sections may be omitted when irrelevant. Unknown sections are preserved, which allows domains such as motion or iconography to extend the document, but duplicate section headings are invalid ([official section rules](https://github.com/google-labs-code/design.md/blob/9bf8eae67128b6cc55ad9bf86665767deb4c11cd/docs/spec.md#sections), [unknown-content behavior](https://github.com/google-labs-code/design.md/blob/9bf8eae67128b6cc55ad9bf86665767deb4c11cd/docs/spec.md#consumer-behavior-for-unknown-content)).

The core spec permits absent frontmatter. A production skill may deliberately require it for reliable machine consumption, but that is a workflow-level constraint. Google's Stitch extraction skill, for example, requires at least `name` and `colors` because its downstream skills parse those values ([official Stitch extraction skill](https://github.com/google-labs-code/stitch-skills/blob/535b0889a46868c9b08f8a7f7084db3c1958a2b6/plugins/stitch-design/skills/extract-design-md/SKILL.md#phase-3-write-the-designmd)).

## Recommended skill contract

For a design-focused research or extraction skill, the clearest contract is:

> Investigate the project's visual identity using primary sources: source code, theme and token files, official brand guidance, approved assets, and first-party design files. Synthesize verified findings into the repository's existing `DESIGN.md`. If no convention exists, write `DESIGN.md` at the project root; use `.stitch/DESIGN.md` only for a Stitch-specific workflow. Preserve the canonical filename casing and the official section order. Put exact values in YAML frontmatter and explain intent, usage, and constraints in the Markdown prose. Preserve relevant existing content and clearly distinguish sourced facts from inference. Validate the result with `npx @google/design.md lint <path>` when the CLI is available.

For the existing general-purpose `research` skill, a safer conditional change is:

> When the requested artifact is a visual design system, write or update `DESIGN.md` using the official DESIGN.md format. Otherwise, write a normal research note; do not use `DESIGN.md` for non-design findings.

This preserves the research skill's broad purpose while making `DESIGN.md` a precise output target when the subject actually matches the format.

## Source assessment

- **Primary:** Google's `google-labs-code/design.md` repository, its specification, philosophy, examples, and CLI documentation.
- **Primary:** Google's announcement of the open-sourced draft format.
- **Primary for the Stitch workflow:** Google's `google-labs-code/stitch-skills` repository.
- **Secondary for the Google format:** `designmd.ai/what-is-design-md`. Its root-placement guidance is useful, but claims about the format were checked against Google's own sources above.
