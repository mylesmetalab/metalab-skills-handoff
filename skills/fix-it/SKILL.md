---
name: fix-it
description: Resolve a design/code difference found by check-it, or a plain request like "the brand color changed" — figures out whether the fix belongs at the token layer, the component layer, or back with the designer, and applies only that. Use for "fix this drift," "the design changed," or a pasted check-it report.
---

# fix-it

The front door — whoever's asking shouldn't need to know which layer a fix belongs in. Accept a `check-it` report from earlier in the conversation, a plain sentence ("the brand color changed in Figma"), or a specific property + component.

## Step 0 — triage the layer, before touching anything

Re-read the current state (Figma + code) rather than trusting a report that might be stale — this plugin has no stored state, so "current" always means "read just now." State your conclusion in one line before acting.

| What you're looking at | Path |
|---|---|
| Text content differs | **Not a code edit.** Figma placeholder copy vs. real product copy is a content decision, not a drift bug — route it to whoever owns the copy. |
| The token Figma expects isn't declared in the codebase at all | **Not a component edit either, on its own.** Adding a token is a design-system decision — name it in the PR title, cite the Figma source, get it added deliberately rather than reaching for the nearest existing token that looks close. |
| The Figma value is a raw literal, not bound to a variable | **Don't touch code.** The fix is re-binding it to a variable in Figma. Say so and stop — don't guess at intent on the code side to compensate for an unbound design value. |
| A token's *value* changed in Figma, and the code correctly references that token | **Token layer.** One change, in the theme file, not the component. Exception: if the token turns out to be shared by two properties the design treats as genuinely separate (they happened to match at some point and got collapsed onto one code token), no theme-only edit can satisfy both — split them 1:1 and rewire the affected components, and say plainly that's what happened and why. |
| Variants added/removed/renamed, or the component's structure moved | **Component restyle**, not a one-line fix — treat it like a fresh `build-it` pass on the changed parts, informed by what actually changed rather than regenerating the whole thing. |
| The component just references the wrong token, or a hardcoded value where a token exists | **Component fix.** Continue below. |
| Several related properties drifted together (four paddings, four radii, one pattern) | One change, not several — see step 3 below. |

If it's genuinely ambiguous between two of these, say so and ask one specific question. Guessing between layers is worse than asking: a token-layer change applied inside one component leaves the token wrong everywhere else it's used, and a component-only fix applied to what was actually a token change means the next component built from that token repeats the same wrong value.

## Procedure — component-fix path

1. **Verify before changing.** Open the file, confirm the current code value actually matches what triggered this — if someone already fixed it, stop and say so rather than re-applying a stale diff.
2. **Determine which side is right.** Default assumption: the design is the source of truth and the code is stale. But check git history on the file first — if the code value was changed deliberately and recently, with a commit message that explains why, treat that as a possible intentional divergence and ask before overwriting it.
3. **Check for related properties before editing just one.** If four paddings or four radii moved together, that's one design decision, not four independent ones — fix them together, or say explicitly if you're only fixing a subset and why.
4. **Make the change completely.** The named property, in the named file, referencing the correct token — never a raw value standing in for it. If the fix has different values per mode (light/dark, etc.), fix every mode in the same edit; fixing one and leaving the other wrong is worse than not fixing it, because it now looks resolved.
5. **Verify after.** Re-run whatever build/typecheck/test step the repo has, then re-read the current Figma value before committing — a design value that was itself reverted while you worked would make your "fix" reintroduce the very drift it was meant to remove. If Figma no longer says what it said a minute ago, stop and report the new state; don't commit against stale information. **If the component has more than one mode, say plainly which ones this fix actually re-verified.** The plain Figma reads available here return one mode at a time with no way to request a specific one — if you fixed the mode you could check and simply carried the other mode's existing value forward unverified, that's fine, but say so in the commit/PR rather than letting "verified after" imply every mode was confirmed.
6. **Deliver at whatever tier the repo actually supports** — same three tiers `build-it` uses, and check the same way rather than assuming: no git at all → edit the file directly and tell the client exactly what changed; git but no PR-capable CLI or no write access → **create a new branch** and commit there, then hand over the exact push/PR commands; full access → **create a new branch**, commit, and open the PR. At tiers 2 and 3, that new branch is never the branch that happened to be checked out when this skill started — check out from the repo's default branch (or ask which base branch to use if that's ambiguous) and name the new branch for the fix, e.g. `fix/button-color-primary`. A currently-checked-out branch might be someone's unrelated in-progress work; committing onto it silently mixes this fix into whatever else is there, which is exactly the mistake to avoid. Never a direct commit to a default branch either. Quote whatever triggered the fix (the `check-it` report line, or the plain request) in the PR body — or, at tier 1, in your summary — for traceability. Tell the user what happened, the one-line change, and their options. Never make them improvise a CLI command.

## Guardrails

- **Always a fresh branch, never the branch you found checked out.** Even when it looks related to this fix (a name that mentions the same component), it may carry someone else's uncommitted intent — branch from the default branch instead and let the two get merged deliberately, not silently combined.
- **One component per PR** (or per direct-edit summary, at tier 1). Multiple fixes to the *same* component can share one; fixes to different components never do.
- **Never change a token's value without saying so loudly** — title or first line of the PR body (or the summary, at tier 1), not buried in the diff. A token change affects every consumer of it, which makes it a design-system decision even when the fix itself is one line.
- **When the fix is actually on the Figma side** (code is right, the design drifted, and you have real evidence — git history, or the user said so directly): don't touch code. Open an issue instead, named for the component and property, with the evidence, and tell the user to route it to whoever owns the design file.
