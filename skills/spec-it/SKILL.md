---
name: spec-it
description: Generate a developer handoff spec from a Figma component or screen — measurements, tokens, states, edge cases, accessibility — as a shareable document. Use when a design is ready for engineering and needs a spec, or when asked to "write the handoff spec" or "document this component."
---

# spec-it

The lightest-weight skill in this plugin: it only reads Figma, never the repo, and produces a document rather than code. It's also often where problems surface first — writing down the actual contrast ratio or the actual token values tends to catch things a quick glance doesn't.

## Gather, from Figma

- Exact measurements: padding, gaps, corner radius, per variant/size.
- Every design token the component uses, with resolved values **in every mode** the file defines (don't stop at light mode).
- All variants and states the design actually shows — and say plainly which states it does *not* show (no Focus variant, no Active/pressed variant) rather than leaving the gap implicit.
- The text style(s) used: family, size, weight, line-height, letter-spacing.
- Anything the design specifies about motion — and if it specifies nothing, say that explicitly rather than omitting the section.

## Work out, don't just transcribe

- **Contrast.** For every text-on-fill and icon-on-fill pairing, calculate the actual contrast ratio against the resolved colors and state whether it clears WCAG AA for that text size — do the arithmetic, don't eyeball it. This is genuinely the highest-value thing this skill does; a spec that skips it hands the accessibility problem to whoever builds the component, later, when it's more expensive to fix.
- **Edge cases the design doesn't show**: what happens with a much longer label (translations commonly run 30%+ longer than English), an empty state, a loading state, a very long or very short list — for each, either point to what the design implies, or say plainly "not designed — flag to design" rather than inventing a plausible-sounding answer.
- **Responsive behavior** if the file shows breakpoints; if it doesn't, say there are none rather than guessing typical ones.

## Write the spec using tokens, not raw values

Reference `spacing-md`, not `16px` — the point of the document is that it stays correct after a token's value changes, which a hardcoded number silently doesn't.

## Structure

```
## Handoff Spec: [Component/Screen Name]

### Overview
What this does, its variants, who uses it.

### Layout & Measurements
Padding, gaps, radius — as tokens — per variant/size.

### Design Tokens
Table: token | value per mode | where it's used.

### States
Table: state | what changes | which token drives it.
Call out any state the design doesn't cover.

### Responsive Behavior
Per breakpoint if the design has them; otherwise say it has none.

### Edge Cases
Long content, empty, loading, error — what's designed vs. what needs a decision.

### Accessibility
Actual contrast ratios with pass/fail against WCAG AA, focus behavior, keyboard interaction, what a screen reader announces.

### Open Questions
Anything the design doesn't specify — never filled in with a guess.
```

## Delivering

This is a document, not code — no PR needed unless the client wants it committed to the repo as documentation, in which case treat that as a normal small PR. Otherwise just hand back the spec directly.
