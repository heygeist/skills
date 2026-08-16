# setup-social-image legacy forward test

## Scope

This forward test compares the brand-neutral `setup-social-image` workspace contract with
the reusable context in `heygeist/geist-facebook-page-assets` at commit
`634c82484fd075048bcd355af879854e9c929832`. It follows the detailed inventory in
[`docs/research/geist-facebook-page-assets-context-coverage.md`](../research/geist-facebook-page-assets-context-coverage.md).

The test used the legacy repository as explicit user-supplied evidence. It did not add any
Geist defaults to either generic skill.

## Migrated profile

The local fixture synthesized:

- root `DESIGN.md` from the current brandbook, social-image grammar, and ADR 0003;
- `.social-image/context.md` from brandbook identity/audience/positioning plus the root
  product glossary;
- `.social-image/caption.md` from the current Thai Facebook caption contract;
- `.social-image/sources.md` and `asset-manifest.json` with seven copied files and four
  external evidence links;
- canonical wordmark, canonical standalone Crownheart mascot, reference-only Crownheart
  animation source, two reference images, Noto Sans Thai, and its OFL notice.

The fixture deliberately labelled unresolved redistribution rights rather than inferring a
license. Legacy binary assets and the generated sample post are therefore not committed to
this repository.

## Results

| Check | Result |
|---|---|
| Dry run performs no workspace writes | Pass |
| Setup apply writes the approved profile | Pass |
| Workspace validator | Pass, no failures or orphan warnings |
| Social-image resolver | Pass, design/context complete and seven assets resolved |
| Google DESIGN.md lint | Pass, 0 errors and 0 warnings; spacing/rounding reported as informational gaps |
| Canonical vs reference-only roles | Pass |
| Mascot master vs animation source | Pass |
| Per-file SHA-256 verification | Pass |
| Repeated apply | Covered by package smoke test; no text backup and no duplicate copy |
| Legacy context preservation | Covered by package smoke test; reported and left untouched |
| Same-name asset collision | Covered by package smoke test; hash-suffixed without overwrite |
| Replaced asset preservation | Covered by package smoke test; old file reported as orphan |

## Example post

A local Thai example post was created using only the migrated workspace profile plus the
generic `social-image` renderer. It visualizes the four-part profile: design, product,
caption, and assets. The canonical wordmark and standalone mascot were selected by semantic
role from the manifest.

All automated export gates passed:

| Canvas | Dimensions | Headline line widths |
|---|---:|---:|
| Square | 2048 × 2048 | 74.7%, 69.8% |
| Landscape | 1200 × 630 | 61.0%, 57.0% |
| Portrait | 1080 × 1350 | 77.7%, 72.7% |

The 360 px preview and three-canvas contact sheet were visually inspected. Images loaded,
Thai fonts rendered, the mascot and wordmark retained their aspect ratios, proof was labelled
as an example, and no content clipped or overflowed.

## Parity verdict

The new structure reaches functional context parity when its files are consumed together.
It is more explicit than the legacy structure about source precedence, semantic asset roles,
canonical/reference status, checksums, and preservation behavior.

Parity is not the same as copying every old file. Post-specific screenshots, historical
templates, render scripts, and obsolete outputs remain outside reusable workspace context.
Full distributable asset parity is still blocked until the user confirms ownership and
license terms for the wordmark, mascots, Figtree/Geist Mono files, generated poses, and
historical exports. Missing generation metadata and missing files named by the legacy
brandbook remain explicit gaps rather than invented facts.
