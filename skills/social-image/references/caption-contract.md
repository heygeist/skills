# Caption Contract

## How this contract is used

**Default mode is checking, not writing.** The user supplies the social post copy. Save it
verbatim as `caption.md`, read it against the rules below, and **report** what you find —
do not silently edit someone else's words. Offer a rewrite only when asked.

What to report:

- an unsupported performance, quality, or time-saving claim
- better/worse framing the facts do not carry
- a specialized term used before it is explained
- Markdown that will render literally on Facebook
- a claim the image contradicts, or a hook the caption repeats verbatim
- a missing honest limitation, or a missing low-friction CTA

The rules below are also the spec for *writing* a caption, on the occasions the user asks
for one.

## Voice

- Write Thai-first, conversational copy using `เรา`.
- Sound warm, practical, and lightly playful rather than corporate or boastful.
- Write for Coding Agent users who may not write code.
- Explain specialized terms before relying on them.
- Prefer concrete situations over abstract feature claims.

## Facebook formatting

- Use short paragraphs that scan comfortably on mobile.
- Use a standalone `.` line between sections in the Geist Facebook format.
- Keep official Skill, command, product, and file names exact.
- Avoid Markdown-only formatting that will display literally on Facebook.

## Educational comparison structure

1. Open with the image hook.
2. Name the two reader problems.
3. Explain what both options share.
4. Explain when to use the first option.
5. Explain when to use the second option.
6. Give one plain-language example, such as a single Facebook post versus an ongoing brand content project.
7. Explain unfamiliar artifacts with an analogy. Example: `CONTEXT.md` is the project dictionary; ADR records what was chosen and why.
8. State that not every answer becomes documentation.
9. Include one situation where the workflow is unnecessary.
10. Summarize the chooser in two lines.
11. End with one comment CTA.

For a 2–3 minute Thai caption, aim for roughly 3,500–4,300 characters and validate by reading for flow rather than enforcing a mechanical count.

## Accuracy guardrails

- Do not frame comparison options as better and worse unless the facts support it.
- Do not claim that Grill with Docs merely reads supplied documentation.
- Do not imply that every answer creates an ADR.
- Do not imply that clear requirements or documentation replace testing and review.
- Do not use unsupported performance, quality, or time-saving claims.
