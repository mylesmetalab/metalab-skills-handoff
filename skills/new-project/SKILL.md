---
name: new-project
description: Scaffold a local project with the architecture the rest of this plugin expects — a tokens file and a components folder convention — for someone starting from nothing, no git or GitHub required. Use when asked to "start a project," "set up a local project," or when am-i-set-up or build-it finds no existing repo to work against.
---

# new-project

For a client with no existing codebase — possibly no dev environment at all. This is the only skill in the plugin that doesn't touch Figma; it just creates the local starting point everything else needs to be able to read real conventions instead of guessing.

## Decide which template

Ask, or check directly: **is Node.js installed** (`node -v`)? Two templates ship with this skill, both under this skill's own `templates/` directory:

- **`templates/react/`** — the default whenever Node is installed, regardless of whether anyone asked for a build step. React + TypeScript + Vite, with `@base-ui/react` already a dependency for anything that needs real accessible behavior (a select, a dialog, a tooltip — see `components/README.md` inside the template), `class-variance-authority` for Figma-variant-to-prop mapping, and CSS Modules against the same `tokens.css` convention as everywhere else. This is the progressive default: typed, componentized, accessible-by-construction, not a step down from what a capable engineer would reach for on their own — because a version of this plugin once shipped a plain-HTML default even when Node was available, and it read as a weaker result purely because of that choice, not because of anything about the design work itself.
- **`templates/static/`** — the true fallback, only when Node genuinely isn't installed. Plain HTML/CSS/JS. No install, no build, no dependency to go stale. Opens directly in a browser (`open index.html`) or via any static file server. This is for someone who has never run a terminal command in their life beyond opening a file — a real, legitimate case, just not the common one.

**If the client has a specific framework preference that isn't React (Vue, Svelte, etc.), don't use either bundled template.** Scaffold with that framework's own standard tool instead (e.g. `npm create vite@latest -- --template vue-ts`), then apply the same conventions from "The architecture, and why it's shaped this way" below on top of it — a `tokens.css`/theme file at the root of the source tree, one folder per component, tokens-only styling, State-axis-as-pseudo-class.

## Scaffold it

1. Ask for a project name (used in `<title>`, and `package.json`'s `name` field for the React template — lowercase, hyphenated).
2. Copy the chosen template directory's contents into the target location the client wants (a new local folder — ask where if it's not obvious).
3. Replace `__PROJECT_NAME__` and, for the React template, `__PACKAGE_NAME__` placeholders with the real values.
4. For the React template only: run the install (`npm install`) so the project is immediately runnable, not just present.
5. Verify it actually works before calling this done: open `index.html` directly (static) or run the dev server and confirm it starts without error (React) — don't just report file creation as success.

## The architecture, and why it's shaped this way

- **One tokens file at the root of the source tree** (`tokens.css` static, `src/tokens.css` react), light values on `:root`, dark values re-declared under both `prefers-color-scheme` and an explicit `.dark` class. This is what `sync-tokens` diffs against and what `is-this-ready`/`build-it` write new values into — there must be exactly one obvious place for them to go.
- **One folder per component** (`components/<name>/` static, `src/components/<PascalCaseName>/` react), documented in `components/README.md`, with `Button/` as a real working example rather than an empty placeholder — a first `build-it` run needs something concrete to pattern-match against, not an empty folder to guess a convention for.
- **The Figma "State" axis is never a prop or a class.** The example component encodes Default/Hover/Disabled as `:hover`/`:disabled` directly, because that's the rule the other skills enforce and a scaffold that violated its own rule would just teach it wrong from the start.
- **Base UI, not hand-rolled behavior, for anything genuinely interactive.** A component whose Figma states include something like "Open" (a menu, a select, a dialog) needs real focus management and keyboard handling that a design file can't specify — reach for Base UI's matching primitive rather than inventing ARIA wiring from scratch. Still ask about the actual open/close/dismiss behavior per `build-it`'s rule; Base UI supplies the mechanics, not the product decision.
- **No git, no package manager, no build step in the static template.** Someone with no code environment shouldn't need to learn what any of those are just to see a component rendered.

## After scaffolding

Tell the client plainly how to look at it — `open index.html` for static, `npm run dev` for React — and that the next step is normally `is-this-ready` on their first real Figma component, then `build-it` to add it into the `components/` folder just created.

If a git repo and GitHub access get added later, nothing here needs to change — `git init` and a remote can be layered on top of this structure at any point without restructuring it. That's a decision for whoever owns the project, not something this skill should push on someone who came here specifically because they don't want it yet.
