---
name: sync-tokens
description: Diff every design token in a Figma file's variable collections against the client's token file(s), across all modes — no single component needed. Use when asked to "check the tokens," "did the brand colors change," or on a regular cadence (weekly) as a system-wide health check.
---

# sync-tokens

`check-it` is scoped to one component; this is scoped to the whole token system. Run this when the question is "did anything system-wide move" rather than "does this one component still match" — a single brand-color change touches every component that uses it, and thirty individual component reports saying the same thing is worse than one report saying it once.

## Read

- Every variable collection in the Figma file, every mode each collection defines, not just the default one.
- The client's token file(s) — wherever their theme/design tokens actually live (a CSS `@theme` block, a JS/TS theme object, a Sass map, a JSON token file). Find it by looking, not by assuming a path.

## Compare

Match by whatever the file actually gives you to match on — a code-facing name Figma has recorded for the variable if the file sets one, otherwise by name similarity, and say plainly which method was used since it affects how much to trust the result. For every variable:

- **Value differs** (any mode) — the token exists on both sides but disagrees. This is the finding that matters most and should lead the report.
- **In Figma, not in the token file** — a variable with no corresponding token; note whether it looks unused by any component or just not yet wired up.
- **In the token file, not in Figma** — a token nothing in the design file defines anymore; could mean it was deleted in Figma, or it's a code-only utility token that never had a Figma equivalent — say which looks more likely and why, don't just flag it as an error.

## Reporting

List every mismatch individually, even though a fix might bundle several into one PR — each one is a fact worth seeing on its own, and collapsing them in the report is how a reviewer misses that three tokens moved, not one.

Group them by how likely they are to be the same underlying decision: several color tokens in the same family changing together (e.g. all the `primary-*` shades) probably came from one rebrand action, so say so, but still list each token and its old/new value explicitly.

## Fixing

Only if asked, or if the finding is unambiguous and the user wants to move straight to a fix. One PR for the token-file changes, with every changed token named in the description — never let a reviewer discover a value change by reading a diff without a legend. This still isn't a place to bundle in unrelated component fixes; if a token value change should ripple into fixing a component's hardcoded literal, that's `fix-it`, run separately.
