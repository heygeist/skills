# Image Generation

An **escape hatch**, not a design tool. Almost every GEIST social image earns its picture
from a real artifact or from type alone, and that is the look worth protecting: a competitor
draws an illustration, GEIST shows the screen.

## When it is allowed

Exactly two situations:

1. **HTML and CSS genuinely cannot draw it.** A photographic scene, a realistic object or
   material, an illustrated metaphor no layout can stand in for.
2. **Three rounds of fixes have not converged.** When the composition keeps missing and
   another HTML pass is unlikely to land it, generation is a legitimate second route rather
   than a fourth failed attempt.

## When it is forbidden

- **Never generate the mascot or the wordmark.** Both are canonical assets under ADR-0002.
  A generated Crownheart drifts every single time; that is the exact failure the ADR exists
  to prevent.
- **Never generate the proof.** The proof panel shows a real thing or it is labelled as not
  real. A generated screenshot is a fabricated claim.
- **Never generate Thai (or any) text inside the image.** Text is set in HTML where it is
  correct, selectable, and editable in five seconds. Generated text is malformed at best.
- **Never place generated imagery under a `REAL` label.**

## How

One provider, one key, one bill: **OpenRouter**. No second provider, no per-feature key.

```
POST https://openrouter.ai/api/v1/images
Authorization: Bearer $OPENROUTER_API_KEY
{ "model": "...", "prompt": "...", "seed": 12345, "n": 1 }
→ base64 image bytes in b64_json
```

| Model | Use when |
|---|---|
| `google/gemini-3-pro-image` | **default** — best prompt adherence, cheapest of the three |
| `openai/gpt-image-2` | the default misreads the brief |
| `qwen/qwen-image-3-pro` | third opinion; bills per image rather than per token |

The key is `OPENROUTER_API_KEY` in the workspace `.env` (already git-ignored). The human
sets it. **An agent must never read, print, or paste a key**, and must never commit one.
If it is missing, say so and stop — do not reach for another provider.

## Every generated file is reproducible

Output goes to the post's `generated/` folder with a sidecar of the same name:

```text
projects/posts/<slug>/generated/
├── warehouse-scene.png
└── warehouse-scene.json     { model, prompt, seed, created, why }
```

`why` is one line on which of the two allowed situations applied. A generation with no
sidecar is not reproducible and should be regenerated or removed.

## Cost discipline

- Generate for the **winning** variant only. Candidate compositions use a placeholder block,
  so a three-variant pick round costs nothing.
- Generate **once**, write the file, and reference it from the HTML. Re-rendering is then
  pure Playwright — free and instant. Never regenerate on every render.
- Pin the `seed` so a picture you liked can be recovered rather than re-rolled.

## Labelling

Anything from `generated/` carries `ภาพประกอบ AI · AI ILLUSTRATION` in zone 5, or sits in a
composition with no provenance label at all. It may never appear under `REAL`. See the
three-value table in [visual-contract.md](visual-contract.md).
