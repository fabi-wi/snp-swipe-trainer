# Design QA

- source visual truth:
  - user feedback screenshot showing unformatted `man 3 fopen`
  - `design/reference-main.png`
  - `design/reference-feedback.png`
- implementation screenshots:
  - `design/implementation-desktop.png`
  - `design/implementation-feedback.png`
  - `design/implementation-mobile.png`
- desktop viewport: 1440 x 1000
- mobile viewport: 390 x 844
- states: technical statement card and wrong-answer feedback

## Full-View Comparison

The existing navy, mint, coral, and pale-card design remains unchanged. The
technical content now has its own visual hierarchy without competing with the
statement, metadata, decisions, or navigation.

The original screenshot showed commands and prose at the same font, weight, and
size. The implementation renders commands such as `gcc -E` in compact dark
monospace chips and keeps the surrounding German sentence in the established
Manrope display style.

## Focused Checks

1. Typography: commands, function names, preprocessor directives, compiler
   flags, expressions, and filenames use IBM Plex Mono. Prose remains Manrope.
2. Spacing: inline code has clear breathing room on both sides and wraps without
   horizontal overflow.
3. Color: dark command chips use the existing navy and mint tokens; lighter code
   tokens in explanations preserve contrast on the coral feedback surface.
4. Assets: no image or icon assets changed.
5. Copy: German prose now uses `ä`, `ö`, and `ü`; code and legitimate terms such
   as `value`, `true`, `Queues`, and `virtuell` remain unchanged.
6. Responsiveness: measured scroll width equals viewport width at 1440 px and
   390 px.
7. Interaction: topic selection, correct answers, wrong answers, card advance,
   and feedback rendering were exercised without console warnings or errors.

Focused comparison was required because the change concerns typography inside
the statement and explanation rather than the overall screen composition.

## Findings

No actionable P0, P1, or P2 findings remain.

## Patches Made

- Added semantic technical-text parsing for commands and C/POSIX syntax.
- Added code-chip styling for statement and feedback cards.
- Regenerated all 1,164 cards with proper German umlauts.
- Protected real `ue` words and technical identifiers from false conversion.
- Corrected the imported source typos `präpozessiert` and `Zählsamphoren`.
- Added eight text-formatting tests.

## Final Result

final result: passed
