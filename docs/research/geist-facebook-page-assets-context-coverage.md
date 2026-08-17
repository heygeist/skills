# Legacy Geist social context coverage audit

## Scope and method

This audit asks one narrow question: if `setup-social-image` receives the old
`geist-facebook-page-assets` repository as user-supplied evidence, what must it collect and
write so a new workspace has at least the same reusable context for making social posts?

The primary source is the repository at commit
[`634c82484fd075048bcd355af879854e9c929832`](https://github.com/heygeist/geist-facebook-page-assets/tree/634c82484fd075048bcd355af879854e9c929832)
(2026-08-14). The audit inspected its Git tree and source files directly. Historical output
is treated as evidence, not automatically as a current rule: the repository itself says the
brandbook, current social-image references, and ADRs outrank older post implementations.

This report deliberately does **not** update the current repository's `DESIGN.md`. Its target
is the approved, brand-neutral workspace contract:

```text
<workspace>/
├── DESIGN.md
└── .social-image/
    ├── context.md
    ├── caption.md
    ├── sources.md
    ├── assets/
    │   ├── logos/
    │   ├── mascots/
    │   ├── icons/
    │   ├── illustrations/
    │   ├── photos/
    │   ├── fonts/
    │   ├── templates/
    │   ├── references/
    │   └── other/
    └── backups/<timestamp>/
```

## Executive finding

The target contract can preserve all reusable context from the old repository, but a file
move alone is insufficient. The legacy context is distributed across the brandbook,
`CONTEXT.md`, four social-image reference documents, shared CSS, asset manifests, ADRs,
seven post projects, two template families, 37 brand exports, and 13 root tools. The root
README explicitly describes this split between approved identity assets, references,
derived assets, templates, projects, exports, and tools. [Source: workspace map and
workflow](https://github.com/heygeist/geist-facebook-page-assets/blob/634c82484fd075048bcd355af879854e9c929832/README.md)

To reach parity, a migrated sample workspace must synthesize that material into four kinds
of durable input:

1. normative visual decisions in `DESIGN.md`;
2. verified product language and claim constraints in `.social-image/context.md`;
3. reusable caption voice and platform rules in `.social-image/caption.md`;
4. approved files plus explicit provenance in `.social-image/assets/` and
   `.social-image/sources.md`.

Canvas rendering, candidate selection, QA gates, and per-post folder mechanics are not
brand context. They remain responsibilities of the generic `social-image` skill. This
separation preserves the old capability without embedding Geist defaults in
`setup-social-image`.

## Inventory of reusable legacy context

### 1. Product, audience, and brand facts

| Legacy source | Reusable context downstream work learns | Target |
| --- | --- | --- |
| [`assets/brand/brandbook/index.html`](https://github.com/heygeist/geist-facebook-page-assets/blob/634c82484fd075048bcd355af879854e9c929832/assets/brand/brandbook/index.html) | What GEIST and hatchpet mean; positioning; audience; brand idea; beliefs; excluded framings; Crownheart's role and personality; voice; locked decisions. It is the richest source of product and brand intent. | Split verified product facts into `context.md`; put visual rules in `DESIGN.md`; put verbal rules in `caption.md`. |
| [`CONTEXT.md`](https://github.com/heygeist/geist-facebook-page-assets/blob/634c82484fd075048bcd355af879854e9c929832/CONTEXT.md) | Canonical terminology for workspace artifacts and product concepts, including preferred terms and terms to avoid (`Agent Stream`, `Agent App`, `Pet Roam`, `Running`, `Waiting`, and `wait-what`). | `context.md` glossary, fact constraints, and prohibited synonyms. |
| [`docs/adr/0002-brandbook-and-crownheart-mascot.md`](https://github.com/heygeist/geist-facebook-page-assets/blob/634c82484fd075048bcd355af879854e9c929832/docs/adr/0002-brandbook-and-crownheart-mascot.md) | Establishes the brandbook, standalone Crownheart master, and wordmark PNG as canonical, immutable sources. | Asset roles/restrictions in `sources.md`; corresponding visual rules in `DESIGN.md`. |
| [`docs/adr/0003-social-image-system-and-2048-master.md`](https://github.com/heygeist/geist-facebook-page-assets/blob/634c82484fd075048bcd355af879854e9c929832/docs/adr/0003-social-image-system-and-2048-master.md) | Records which social rules supersede older practice: 2048 master, no fill-in template, current palette source, three-value provenance, generation limits, and render gates. | Brand-specific visual rationale in `DESIGN.md`; operational parts in `social-image`; source precedence noted in `sources.md`. |

`context.md` must not copy only the old root `CONTEXT.md`. That file is mostly a glossary;
the audience, positioning, brand promise, anti-positioning, character narrative, and voice
live in the brandbook. Using either one alone loses reusable context.

### 2. Visual system and social-post grammar

The authoritative visual identity is the Brand Book v2. It defines a light, white-surface
system; Mango, Sky Air, Sunshine, Warm Ink, warm hairlines and tints; an 80/15/5 colour
ratio; exact wordmark and mascot rules; Figtree/Geist Mono typography; tone; and explicit
do/don't guidance. [Source: brandbook](https://github.com/heygeist/geist-facebook-page-assets/blob/634c82484fd075048bcd355af879854e9c929832/assets/brand/brandbook/index.html)

The social layer adds reusable composition semantics:

| Legacy source | Reusable context downstream work learns | Target |
| --- | --- | --- |
| [`templates/geist-social-image/base.css`](https://github.com/heygeist/geist-facebook-page-assets/blob/634c82484fd075048bcd355af879854e9c929832/templates/geist-social-image/base.css) | Exact colour tokens; font files/weights; white surface, border, shadow and radius treatments; eight semantic zones; proof/card/footer primitives; mascot placement; per-canvas styles. | Exact brand tokens, elevation, shapes, typography and semantic component treatment in `DESIGN.md`. Canvas mechanics stay in `social-image`. |
| [`layout-grammar.md`](https://github.com/heygeist/geist-facebook-page-assets/blob/634c82484fd075048bcd355af879854e9c929832/.agents/skills/geist-social-image/references/layout-grammar.md) | Content-led composition catalogue (proof leads, side-by-side, two equal cards, prompt alone, prompt-to-artifact, stacked, overlap, result-led inset), hierarchy, fixed reading order, headline behavior, and cross-canvas shedding. | Composition tendencies, hierarchy, whitespace, typography behavior and do/don't rules in `DESIGN.md`; sizes and export behavior stay in `social-image`. |
| [`visual-contract.md`](https://github.com/heygeist/geist-facebook-page-assets/blob/634c82484fd075048bcd355af879854e9c929832/.agents/skills/geist-social-image/references/visual-contract.md) | Canonical asset locations, immutable marks, authentic-capture cropping, proof labels, generated-versus-real honesty, export naming, and visual QA. | Visual/provenance rules in `DESIGN.md` and `sources.md`; render/export rules stay in `social-image`. |
| [`reference-example.html`](https://github.com/heygeist/geist-facebook-page-assets/blob/634c82484fd075048bcd355af879854e9c929832/templates/geist-social-image/reference-example.html) and [`reference-example.png`](https://github.com/heygeist/geist-facebook-page-assets/blob/634c82484fd075048bcd355af879854e9c929832/templates/geist-social-image/reference-example.png) | One solved composition showing how tokens, zones, authentic proof, wordmark, mascot, and per-canvas behavior work together. It explicitly says it is for reading, not cloning. | `assets/references/`, marked `reference-only`; optionally its HTML in `assets/templates/` with the no-instantiation restriction. |
| [`templates/geist-social-image/README.md`](https://github.com/heygeist/geist-facebook-page-assets/blob/634c82484fd075048bcd355af879854e9c929832/templates/geist-social-image/README.md) | Governing principle: share a grammar but compose for the content; per-post CSS may change crop/layout but must not redeclare brand colours. | Normative no-house-layout rule in `DESIGN.md`; implementation contract in `social-image`. |

The migrated `DESIGN.md` therefore needs more than a palette. At minimum it must describe
overview, colours and their semantic roles, multilingual typography, composition and
hierarchy, whitespace, depth, shapes, wordmark use, mascot use, imagery/capture treatment,
proof labels, and visual do/don't rules. It should not hard-code the old renderer or canvas
sizes as design-system input.

### 3. Caption and Facebook voice

The reusable caption contract is concentrated in
[`caption-contract.md`](https://github.com/heygeist/geist-facebook-page-assets/blob/634c82484fd075048bcd355af879854e9c929832/.agents/skills/geist-social-image/references/caption-contract.md).
It defines Thai-first conversational copy using `เรา`, a warm/practical/lightly playful
voice, short mobile paragraphs, standalone `.` section separators, exact official names,
plain-language explanations, honest limitations, low-friction CTAs, and guards against
unsupported comparative or performance claims. It also makes checking—not silently
rewriting—the default behavior.

The retired
[`caption-template.md`](https://github.com/heygeist/geist-facebook-page-assets/blob/634c82484fd075048bcd355af879854e9c929832/templates/facebook-single-image-text-post/caption-template.md)
provides a reusable long-form Facebook sequence: hook, relatable problem, cause, feature,
example, practical value, limitation, broader use, and one comment CTA. Actual approved
captions under
[`projects/posts/`](https://github.com/heygeist/geist-facebook-page-assets/tree/634c82484fd075048bcd355af879854e9c929832/projects/posts)
show the format applied across seven post projects, including `ask-matt`, `grill-me`,
`grill-me-vs-grill-with-docs`, `post-001-hello-geist`, and `wait-what`.

For parity, `caption.md` needs the voice, language default, paragraph/separator convention,
CTA/link/mention/hashtag rules, accuracy guards, image-caption non-duplication rule, and a
small set of user-approved examples. Historical captions should remain examples rather
than automatically becoming normative rules.

### 4. Asset library

The repository's reusable visual inventory is broad enough that `assets/` must support
mascots and arbitrary brand media, not just logos and fonts:

| Legacy directory/files | Inventory and role | Target |
| --- | --- | --- |
| [`assets/brand/brandbook/`](https://github.com/heygeist/geist-facebook-page-assets/tree/634c82484fd075048bcd355af879854e9c929832/assets/brand/brandbook) | Authoritative brandbook HTML, primary wordmark PNG, and the 835×940 Crownheart standalone master. | `logos/`, `mascots/`, and a `references/` copy of the brandbook or its user-approved source link. |
| [`assets/pets/heygeist-pets/`](https://github.com/heygeist/geist-facebook-page-assets/tree/634c82484fd075048bcd355af879854e9c929832/assets/pets/heygeist-pets) | Crownheart spritesheet and frames plus supporting characters; its manifest identifies Crownheart as primary and distinguishes the standalone master from animation sources. | `mascots/`, with semantic roles and restrictions in `sources.md`. |
| [`assets/pets/geist-flame/`](https://github.com/heygeist/geist-facebook-page-assets/tree/634c82484fd075048bcd355af879854e9c929832/assets/pets/geist-flame) | Identity reference, 12 generated poses, seven carousel selections, contact sheets and machine-readable pose/validation manifests. | Approved files in `mascots/` or `illustrations/`; contact sheets in `references/`; retain identity and derivation links in `sources.md`. |
| [`assets/references/`](https://github.com/heygeist/geist-facebook-page-assets/tree/634c82484fd075048bcd355af879854e9c929832/assets/references) | Two character exploration sheets, a contact sheet, Noto Sans Thai plus its OFL, and Figtree 700. | `references/` and `fonts/`; keep reference-only status explicit. |
| [`assets/derived/`](https://github.com/heygeist/geist-facebook-page-assets/tree/634c82484fd075048bcd355af879854e9c929832/assets/derived) | Seven extracted character crops, their contact sheet, and a manifest mapping each output back to its source/crop. | `illustrations/` or `references/`, preserving parent-source relationships. |
| [`projects/videos/geist-pet-roam/assets/fonts/`](https://github.com/heygeist/geist-facebook-page-assets/tree/634c82484fd075048bcd355af879854e9c929832/projects/videos/geist-pet-roam/assets/fonts) | Figtree Regular/Semibold/ExtraBold and Geist Mono used by current shared CSS. | `fonts/`, after rights and license confirmation. |
| [`exports/brand/`](https://github.com/heygeist/geist-facebook-page-assets/tree/634c82484fd075048bcd355af879854e9c929832/exports/brand) | Approved cover/profile deliverables plus 24 classic/extended cover directions and contact sheets. These encode successful and historical layout vocabulary. | Canonical outputs in the relevant asset folders; selected style examples/contact sheets in `references/`, not all as normative design. |
| [`projects/posts/*/assets`](https://github.com/heygeist/geist-facebook-page-assets/tree/634c82484fd075048bcd355af879854e9c929832/projects/posts) | Untouched, post-specific real captures used as proof. | Do not promote automatically to reusable brand assets. Copy only user-approved reusable examples into `references/` or `photos/`; per-post captures belong with the post. |

The Git tree contains 4 brandbook files, 49 pet files, 7 root reference files, 9 derived
files, and 37 reusable brand exports. This breadth validates the approved flexible asset
categories (`logos`, `mascots`, `icons`, `illustrations`, `photos`, `fonts`, `templates`,
`references`, `other`). Folder name is only coarse organization; `sources.md` must carry the
true semantic role.

### 5. Templates, examples, and scripts

There are two generations of post production:

- The current `geist-social-image` system uses shared grammar, no fill-in template, a
  2048×2048 master plus link-card and portrait compositions, and Playwright gates. [Source:
  current skill](https://github.com/heygeist/geist-facebook-page-assets/blob/634c82484fd075048bcd355af879854e9c929832/.agents/skills/geist-social-image/SKILL.md)
- The retired `facebook-single-image-text-post` pair uses a fixed 1080×1080 template,
  exports a 2160×2160 copy, and survives only for already-published posts. [Source: retired
  template README](https://github.com/heygeist/geist-facebook-page-assets/blob/634c82484fd075048bcd355af879854e9c929832/templates/facebook-single-image-text-post/README.md)

The seven post projects are an important context corpus: editable HTML reveals actual
composition and crop choices; captions show the voice; authentic captures show proof
handling; exports show approved results; and `PROCESS.md`, `NOTES.md`, and
`selections.json` capture rationale and mobile-readability decisions. The detailed
[`grill-me-vs-grill-with-docs/PROCESS.md`](https://github.com/heygeist/geist-facebook-page-assets/blob/634c82484fd075048bcd355af879854e9c929832/projects/posts/grill-me-vs-grill-with-docs/PROCESS.md)
is the strongest end-to-end example, while the
[`post-001-hello-geist` selection record](https://github.com/heygeist/geist-facebook-page-assets/blob/634c82484fd075048bcd355af879854e9c929832/projects/posts/post-001-hello-geist/selections.json)
shows how audience, type fallback, character continuity, safe frames, and per-slide choices
were recorded.

The 13 root tools cover brand cover/profile exploration, Thai tone exploration, pet source
download/cropping, character extraction and edge validation, pose preparation, and the
retired renderer. [Source: `tools/`](https://github.com/heygeist/geist-facebook-page-assets/tree/634c82484fd075048bcd355af879854e9c929832/tools)
The current skill adds a Playwright renderer and contact-sheet builder. Its renderer waits
for fonts, produces three exact canvas sizes, and gates page errors, overflow, dimensions,
token drift, and headline wrap risk; it also produces a 360px legibility preview. [Source:
`shot.mjs`](https://github.com/heygeist/geist-facebook-page-assets/blob/634c82484fd075048bcd355af879854e9c929832/.agents/skills/geist-social-image/scripts/shot.mjs)

These scripts are operational knowledge, not user design context. `setup-social-image`
should not copy them into `DESIGN.md`. The generic `social-image` skill should provide the
equivalent renderer, candidate workflow, validation, and post project convention.

### 6. Operational conventions to preserve outside DESIGN.md

The old skill requires the full source content and user-supplied caption, resolves one
takeaway, proposes three headlines and waits, creates three structurally different
compositions, shows a contact sheet plus full-size candidates, promotes only the selected
variant, checks rather than rewrites the caption, and performs both automated and visual
QA. It also separates authentic captures from generated media because folder placement is
part of the provenance gate. [Source: current skill workflow](https://github.com/heygeist/geist-facebook-page-assets/blob/634c82484fd075048bcd355af879854e9c929832/.agents/skills/geist-social-image/SKILL.md)

The workspace convention is one self-contained project per post with local assets,
generated files and sidecars, exports, working candidates, editable HTML, caption, and an
optional process record. Root-level approved assets and post-specific artifacts are kept
separate. [Source: root README](https://github.com/heygeist/geist-facebook-page-assets/blob/634c82484fd075048bcd355af879854e9c929832/README.md)

For generated imagery, the old system allows generation only when HTML/CSS cannot express
the required scene or after three failed refinement rounds; it forbids generated mascots,
wordmarks, proof, and in-image text, requires a reproducibility sidecar, and labels generated
media honestly. [Source: image-generation contract](https://github.com/heygeist/geist-facebook-page-assets/blob/634c82484fd075048bcd355af879854e9c929832/.agents/skills/geist-social-image/references/image-generation.md)

These behaviors should be tested in the generic skill, but they should not be installed as
Geist-specific defaults by `setup-social-image`.

## Compatibility matrix

| Required capability | Legacy source coverage | New target coverage | Parity condition |
| --- | --- | --- | --- |
| Product facts and terminology | Brandbook + `CONTEXT.md` | `.social-image/context.md` | Merge both sources; retain preferred and avoided terms, verified claims, audience, positioning, and explicit gaps. |
| Visual identity | Brandbook + base CSS + ADRs | Root `DESIGN.md` | Capture exact tokens, typography, roles, composition behavior, depth, shapes, asset use, imagery, and do/don't rules. |
| Social visual style | Layout and visual contracts + approved examples | `DESIGN.md` + `assets/references/` | Preserve content-led composition and proof honesty; keep examples reference-only. |
| Caption voice | Caption contract + caption template + approved captions | `.social-image/caption.md` | Preserve Thai/Facebook formatting, claim guards, CTA behavior, and confirmed examples. |
| Canonical logos/mascots | Brandbook masters + pet manifests | `assets/logos/`, `assets/mascots/`, `sources.md` | Distinguish canonical standalone assets, animation sources, supporting characters, and immutable-use rules. |
| Other reusable assets | Fonts, derived art, brand exports, exploration sheets | Flexible asset library | Copy only approved files; retain reference/canonical status and derivation. |
| Provenance | Scattered READMEs, manifests, code constants, and folder convention | `sources.md` | Normalize source, copied path, type, role, ownership/license, restrictions, status, and checksum for every copied file. |
| Examples | Seven post projects, 37 brand exports, contact sheets | `assets/references/` plus approved examples in context files | Include representative approved examples and rationale, not every historical artifact as a rule. |
| Rendering and QA | Skill scripts and references | Generic `social-image` skill | Preserve candidate approvals, multi-canvas outputs, automated gates, full-size/360px visual review, and caption checking. |
| Setup/update safety | No generic onboarding equivalent | `setup-social-image` | Inspect, interview, label inferences, preview full diff/assets/gaps, wait for approval, back up changed text, write atomically, never silently delete assets. |

## Gaps and conflicts the migrated sample must resolve

### Release-blocking coverage gaps

1. **No comprehensive provenance ledger exists.** The repository has no root license file,
   no checksum inventory, and no central ownership/restrictions record. Noto Sans Thai has
   an adjacent OFL, but the Figtree/Geist Mono files, wordmark, mascot, supporting pets,
   screenshots, generated poses, and brand exports do not have equivalent per-file license
   records in the tree. The migration must not infer redistribution rights; it must ask the
   user to confirm them and record every approved file in `sources.md`. [Source: reference
   asset directory](https://github.com/heygeist/geist-facebook-page-assets/tree/634c82484fd075048bcd355af879854e9c929832/assets/references)

2. **The product context is split.** `CONTEXT.md` alone omits positioning, audience,
   beliefs, brand exclusions, and most character/voice context; the brandbook alone omits
   much of the product glossary. A complete sample must synthesize both and surface any
   contradictions for approval.

3. **Historical files conflict with the current canonical system.** Older generators use
   cream/paper backgrounds, earlier Mango/Sky values, system fonts, redrawn/recoloured
   wordmarks, and 1080-era layouts, while ADR 0003 and the current visual contract explicitly
   retire those practices. For example, the current ADR documents the wrong legacy ink and
   muted grey and replaces cream cards with white/zebra surfaces. [Source: ADR 0003](https://github.com/heygeist/geist-facebook-page-assets/blob/634c82484fd075048bcd355af879854e9c929832/docs/adr/0003-social-image-system-and-2048-master.md)
   Setup must label old output as historical evidence and ask the user to confirm current
   normative choices; it must not average or merge token values.

4. **Two conflicts also exist inside nominally current material.** The brandbook first
   describes Mango as “the one CTA,” but its action-control section says a later ADR retired
   the one-fill-per-view rule and permits many action fills. Meanwhile, a comment in
   `base.css` still recommends 55–65% headline width even though ADR 0003, the layout
   grammar, and the implemented renderer retire that band and fail only at 92% wrap risk.
   These conflicts must appear in setup's inference/approval preview; only the user's
   confirmed interpretation may become normative. [Source: brandbook colour section](https://github.com/heygeist/geist-facebook-page-assets/blob/634c82484fd075048bcd355af879854e9c929832/assets/brand/brandbook/index.html#L200-L239),
   [source: actual headline gate](https://github.com/heygeist/geist-facebook-page-assets/blob/634c82484fd075048bcd355af879854e9c929832/.agents/skills/geist-social-image/scripts/shot.mjs#L164-L193)

5. **Generated-pose provenance is below the newer contract.** The Geist Flame manifest
   records pose role, dimensions, alpha validation, and an identity reference, but not a
   per-file model, prompt, seed, creation time, or reason, even though the current generation
   contract requires reproducible sidecars with those fields. Migration must report those
   values as unknown rather than backfilling invented metadata. [Source: generated-pose
   manifest](https://github.com/heygeist/geist-facebook-page-assets/blob/634c82484fd075048bcd355af879854e9c929832/assets/pets/geist-flame/generated/manifest.json),
   [source: image-generation contract](https://github.com/heygeist/geist-facebook-page-assets/blob/634c82484fd075048bcd355af879854e9c929832/.agents/skills/geist-social-image/references/image-generation.md)

6. **The brandbook points to a missing design-system file.** Its footer says interface
   components/icons live in `GEIST-design-system.html`, but that file is not present in the
   audited Git tree. The root README also describes a `content/` area that is absent from
   the same tree. These are explicit gaps, not information setup may invent. [Source:
   brandbook footer](https://github.com/heygeist/geist-facebook-page-assets/blob/634c82484fd075048bcd355af879854e9c929832/assets/brand/brandbook/index.html)

7. **Some derivation metadata is scattered or local-machine-specific.** Pet download URLs
   and creator allowlists live inside generator code, while a generated-pose tool refers to
   user-specific cache and runtime paths. [Source: pet cover generator](https://github.com/heygeist/geist-facebook-page-assets/blob/634c82484fd075048bcd355af879854e9c929832/tools/generators/generate_geist_pet_cover_examples.py),
   [source: pose builder](https://github.com/heygeist/geist-facebook-page-assets/blob/634c82484fd075048bcd355af879854e9c929832/tools/scripts/build-geist-flame-poses.js)
   A migrated sample must preserve durable source/derivation facts but must not treat local
   paths as portable provenance.

### Required sample-workspace checklist

Before declaring the migrated sample as context-complete relative to the old repository,
verify all of the following:

- `DESIGN.md` contains the confirmed current visual identity and social composition rules,
  not historical token conflicts, and passes DESIGN.md lint.
- `context.md` combines the brandbook's identity/positioning/audience facts with the root
  glossary, includes allowed/prohibited claims, and lists unresolved product gaps.
- `caption.md` records the confirmed Thai-first/Facebook voice, structure, formatting,
  CTA/hashtag/link policy, accuracy guards, and at least a small approved example set.
- `sources.md` has one entry per copied asset with original source, copied path, type,
  semantic role, canonical/reference status, ownership/license, restrictions, and checksum.
- Canonical wordmark and standalone mascot are copied separately from spritesheets and
  supporting characters; their no-redraw/no-recolour/no-generation restrictions are explicit.
- Fonts needed for Thai, Latin, and mono/code content are present only after license/usage
  confirmation, with correct family/weight/language roles.
- Reference-only character explorations, contact sheets, cover directions, and representative
  approved posts cannot be mistaken for canonical assets or templates.
- Derived/generated assets retain their parent source, generation/derivation method, and
  honest labelling. Authentic proof captures remain distinguishable from generated media.
- No fill-in-the-blank Geist layout is inferred from the old template corpus. The reusable
  rule remains grammar plus content-specific composition.
- The generic `social-image` flow still supports headline approval, three structural
  candidates, contact-sheet/full-size review, multi-canvas export, automated gates, 360px
  QA, and caption checking without embedding any Geist brand values.
- Re-running setup previews diffs, preserves untouched assets, backs up changed context
  files, reports orphans without deleting them, and requires new approval for material
  changes.

## Conclusion

The approved target structure is sufficient, and it is cleaner than the legacy repository
because it gives visual rules, product facts, caption behavior, and provenance distinct
homes. Context parity depends on synthesis and source precedence, not raw file count. The
most important test is that a sample post can be produced using only the migrated workspace
context plus generic `social-image` mechanics while matching the old system's current
identity, voice, proof honesty, asset fidelity, and QA behavior—without importing a single
Geist default into `setup-social-image` itself.
