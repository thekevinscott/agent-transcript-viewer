# Agent contract

This file is the operating contract for AI agents working in this repo.
Conventions, supervision rules, and per-language style live under
`docs/internals/` — start there before making changes.

## Where to read first

- `docs/internals/repo.md` — cross-cutting rules (changelog/migration fragment philosophy, public-API surface).
- `docs/AGENTS.md` — how the docs site is organized ([Diataxis](https://diataxis.fr)) and the per-page quadrant rule.
- `docs/internals/python/` — Python style, testing, shipping, review, setup.
- `docs/internals/typescript/` — TypeScript style, testing, shipping, review, setup.

## Layout

- **`packages/`** holds public-facing packages — what gets published.
- **`internals/`** holds internal-only packages — built and tested to the same
  standard, never published.

A package's directory states which it is. Don't rely on a `private: true` flag
or a `Private :: Do Not Upload` classifier to carry that alone.

## Worktrees

**All work happens in git worktrees under `.worktrees/`.** Never edit files in
the primary checkout; it stays on `main` and clean. `.worktrees/` is
gitignored.

- Create one worktree per branch/PR: `git worktree add .worktrees/<branch> -b <branch>`.
  The worktree directory name and the branch name are **identical** —
  `.worktrees/<branch>` always contains branch `<branch>`.
- Branch names use **dashes only**: lowercase letters, digits, and `-`.
  No slashes, no spaces (e.g., `add-theme-selector`, not `feature/add-theme-selector`).
- Do all editing, building, and testing inside `.worktrees/<branch>/`.
- When the PR merges, remove the worktree: `git worktree remove .worktrees/<branch>`.

## Merging

**Never merge.** Agents open PRs and stop there. Kevin merges through the
GitHub UI as a human.

- Never merge on your own initiative, however green the checks are.
- Never suggest merging, and never offer to merge as a next step.
- The only exception is an explicit, specific instruction from Kevin to merge a
  named PR. That instruction is always his to initiate, and it is rare.

## Comments

**Omit comments.** Zero is the target; as few as possible is the rule. A
comment earns its place only when the reason is not derivable from the code —
a constraint, a workaround, a decision that looks wrong until you know why.
Rationale, never restatement. Never narrate what a line does. Prefer a better
name over a comment explaining a bad one, and prefer deleting a comment over
shortening it.

## Workflow

- Use `just` for local tasks (`just lint`, `just test`, `just ci`).
- Unit tests are **colocated** with their source (`foo.py` ↔ `foo_test.py`,
  `foo.ts` ↔ `foo.test.ts`). This is the
  [testing-conventions](https://github.com/thekevinscott/testing-conventions)
  standard, enforced in CI by `.github/workflows/conventions.yml`.
- **Repo gates come from external tools, not from a local CI package.**
  putitoutthere, testing-conventions, and pr-monitor own them. A gate this repo
  seems to need for itself is a missing feature upstream — file it there rather
  than writing a bespoke checker here.
- Every PR that changes a public API adds a **changelog fragment**: one
  timestamped file under `docs/changelog.d/` (plus one under
  `docs/migrations.d/` for breaking changes), named `YYYY-MM-DD-<pkg>-<slug>.md`
  by UTC merge date. The folders are the permanent, append-only record;
  `packages/<pkg>/CHANGELOG.md` / `MIGRATIONS.md` are pointer stubs — never
  append entries to them. For version attribution ("which release shipped X"),
  map fragment dates against tags via `git log --tags`. Bypass with a
  `skip-changelog:` git trailer for genuinely internal refactors. Not gated in
  CI right now — testing-conventions owns this gate and has not exposed it to
  consumers yet (thekevinscott/testing-conventions#642).
- Pre-commit hooks (`just hooks` to install) gate formatting, gitleaks, and per-language linters.

## First-publish prerequisites

Before the first `Release` run on a fresh scaffold:

1. **Repo must be public.** Trusted Publishing on PyPI requires the
   provider to inspect the workflow file at the configured ref; private
   repos cannot satisfy this. The `preflight` job in
   `.github/workflows/release.yml` fails fast if the repo is private.
2. **PyPI Trusted Publisher registered.** Brand-new projects use a
   *pending publisher*: under
   `https://pypi.org/manage/account/publishing/`, register the repo,
   the `release.yml` workflow filename, and the project name
   (`agent-transcript-viewer`) before the first release. No long-lived
   tokens are needed at any point — PyPI is the only registry.

## Out of scope

- Don't add unsolicited refactors or hypothetical-future abstractions.
- Don't bypass hooks or CI gates without an explicit reason in the PR body.
