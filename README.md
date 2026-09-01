# metalab-handoff

A Claude Code plugin for Figma-to-code handoff: local project scaffolding, readiness checks, component generation, drift diffing, fixes, specs, and token-system syncing. **Stateless by design** — no contract files, no registry, no addons required. Every skill reads Figma and the target project fresh each time it runs and either reports, edits files directly, or opens a PR — whichever the environment actually supports.

This is the portable base tier of MetaLab's design-sync work. The paid tier adds Storybook addons for live visual/state comparison and a contract file that remembers handoff decisions across runs — this plugin works without either.

## Local-first, GitHub-optional

Nothing here requires git or GitHub to get started. A client with no dev environment at all runs `new-project` and gets a real local project — plain HTML/CSS/JS by default, no install, no build step — with the exact architecture the rest of the plugin expects. Everything downstream degrades to whatever's actually there, in three tiers:

1. **No git** — `build-it`/`fix-it`/`sync-tokens` write files directly and describe the change in plain language.
2. **Git, no PR access** — they commit to a local branch and hand over the exact commands to push and open a PR by hand.
3. **Full GitHub (or GitLab/Bitbucket) access** — they open the PR themselves.

`am-i-set-up` detects which tier applies and says so; nothing needs configuring in advance, and a client can add git and GitHub later without restructuring anything this plugin built.

## Skills

| Skill | What you say | What it needs |
|---|---|---|
| `am-i-set-up` | "am I set up?" | Figma MCP; everything else is detected, not required |
| `new-project` | "start a project" | Nothing — no Figma, no git, no Node (unless the Node template is chosen) |
| `is-this-ready` | "is this ready to hand off?" | Figma MCP only |
| `build-it` | "build this" | Figma MCP + a local project (git/PR access optional — see tiers above) |
| `check-it` | "check for drift" | Figma MCP + local read access to the component |
| `fix-it` | "fix this" / "the brand color changed" | Figma MCP + a local project (git/PR access optional) |
| `spec-it` | "write the handoff spec" | Figma MCP only |
| `sync-tokens` | "check the tokens" | Figma MCP + local read access to the token file (git/PR access optional for the fix) |

Run them independently, in any order — `new-project` before anything that needs a repo, `is-this-ready` before `build-it`, and `check-it` before `fix-it`, are recommended sequences, not hard dependencies enforced by shared state.

## What's required

1. **Claude Code**, for whoever will run these — designers and engineers both.
2. **Figma's MCP server**, connected per-person via OAuth. This is the one connection every skill needs. Confirm ahead of time that the people using this have *view access to the actual file* and a Figma seat/plan that supports Dev Mode/MCP features — that's the thing that breaks setup most often, not this plugin.
3. Everything else — a local project, git, a PR-capable CLI — is optional and detected at run time, per the tiers above. `am-i-set-up` reports what's there rather than requiring any of it up front.

Run `am-i-set-up` first, always — it checks Figma access and tells you which delivery tier applies, or routes straight to `new-project` if there's nothing local yet.

## Known limitation: multi-mode Figma files (e.g. light/dark)

The Figma reads this plugin uses return one resolved value per node — whichever mode the file is currently rendering in — with no way to request a specific mode. For a single-mode file this is a non-issue. For a file with light/dark (or any other multi-mode collection), `is-this-ready`, `check-it`, and `fix-it` can only verify the one mode they can reach, and they say so plainly rather than reporting an unchecked mode as clean. In practice this means **dark-mode drift can go undetected on the base tier** unless something else independently confirms it (the paid Storybook addon does per-mode comparison directly). Tell clients this up front if their design system has more than one mode — it's a real gap, not a hedge.

## Installing

```bash
claude plugin marketplace add <this-repo-url>
claude plugin install metalab-handoff
```

## Design principles this plugin follows

- **Local-first.** A client without git, GitHub, or Node still gets a working project and working components — those are conveniences this plugin uses when present, not preconditions for it to work at all.
- **Detect and report, or edit at whatever tier the environment supports — never a silent edit dressed up as more than it is.** A direct file write says plainly that it's a direct file write; a PR only gets called a PR when it actually is one.
- **An unsourced claim of absence is worse than no claim.** Every skill is written to cite what it actually read before asserting something isn't there.
- **One fix, one PR (or one direct-edit summary).** Bundling unrelated changes to save a round-trip is the thing that makes a change hard to review.
- **Ask instead of guessing** whenever the design file genuinely doesn't specify something — behavior, motion, an edge case. A plausible-sounding invention in shipped code is worse than a question.
