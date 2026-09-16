# Repo-wide conventions

Cross-cutting rules that apply across all language packages. Language-specific guidance lives in [`python/`](python/index.md) and [`typescript/`](typescript/index.md).

## Changelog + migration fragments

The changelog and migration record are **append-only fragment folders** at the repo root: `docs/changelog.d/` and `docs/migrations.d/`. The folders *are* the record — no rendered CHANGELOG is assembled at release time, nothing commits back to `main` per release, and fragments are never deleted, rewritten, or "flushed". One fragment per PR, added in that PR, keeps concurrent PRs structurally conflict-free (a shared changelog file makes every pair of in-flight PRs merge-conflict by construction). Both folders sit under `docs/` but are excluded from the docs site via VitePress `srcExclude`. The philosophy is global — every language package follows it.

Every PR that changes public API adds at least one fragment naming each touched package. Enforced in CI by [`changelog.yml`](../../.github/workflows/changelog.yml); a `skip-changelog:` trailer bypasses the check for genuinely internal refactors.

**Filenames** — `YYYY-MM-DD-<pkg>-<slug>.md`, where the date is the UTC *merge* date, not the author date (authored timestamps interleave wrongly across long-lived branches). Plain `ls` sorts chronologically; newest = highest sort order. For version attribution ("which release shipped X"), map fragment dates against tags via `git log --tags --simplify-by-decoration --format='%cI %d'`.

**Changelog fragments** (`docs/changelog.d/`) — a few sentences per fragment. Lead with the Keep a Changelog category (`Added` / `Changed` / `Deprecated` / `Removed` / `Fixed`); breaking changes carry a `**BREAKING**` marker and link to their `migrations.d/` fragment.

**Migration fragments** (`docs/migrations.d/`) — one per breaking change. Each has five sections, in order:

1. **Summary** — one paragraph: what changed and why.
2. **Required changes** — before/after for config, CLI flags, function/method arguments, action inputs. "None" if purely additive.
3. **Deprecations removed** — anything previously warned about that's now gone. "None" if nothing was removed.
4. **Behavior changes without code changes** — same API, different runtime behavior (tag format, exit codes, defaults).
5. **Verification** — commands the consumer runs to confirm the upgrade worked, with the expected output.

**Stubs at the conventional paths** — `packages/<pkg>/CHANGELOG.md`, `packages/<pkg>/MIGRATIONS.md`, and `docs/migrations.md` are short pointers into the folders, so anyone fetching the conventional filename gets one hop instead of a 404. Never append entries to the stubs.

**Ship the folders in artifacts where the toolchain allows** — today the single published artifact is the Python wheel, and hatchling cannot include files outside the package root, so wheel consumers take the stub → folder hop on GitHub instead.

Public-API surface for the purpose of these fragments: every exported value/type, every CLI flag, every config key, every observable artifact (tag format, GitHub Release body shape). Internal refactors, test-only changes, and docs-only edits stay out.

## Repo shape (post-template prune)

This repo was scaffolded from `template-lib` (Rust core + maturin Python
wrapper + npm-published Node shim) and pruned to its actual shape:

- **No Rust.** `packages/rust/`, the `rust.yml` workflow, all `rust-*`
  justfile recipes, and every maturin/cargo reference are deleted. The
  Python package builds with `hatchling`.
- **One published package: PyPI.** `putitoutthere.toml` declares exactly
  one `[[package]]` (kind `pypi`, name `agent-transcript-viewer`).
- **`packages/node` is internal tooling.** It builds the static viewer
  frontend whose output is bundled into the wheel; its `package.json` is
  `"private": true` and carries no `bin` / `optionalDependencies` /
  publish config. npm publishing machinery (`bootstrap-npm.yml`,
  per-platform sub-packages) is deleted.

## Shared parsing (issue #4)

Transcript parsing and normalization has exactly one implementation: the
modules under `packages/node/src` that `index.ts` re-exports
(`parse-transcript-text.ts`, `load-records.ts`, `list-jsonl-files.ts`,
`summarize-transcript.ts`, `to-int.ts`). Python never parses a transcript.

**Decision.** Of the epic's three options, we took **option 1: parse in the
browser; Python stays a byte pipe.** They port `design-snapshot`'s
`load.py` semantics (blank lines skipped, malformed non-blank lines survive
as `{type: "raw", line}`, directory input reads `*.jsonl` recursively in
sorted order) plus the metadata and usage-totals extraction that
`design-snapshot`'s `render.py._Header` performed — that extraction reads
structure out of records rather than rendering HTML, so it travels with the
parser, not the (not-yet-built) renderer. Option 2 (parse in Python) was
rejected because the hosted GitHub Pages viewer has no Python and would need
its own parser anyway, defeating the point. Option 3 (one TypeScript
implementation invoked from both runtimes) was rejected because running it
from Python needs Node at runtime, which the design brief forbids.

**Consequences.**
- Python cannot answer any question about a transcript's contents — record
  counts, record types, session metadata — without a parser it does not
  have. The 100,000-record limit from `DESIGN.md` is therefore enforced in
  the browser, where the records exist, not in Python.
- Python's only transcript-shaped responsibility is the browser's
  byte-level input limit: validate the file decodes as UTF-8 and that the
  decoded text is at most 50 MiB, then snapshot the bytes. It has no
  record-type table, no JSON-lines splitter, and no metadata extractor.
- Nothing gates this mechanically. A repo-local checker for it would be a
  bespoke gate of exactly the kind the next section forbids, and no external
  tool owns "this package must not reimplement that one". The rule is carried
  by review: a `json.loads(`, `.jsonl`, `rglob(`, `splitlines(`,
  `cache_creation_input_tokens`, or `TYPE_META` appearing under
  `packages/python/src` is a second parser regrowing.
- The shared fixture corpus lives at `tests/fixtures/` (`transcripts/` for
  input files, `expected/` for golden output captured from
  `design-snapshot`'s reference implementation). Both language suites read
  from this one location:
  `packages/node/tests/integration/fixture-corpus-parity.test.ts` parses it and
  compares to the golden output; `packages/python/.../shared_fixtures_test.py`
  checks the byte-level properties Python is actually responsible for.

## Repo gates come from external tools

This repo runs no gate code of its own. putitoutthere validates the release
config, testing-conventions enforces the testing standard, and pr-monitor
gates the merge on the aggregate check set. Workflow YAML is wiring —
`env:`, `if:`, `with:`, and one invocation — with no iteration, `case`
dispatch, or text-munging in a `run:` block.

A gate this repo appears to need for itself is a missing feature in one of
those three. File it upstream. A bespoke checker living here duplicates
someone else's support matrix, drifts from it silently, and is invisible to
every other repo with the same problem.
