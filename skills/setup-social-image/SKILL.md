---
name: setup-social-image
description: Interview a user, inspect their supplied brand and post references, and create or update the workspace DESIGN.md, reusable social context, caption guidance, provenance records, and flexible asset library consumed by $social-image. Use when a workspace needs social-image context initialized, migrated, or refreshed from user-approved material.
---

# Setup Social Image

Build one reusable social-image context from the user's own material and decisions. Ship no brand identity or stylistic defaults with this skill.

## Contract

- Keep one canonical profile per workspace.
- Store visual rules in root `DESIGN.md`.
- Store reusable product context, caption guidance, provenance, and approved assets under `.social-image/`.
- Treat each post's source content and caption as `$social-image` inputs, not setup context.
- Collect and organize assets; use a separate workflow when the user wants a logo, mascot, font, illustration, or other brand asset generated.

Read [references/intake.md](references/intake.md) before interviewing. Read [references/workspace-contract.md](references/workspace-contract.md) before drafting or applying changes.

## 1. Inspect

Resolve the target workspace, defaulting to the current workspace when clear. Inspect existing `DESIGN.md`, `.social-image/`, supplied files, URLs, screenshots, brand guides, design files, and representative posts before asking questions.

If `.social-image/brands/` or `active-brand.json` exists, treat it as legacy candidate context. Preserve it until the user approves a migration and later approves any deletion.

## 2. Interview

Ask only for decisions and gaps the evidence cannot answer. Work in dependency-ordered rounds so later questions build on settled answers.

Use this evidence order:

1. Explicit current instructions
2. User-designated canonical guides or design files
3. Approved assets
4. Current product or marketing surfaces
5. Representative published work

Facts are inspection work; decisions belong to the user. Label every rule inferred from examples and ask the user to confirm it before treating it as normative. Surface conflicting sources and ask which is canonical.

## 3. Draft

Prepare a complete proposed change set without mutating the workspace:

- `DESIGN.md`: confirmed visual identity, social composition tendencies, tokens, asset usage, platform variants, and visual do/don't rules
- `.social-image/context.md`: reusable product identity, audience, terminology, facts, constraints, allowed claims, and common subjects
- `.social-image/caption.md`: approved language, voice, formatting, CTA behavior, platform variants, avoidances, and short confirmed examples
- Asset plan: approved local files categorized as logos, mascots, icons, illustrations, photos, fonts, templates, references, or other
- Source plan: ownership, license, restrictions, semantic role, canonical/reference-only status, and original location for every asset or external reference

Record unknowns as explicit gaps. Keep unconfirmed inference out of normative rules.

## 4. Preview and approve

Show the full proposed documents, asset operations, source records, explicit gaps, confirmed inferences, unresolved conflicts, and focused diff against existing context. Wait for approval.

One approval covers only the displayed change set. Preview again after any material revision. Never interpret approval of the interview direction as approval to write files.

## 5. Apply

After approval, create a temporary schema-1 plan following [references/workspace-contract.md](references/workspace-contract.md). Set `approved: true`, then run:

```sh
node <setup-social-image-dir>/scripts/apply.mjs \
  --target <workspace> \
  --plan <approved-plan.json> \
  --dry-run
```

Inspect the dry-run output. If it matches the approved preview, apply it:

```sh
node <setup-social-image-dir>/scripts/apply.mjs \
  --target <workspace> \
  --plan <approved-plan.json>
```

The helper preserves existing assets, reuses identical files, adds a checksum suffix for name collisions, backs up changed context files, and writes text files atomically. It never downloads remote assets or deletes legacy or orphaned files.

## 6. Validate

Run both gates:

```sh
npx @google/design.md lint <workspace>/DESIGN.md
node <setup-social-image-dir>/scripts/validate-workspace.mjs <workspace>
```

Fix every error. Report informational DESIGN.md findings, explicit gaps, orphaned assets, and legacy context separately.

## Hand off

Report created and changed files, copied or reused assets, backups, gaps, warnings, and any preserved legacy material. Offer this next request:

```text
Use $social-image.

Full source:
[content, URL, or path]

Social copy:
[finished caption]
```

Do not create a post during setup unless the user separately asks for one.
