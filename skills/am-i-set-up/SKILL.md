---
name: am-i-set-up
description: Verify the environment before using any other skill in this plugin — Figma access, repo/git access, and that the project builds. Use when someone asks "am I set up?", on first use of this plugin in a new repo, or when another skill in the plugin fails in a way that looks environmental rather than a real finding.
---

# am-i-set-up

The smoke test. Every other skill in this plugin assumes Figma reads succeed and, for `build-it`/`fix-it`, that a PR can be opened. This skill checks those assumptions once so a failure later reads as a real finding, not a broken environment.

Report a checklist, in this order, stopping to explain the fix at the first failure rather than running everything and drowning it in noise — except the Figma check, which should always run and report even if repo checks are skipped (e.g. no repo target yet).

## 1. Figma access

Ask for a Figma file or component URL if none was given. Call a lightweight Figma MCP read against it (`get_metadata` on the file, or the node if a node-id is in the URL).

- **Success** → name the file and, if given, the node. Good.
- **No node-id in the URL** → not a failure; just note that component-specific skills need a node-specific link.
- **Permission/not-found error** → the most common cause is the signed-in Figma account lacking access to that file, or the account's Figma plan/seat not supporting Dev Mode / MCP features. Say which of these it looks like from the error and what to do: request file access from the file owner, or check the seat type with a Figma admin. Do not guess a specific plan name if the error doesn't say — just point at "seat/plan" as the thing to check.

## 2. Repo and PR access

Only run this if the user names a target repo (skip and say so otherwise — `is-this-ready` and `spec-it` don't need it).

- Confirm the directory is a git repo with a remote (`git remote -v`).
- Confirm a CLI is authenticated for that host: `gh auth status` for GitHub, `glab auth status` for GitLab, etc. Report which one and as which account.
- Confirm the account can open PRs against the target branch — for GitHub, `gh repo view --json viewerPermission` should show at least `WRITE`; a `READ`-only result means PRs from a fork are the only option, which is worth saying plainly rather than discovering it on the first `fix-it` run.
- If there's no PR-capable CLI at all: say so, and say that `build-it`/`fix-it` will still work but will hand back a branch with instructions to open the PR by hand, rather than opening one.

## 3. The project builds

Only relevant with a repo target. Read `package.json` (or the equivalent for the stack) for an install/build script rather than assuming `npm install && npm run build` — a Rails, Django, or plain-HTML repo won't have those. Run whatever install/build/typecheck step exists and report pass/fail with the last few lines of output on failure. This isn't optional politeness: `build-it` and `fix-it` verify their own output the same way, so if this step fails now, it will fail identically later and look like their bug instead of the environment's.

## Output

A short checklist — ✅/❌ per item, one line each — then, only for anything ❌, the specific next action to take (not "check your permissions," but "ask the file owner to share view access" or "run `gh auth login`"). End with a one-line verdict: ready to use the rest of the plugin, or not yet and why.
