---
name: am-i-set-up
description: Verify the environment before using any other skill in this plugin — Figma access, and how much of a local/git/PR setup exists, if any. Use when someone asks "am I set up?", on first use of this plugin, or when another skill in the plugin fails in a way that looks environmental rather than a real finding.
---

# am-i-set-up

The smoke test. Figma access is the one thing every skill needs; everything past that is a spectrum, not a pass/fail — this skill's job is to say *where on that spectrum* the client sits, not to gate on git/GitHub existing at all. Someone with nothing but a Figma link and a browser is a valid starting point (see `new-project`), not a failure state.

Work through the checks in order below. The Figma check always runs. Once "no local project" is the answer to check 2, stop there and point at `new-project` — checks 3 and 4 need a project to check against and have nothing to say without one.

## 1. Figma access

Ask for a Figma file or component URL if none was given. Call a lightweight Figma MCP read against it (`get_metadata` on the file, or the node if a node-id is in the URL).

- **Success** → name the file and, if given, the node. Good.
- **No node-id in the URL** → not a failure; just note that component-specific skills need a node-specific link.
- **Permission/not-found error** → the most common cause is the signed-in Figma account lacking access to that file, or the account's Figma plan/seat not supporting Dev Mode / MCP features. Say which of these it looks like from the error and what to do: request file access from the file owner, or check the seat type with a Figma admin. Do not guess a specific plan name if the error doesn't say — just point at "seat/plan" as the thing to check.

## 2. Local project

Is there a target directory with actual project files in it? If not — nothing to scaffold onto, no `package.json`, no `index.html`, nothing — that's not a failure, it's the signal to run `new-project` next. Say so plainly and stop this check here; there's nothing further to verify against a project that doesn't exist yet.

## 3. Delivery tier — git and PR access

Once a local project exists, work out which of three tiers it supports, so `build-it`/`fix-it`/`sync-tokens` know what to expect rather than assuming the best case:

- **Tier 1 — no git.** No `.git` directory. Not a problem; those skills will write files directly and describe the change in plain language. Say this is where things stand and move on.
- **Tier 2 — git, no PR path.** A git repo exists (`git remote -v` may even show a remote) but there's either no PR-capable CLI authenticated (`gh auth status` / `glab auth status` fails) or the authenticated account lacks write access (`gh repo view --json viewerPermission` below `WRITE`). Those skills will commit to a local branch and hand over exact commands to push/open a PR by hand.
- **Tier 3 — full access.** A PR-capable CLI is authenticated with write access. Those skills will open PRs directly.

Report which tier plainly — this is information, not a checklist to pass or fail.

## 4. The project builds

Only relevant once a local project exists. Read `package.json` (or the equivalent for the stack) for an install/build script rather than assuming `npm install && npm run build` — a static HTML project (including the `new-project` static template) legitimately has none of that, and that's a pass, not a gap. Where a build step does exist, run it and report pass/fail with the last few lines of output on failure. This isn't optional politeness: `build-it` and `fix-it` verify their own output the same way, so if this step fails now, it will fail identically later and look like their bug instead of the environment's.

## Output

A short checklist — Figma access, local project (or route to `new-project`), delivery tier, build status — then, only for a real problem (not "tier 1" or "no project yet," which are normal states), the specific next action to take. End with a one-line verdict naming which skill to run next.
