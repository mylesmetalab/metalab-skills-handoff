---
name: check-it
description: Diff a Figma component against its coded implementation, fresh each time — no stored baseline. Use when asked to "check for drift," "has this changed," "does the code match Figma," or before running fix-it.
---

# check-it

Reads both sides live and reports where they disagree. There is no contract or registry recording what was true at some past handoff — every run re-derives the comparison from scratch. That has one real cost, stated plainly in the output section below; know it before you rely on this for anything more than "what's different right now."

## Inputs

Needs a Figma component (link or file+node) and the coded component it should be compared against. If only one is given, ask for the other rather than guessing a file by name similarity — a wrong guess produces a confident, wrong report.

## What to compare

1. **Variants.** Every variant axis and value Figma defines against every prop/value the code exposes. Report both directions: something in Figma with no code equivalent, and something in code with no Figma equivalent (an extra prop, a variant that was removed from the design but never removed from code). **Enumerate exhaustively, don't sample.** Pull every state of every child component from its actual component-set definition (every `State=X` symbol, every axis value) and check each one individually — checking 2 of a component's 4 real states and reporting "looks fine" on the whole component is exactly how a real state gets missed. If a component gained a new variant since the last handoff (a state that didn't exist before), that's a finding on its own — flag it as structural, don't silently absorb it into "checked and clean."
2. **Token bindings, per variant, in every mode Figma defines.** For each property a Figma variant binds to a variable, find where the code reads the matching token, and compare the *current* resolved value on both sides. Flag:
   - Same token name, different value — the classic drift.
   - Figma binds a variable the code doesn't reference at all.
   - Code hardcodes a value where Figma has a bound variable — even if the values currently agree, this drifts silently the next time the variable changes.

   **A raw-override blind spot: a property that quietly went from bound to unbound is invisible to a bound-variable-only read.** `get_variable_defs`-style tools only return what's currently bound to a variable — the moment someone overrides a property with a raw literal (exactly the kind of edit that happens under deadline pressure), it stops appearing in that data at all, not "appears with a different value." A check that only diffs bound-variable output will silently pass right over this. Cross-check with a raw-value read (`get_design_context`, or the resolved fill/paint value directly) on every property that's *supposed* to be bound, specifically to catch the case where it no longer is.

   **A real tool limit, state it plainly rather than silently checking one mode:** the plain Figma MCP reads available to this plugin return one resolved value per node — whatever mode the file is currently rendering in — with no way to request a specific mode. If a component's Figma description says other modes exist but the file has no separate per-mode frame you can point a read at, you can check the mode you can reach and nothing more. Report exactly that: which mode you verified, and that any other mode is **unverified**, not "checked and clean." Don't let a component with only one checkable mode read as a clean drift report on modes you never actually looked at.
3. **Structure**, loosely — does the component's actual layer tree still roughly match what the code renders (elements added or removed), not pixel positions.
4. **Image and raster fills, separately from tokens.** A photo, gradient export, or any other flattened image fill was almost certainly downloaded once, during the original build, and committed as a static asset file — completely disconnected from Figma from that point on. No token diff will ever catch this fill changing, because there's no token; the pixels live in a binary file nobody re-checks. If the component has an image/raster fill, re-export the *current* fill (`get_screenshot` on that node, or the equivalent export call) and compare it — at minimum a visual check, ideally a direct diff — against the asset already committed in the repo. Skipping this step on a component that has one means the drift report is silently blind to the single most visible kind of change a design can make.
5. **Instance-level overrides on composed children, not just each child's own defaults.** When the parent is built from instances of other real components (a button inside a card, say), Figma lets each *instance* override specific properties of the component it's placed as (a boolean like "show icon," a specific variant) independent of that component's own generic default. Check the specific instance's props (visible in `get_design_context`'s per-instance output for the parent, e.g. `<Button showIcon={false} />`) against what the code actually passes at that specific usage site — not just whether the code's version of that child component looks right in isolation. A child component can be pixel-perfect on its own and still be wrong here, because the parent uses it with different props than its own default.

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

**Never state a property "matches" from memory, habit, or a similar-looking neighbor — only from an actual fresh read of that exact property, this run.** A confidently wrong "this matches" is worse than not mentioning it at all: it's a false assurance that makes everyone downstream stop double-checking. If a property wasn't actually re-read this run, it doesn't go in the report as checked — say what genuinely was verified, nothing more.

Then an **acknowledged deviations** list (from `// design-note:` comments — treat a clear explanatory comment near the property as covered even if it doesn't use that exact tag; the point is a human already explained the deviation in the code, not that they typed a magic string) and, always, this line: *"This is a point-in-time diff, not a tracked history — it doesn't know what changed since the component was built, only what disagrees right now, and it did not render Hover/Disabled states in a real browser or compare screenshots pixel-for-pixel."* Add which mode(s) you could actually verify, per the tool-limit note above, if the component has more than one. Say all of this plainly rather than letting a clean-looking report imply more coverage than it has.

Never fix anything here — that's `fix-it`, and it should run in a separate step even if the same conversation goes straight into it.
