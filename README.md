# metalab-handoff

A Claude Code plugin for Figma-to-code handoff: readiness checks, component generation, drift diffing, fixes, specs, and token-system syncing. **Stateless by design** — no contract files, no registry, no addons required. Every skill reads Figma and the target repo fresh each time it runs and either reports or opens a PR.

This is the portable base tier of MetaLab's design-sync work. The paid tier adds Storybook addons for live visual/state comparison and a contract file that remembers handoff decisions across runs — this plugin works without either.

## Skills

| Skill | What you say | What it needs |
|---|---|---|
| `am-i-set-up` | "am I set up?" | Figma MCP; repo access is optional and only checked if named |
| `is-this-ready` | "is this ready to hand off?" | Figma MCP only |
| `build-it` | "build this" | Figma MCP + repo read/write + PR access |
| `check-it` | "check for drift" | Figma MCP + repo read |
| `fix-it` | "fix this" / "the brand color changed" | Figma MCP + repo read/write + PR access |
| `spec-it` | "write the handoff spec" | Figma MCP only |
| `sync-tokens` | "check the tokens" | Figma MCP + repo read (write for the PR, if asked) |

Run them independently, in any order — `is-this-ready` before `build-it`, and `check-it` before `fix-it`, are recommended sequences, not hard dependencies enforced by shared state.

## What's required

1. **Claude Code**, for whoever will run these — designers and engineers both.
2. **Figma's MCP server**, connected per-person via OAuth. This is the one connection every skill needs. Confirm ahead of time that the people using this have *view access to the actual file* and a Figma seat/plan that supports Dev Mode/MCP features — that's the thing that breaks setup most often, not this plugin.
3. **Repo + PR access** — only for `build-it`, `fix-it`, and `sync-tokens` when it opens a PR. Branch-and-PR rights are enough; nothing here needs push access to a default branch. GitHub via `gh` is what the skills assume by default; adapt the delivery step for GitLab/Bitbucket if needed.
4. **A working local toolchain** for the target repo — if it doesn't build locally, `build-it`/`fix-it` can't verify their own output.

Run `am-i-set-up` first in any new repo — it checks all of the above and tells you exactly what's missing.

## Installing

```bash
claude plugin marketplace add <this-repo-url>
claude plugin install metalab-handoff
```

## Design principles this plugin follows

- **Detect and report, or open a PR — never a silent edit.** Every write lands as a reviewable branch/PR.
- **An unsourced claim of absence is worse than no claim.** Every skill is written to cite what it actually read before asserting something isn't there.
- **One fix, one PR.** Bundling unrelated changes to save a round-trip is the thing that makes a diff hard to review.
- **Ask instead of guessing** whenever the design file genuinely doesn't specify something — behavior, motion, an edge case. A plausible-sounding invention in shipped code is worse than a question.
