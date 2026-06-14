# Prototype Instructions

Run the local server yourself and open the preview in the in-app browser. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

## Active Design Sources

- Primary screen: `design/reference-main.png`
- Wrong-answer state: `design/reference-feedback.png`
- Original visual language: `design/reference-pdf-cover.png`
- Generated background asset: `public/assets/orbital-background.png`

The app intentionally keeps the question prompt above the statement because some
KPRIM statements depend on their question context.

Use proper German umlauts (`ä`, `ö`, `ü`) and `ß` in all user-facing copy and
learning content. Keep ASCII spellings only where exact source matching or code
syntax requires them.

## Learning Content

- Keep the productive deck below 400 individual swipe statements.
- Prefer difficult, exam-style statements with plausible traps over broad,
  repetitive recall questions.
- Cover the SNP syllabus through a compact set of balanced topics rather than
  mirroring every lecture and practical as a separate deck.
- Every statement needs a concise explanation that names the decisive rule.
- Keep the answer distribution balanced so guessing habits are not rewarded.
- Treat `src/data/cards.legacy.json` as source material, not as the productive
  deck. Curated authoring lives in `content/exam-kprim.mjs`; generation and
  validation live in `scripts/build-curated-cards.mjs`.
- Render short technical tokens as unbroken inline chips. Render complete or
  longer C expressions and declarations as centered, single-line code blocks
  with horizontal overflow instead of wrapping inside the code.
