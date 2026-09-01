---
name: is-this-ready
description: Lint a Figma component before it's handed off to code — library tokens only, sane variant naming, no detached instances — and establish the facts about the design file that "build-it" will otherwise have to guess. Use when asked "is this ready to hand off?", before running build-it, or whenever a designer wants a pre-flight check on a component.
---

# is-this-ready

Two jobs, report-only — this skill never edits the Figma file (one narrow, consent-gated exception below):

1. **Lint** the component against the checks below.
2. **Establish facts about the design** that `build-it` needs and cannot infer on its own. Hand these to `build-it` in the same conversation, or paste this skill's output into a fresh one — there is no file this writes them to.

Tools: Figma MCP (`get_metadata` to locate and enumerate the tree, `get_variable_defs` for bindings and text styles, `get_design_context`/`get_screenshot` for structure). Report pass/fail per check with the exact offending node named — never a vague "some nodes."

## The rule underneath all of this

**An unsourced claim of absence is worse than no claim at all.** "This file has no dark mode" is a finding, not an assumption — and if it's wrong, everything built on it (a whole invented dark theme, wrong two times out of three) will look correct and pass review, because nobody re-checks a settled-looking fact. So: every fact below carries the read that established it — the tool call, the node or collection, and when it was read. If a read fails, that is evidence about the read, not about the design; say so and try the read that would actually have found the thing, don't write down "not present."

## Facts to establish

**Modes.** Every variable collection, its modes (matched by *name*, not position — "Light"/"Dark" is a convention, not a guarantee, and some files have 3+ modes on one collection, e.g. Desktop/Mobile/Tablet), and how many variables actually vary across them. `get_variable_defs` only returns the *current* mode's values with no mode info at all — it cannot answer this on its own; if the Figma MCP tool available to you exposes multiple modes directly, use that, otherwise say plainly that mode enumeration needs a capability this session doesn't have rather than guessing "single mode."

**Bindings vs. literals.** For every property that actually paints (fill, stroke, spacing, radius, font), is it bound to a variable or a raw value? Record literals as findings, not silent passes — someone owns fixing each one, in Figma. Skip properties that don't apply to the node (a `strokeWeight` on a node with no visible stroke isn't a real literal).

**Text styles.** For each text layer, what the bound style carries beyond size — line-height, letter-spacing, weight. Anything past size that the target codebase's type scale doesn't already have becomes a token `build-it` will need to add; flag it here while the node id is in hand.

**Shared values, scoped to this component only.** Group this component's own bound variables by resolved value, per mode. Two variables sharing a value *today* must never become one code token — a background and a border might match now and diverge the moment either one is restyled. Flag each group explicitly; do not silently note it as inconsequential.

**What can't be compared later.** Anything that will read as "passing" in a future drift check while actually being unchecked: a fill that's an image or gradient rather than a solid color (the color dimension can't be compared), a hidden layer sitting in front of the one that matters, or a Hover/Focus variant whose states aren't state-bound the same way the base variant is. Name these now so nobody mistakes silence for a clean bill of health later.

**Token-name matching quality.** If the variables this component uses carry a code-facing name (Figma's variable "code syntax" field, when the file defines one) that matches something the target codebase already declares, matching is reliable. If it names something the codebase doesn't have, or the field is empty, matching downstream will be by name-similarity guesswork — not a failure, but say so, because it changes how much to trust `check-it`'s later reports.

**The one edit this skill may offer.** If a variable has no code-facing name set, and it's local to this file (not from a shared library another team also consumes), and a Figma write capability exists in this session, and the human says yes *for this handoff specifically* — offer to set it. Never assume. This changes no colors, no bindings, nothing visual; only re-verify it landed and cite the write as one of your reads.

**Is the node you were handed the real thing, or a detached copy of one that exists elsewhere in the file?** This is not a hypothetical — a genuine handoff came in as a loose page-level "Section" that turned out to be a broken duplicate of a real, published component sitting elsewhere in the same file, and every field inside it that should have been a real, stateful Input component was a plain unlinked frame instead. `get_metadata` tags every node's real type (`frame`, `instance`, `symbol`/component) — a node named like a component, or containing pieces named like real UI elements ("Text Input," "Dropdown," "Button"), that comes back tagged `frame` rather than `instance` is a direct, checkable signal, not a maybe. When you see that:
1. **Search the file for the real version before concluding anything's ad hoc — with a method that's actually exhaustive.** `get_metadata` with no `nodeId` only lists top-level pages, and walking down from there is **not reliable on its own**: this has produced a confident, wrong "no such component exists" on a file where the component was sitting right there, reachable by direct node id, because the page-walk simply didn't surface it (these tools read a live, open Figma file, and a plain page listing can be scoped narrower than the whole file's actual contents — don't trust it as exhaustive). Use a **whole-file component index** as the primary search — `list_file_components_for_code_connect` (or an equivalent "list every component in this file" tool, if the toolset offers one) enumerates real components directly, independent of the page tree. Treat the page-walk as a supplement, never as the method that gets to say "searched, found nothing."
2. **If neither method is available, say so explicitly** — "no whole-file component index available in this session; only a page-walk was possible, which may be incomplete" — rather than letting a narrower search stand in for an exhaustive one.
3. **If you find one, the node you were handed is very likely a detached copy.** Say so explicitly, name the real component's node id, and treat the *real* one as the actual source of truth for both this lint and any build that follows — never the copy, even if the copy is the node the client happened to link.
4. **A "found none" conclusion is only as strong as the search behind it.** If it came from the whole-file index, say so plainly — that's a real, citable, exhaustive fact. If it only came from a page-walk, say that too, and flag the conclusion as weaker rather than presenting it with the same confidence.

## Non-negotiable checks

1. Every color, spacing, radius, and typography value on a painting property is bound to a library variable.
2. No detached instances — frames that visually duplicate a library component without actually being an instance of it. `get_metadata`'s frame/instance/symbol tagging is real, usable signal for this in this toolset; it is not proof by itself, but combined with a file-wide search (above) it usually settles the question. If you still can't verify it either way, say **NOT VERIFIED**, never pass it silently.
3. It's an actual component or component set, not a frame styled to look like one. A Section, a page-level frame, or any other organizational container fails this outright — but before treating its *contents* as unbuildable ad hoc, apply the detached-copy search above to each piece that looks like it should be a real component.
4. If the file has a publish concept and you can check it: is the library published, and does it include this component? Zero published entries against a file that clearly has components usually means "never published," not "no variants exist" — say which one you found, and ask the designer to confirm rather than asserting staleness you can't detect (a publish can be older than the latest edit, and that's often not machine-checkable — ask, don't guess).
5. Every variant axis has an explicit value on every variant — no "default" left ambiguous.
6. Text layers use text styles/typography variables, not one-off per-layer overrides.

## Team conventions — customize these per client

The naming rules below are a starting point, not a universal standard — swap them for whatever the client's design system actually uses, on the first run in a new file:

- Variant axis names in TitleCase (`Type`, `Size`, `State`); state values modeled as variants (`Default | Hover | Disabled`) unless the client's file does it differently.
- Component names in PascalCase; slash-nesting (`Card/Header`) only for genuine subcomponents, not arbitrary grouping.
- Bind to semantic variables (`color/primary`), never raw palette values (`purple/500`) directly — flag palette-direct binding with the semantic alternative if one exists.
- Interactive components need at minimum Default, Hover, and Disabled states defined; missing any is a fail worth raising even if the rest is clean.

## Output

1. A pass/fail table — check, verdict, offending nodes, the fix.
2. A **Design facts** block covering modes/bindings/text-styles/shared-values/uncheckable/naming from above, each line citing its read. This is the block `build-it` needs verbatim.
3. One verdict: **READY FOR HANDOFF** or **NOT READY**, with the shortest path to ready.

Never soften a failure, and never silently pass a check you couldn't actually perform.
