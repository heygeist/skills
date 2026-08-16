# Image Generation

Use generated imagery only when typography, CSS, diagrams, supplied assets, and authentic captures cannot communicate the idea adequately.

## Before generating

- Confirm that generation is allowed by the user or project policy.
- Define the communication role of the image.
- Avoid logos, proprietary characters, private people, and unverifiable product interfaces.
- Decide the required aspect ratio and safe crop area before prompting.
- Keep text out of generated pixels; add typography in HTML.

## Output contract

Place each generated image and a same-name JSON sidecar in `generated/`:

```text
generated/
├── concept-scene.png
└── concept-scene.json
```

Record:

```json
{
  "kind": "generated",
  "tool": "tool or model name",
  "created_at": "ISO-8601 timestamp",
  "prompt_summary": "short non-sensitive summary",
  "source_images": []
}
```

Use `data-provenance="generated"` on the corresponding HTML element. Never present generated UI, evidence, people, or objects as authentic captures.

## Review

Check for malformed details, unintended text, trademark confusion, misleading realism, crop fragility, and mismatch with the supplied brand context. Regenerate or choose a non-generative composition when these problems cannot be corrected cleanly.
