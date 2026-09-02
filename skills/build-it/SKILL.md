---
name: build-it
description: Generate a coded component from a Figma component, in the target repo's own stack and conventions. Use when a designer hands off a component, or when asked to "build this," "bring this into code," or "implement this Figma component."
---

# build-it

Every run reads the repo fresh — there is no config file recording its stack or conventions from a previous run. That's the deliberate trade of this plugin: no shared state to go stale, at the cost of re-learning the repo each time. It's seconds, not minutes.

## Before generating

1. **Run `is-this-ready` first if it hasn't been run this conversation.** Refuse to build on a NOT READY verdict — name what failed and stop. Building on a component that isn't ready just relocates the problem into code where it's harder to see.
2. **Learn the repo, this run.** Don't assume React, don't assume Tailwind. Look at what's actually there: framework, component file layout, styling approach (utility classes, CSS modules, a theme object, styled-components...), whether tests/stories exist and in what format, how existing components name props and handle variants. Find and read one or two existing components that resemble what you're building — match their idioms, don't introduce a new pattern the rest of the repo doesn't use.
3. **Reuse before generating — and don't trust the node you were handed to be the real thing.** If the Figma component is composed of nested instances of other components, check whether the repo already has each one built. A miss is a decision to name in the report ("this child isn't built yet — building it inline / it needs its own handoff"), not a silent green light to duplicate it.

   **The harder case, and the one that actually bit a real handoff: a piece that looks like it should be a component — named "Text Input," "Dropdown," styled like a form field or a button — but isn't an `instance` at all, just a `frame`.** Don't conclude "this is ad hoc, I'll build it from what I see" the moment you notice that. Search the file first — **and this bit matters as much as searching at all: use a whole-file component index (`list_file_components_for_code_connect` or equivalent), not just a page-walk from `get_metadata` with no `nodeId`.** A plain page listing has produced a confident, wrong "nothing found" on a file where the real component was sitting there the whole time, reachable directly by node id — these tools read a live, open Figma file, and a page listing isn't guaranteed to be exhaustive. If a whole-file index finds a real component or component set with a matching name or matching composed content — even if it has states (Hover, Disabled, Active) the frame you were handed doesn't show — that's the real source, and it's very likely the handed-off node is a detached copy of it. Build against the real component, with its real states, and say plainly in the report that the original node was a detached duplicate and which real component you built from instead. Only fall back to building the frame as-is once you've actually run the exhaustive search and found nothing — say which method you used, and if only a page-walk was available, say the "found nothing" is weaker for it.
4. **For anything stateful, ask — don't infer.** A dialog, menu, accordion, or tooltip's *behavior* (what opens/closes it, whether it's modal, where focus goes, whether clicking outside dismisses it) is not in the design file, and a component library's default behavior is that library's opinion, not the designer's. Ask specific questions before generating, record the answers, and never present a primitive's default as though it were the design's intent.

## Generating

- **Every style value references a token or variable from the repo's own system.** A hardcoded color or pixel value in generated code is a bug. If the design names a token the repo's theme doesn't have, you may *add* it — with a comment naming the Figma source — but never *change* an existing token's value (that's a design-system decision, not a component one; if the design implies an existing token's value moved, stop and flag it instead of quietly updating the theme).
- **The Figma "State" axis (Default/Hover/Disabled/...) is not a prop.** It maps to CSS pseudo-classes and the native `disabled` attribute, not to a `state` prop threaded through the component.
- **A design-only "tone" variant (e.g. a separate Danger component set) maps to a prop on one component**, not a second component, when the same structure repeats with different tokens.
- **Structural elements get a stable hook** — a `data-slot`/`data-testid`-style attribute on header/body/footer/icon-equivalent elements, matching whatever convention the repo already uses if one exists. It costs nothing and makes `check-it` and `fix-it` able to name a specific part of the component later instead of "somewhere in this file."
- Match the repo's real accessibility bar even if the design doesn't show it: semantic elements or the repo's own accessible primitives, keyboard operability, a visible focus state, correct disabled semantics, an accessible label path for icon-only variants. **If the repo has Base UI (`@base-ui/react`) available and the component needs real interactive mechanics a plain element can't provide** — a select, a dialog, a menu, a tooltip, anything with a state like "Open" that no CSS pseudo-class can express — build on its matching primitive rather than hand-rolling focus trapping, keyboard nav, or ARIA attributes. This still doesn't answer *what* opens it or *when* it closes — that's step 4, ask, don't infer — it only means the mechanics don't get reinvented badly once the behavior is known.
- **Never invent what isn't specified.** Motion, focus-ring styling, and anything else the design and the repo's own defaults are both silent on goes in the report as "needs a decision," not into the code as a guess.

## Delivering

This plugin is local-first: git and a PR host are conveniences it uses when they're there, never a requirement to get a component built. Detect which of three tiers applies rather than assuming the top one — `am-i-set-up` will already have told you if it's been run this conversation:

- **No git repo at all** (or the target *is* the `new-project` scaffold with no `git init` yet) — write the files directly into `components/<name>/` and tell the client exactly what was added/changed, file by file. Nothing to merge; the code is just there. Say plainly that nothing is versioned yet, in case they want to `git init` later.
- **A git repo, but no PR-capable CLI or no write access** — commit to a new local branch and give the client the exact commands to push it and open a PR by hand (or just to merge locally if they're working solo). Never make them improvise the git commands themselves.
- **Full access** — open the PR.

Whichever tier, since there's no contract file to carry the paper trail, put the equivalent in the PR description (or, at tier 1, in your summary to the client):

- The Figma source (file, node) and date read.
- Every variant → prop mapping and every token binding, so a reviewer can check the claims without reopening Figma.
- Anything the design didn't specify, listed plainly ("needs a decision: ...") rather than buried in a comment.
- Any new token added, named explicitly in the title or first line — a reviewer should never discover a new token by reading the diff.

Tell the user plainly what happened and their options at whichever tier applied. Never make them run a CLI command to finish the job themselves unless that command is literally the one thing tier 2 hands them to paste.
