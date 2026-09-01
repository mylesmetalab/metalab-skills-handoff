---
name: check-it
description: Diff a Figma component against its coded implementation, fresh each time — no stored baseline. Use when asked to "check for drift," "has this changed," "does the code match Figma," or before running fix-it.
---

# check-it

Reads both sides live and reports where they disagree. There is no contract or registry recording what was true at some past handoff — every run re-derives the comparison from scratch. That has one real cost, stated plainly in the output section below; know it before you rely on this for anything more than "what's different right now."

## Inputs

Needs a Figma component (link or file+node) and the coded component it should be compared against. If only one is given, ask for the other rather than guessing a file by name similarity — a wrong guess produces a confident, wrong report.

## What to compare

1. **Variants.** Every variant axis and value Figma defines against every prop/value the code exposes. Report both directions: something in Figma with no code equivalent, and something in code with no Figma equivalent (an extra prop, a variant that was removed from the design but never removed from code).
2. **Token bindings, per variant, in every mode Figma defines.** For each property a Figma variant binds to a variable, find where the code reads the matching token, and compare the *current* resolved value on both sides. Flag:
   - Same token name, different value — the classic drift.
   - Figma binds a variable the code doesn't reference at all.
   - Code hardcodes a value where Figma has a bound variable — even if the values currently agree, this drifts silently the next time the variable changes.

   **A real tool limit, state it plainly rather than silently checking one mode:** the plain Figma MCP reads available to this plugin return one resolved value per node — whatever mode the file is currently rendering in — with no way to request a specific mode. If a component's Figma description says other modes exist but the file has no separate per-mode frame you can point a read at, you can check the mode you can reach and nothing more. Report exactly that: which mode you verified, and that any other mode is **unverified**, not "checked and clean." Don't let a component with only one checkable mode read as a clean drift report on modes you never actually looked at.
3. **Structure**, loosely — does the component's actual layer tree still roughly match what the code renders (elements added or removed), not pixel positions.

## Respecting intentional deviations

A component can correctly differ from its design on purpose — a focus ring the design never specified, an accessibility affordance, a literal the design has no token for. Without a stored contract, the only place to record "this is deliberate" is the code itself: if a component has a comment like `// design-note: <what and why>` near the deviation, treat it as a standing dismissal and don't re-report that specific difference — but do still list it, one line, under a separate "acknowledged deviations" heading, so it stays visible rather than disappearing. This is the one piece of state this skill relies on, and it's plain code the client already owns, not a file this plugin manages.

## Assigning fault, where possible

State-free, this skill usually cannot know whether Figma or code moved — only that they disagree now. Try anyway, and say when you can't:
- If the repo has git history for the file, check whether the code value was changed deliberately and recently (a commit message naming the change) — that's evidence the code is the intentional side.
- Otherwise, say plainly: "disagree; can't establish which side moved" rather than defaulting to "Figma wins." Defaulting silently is how a deliberate code change gets miscategorized as a bug.

## Output

Three buckets, always, even when empty (say "none found," don't omit the heading):

1. **Values disagree** — property, Figma value, code value, both modes if relevant, and fault if you could establish it.
2. **In Figma, not in code** — a variant, state, or token binding the design has that the component doesn't implement.
3. **In code, not in Figma** — the reverse; also where an extra prop or variant the design no longer shows would go.

Then an **acknowledged deviations** list (from `// design-note:` comments — treat a clear explanatory comment near the property as covered even if it doesn't use that exact tag; the point is a human already explained the deviation in the code, not that they typed a magic string) and, always, this line: *"This is a point-in-time diff, not a tracked history — it doesn't know what changed since the component was built, only what disagrees right now, and it did not render Hover/Disabled states in a real browser or compare screenshots pixel-for-pixel."* Add which mode(s) you could actually verify, per the tool-limit note above, if the component has more than one. Say all of this plainly rather than letting a clean-looking report imply more coverage than it has.

Never fix anything here — that's `fix-it`, and it should run in a separate step even if the same conversation goes straight into it.
