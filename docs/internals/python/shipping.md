# Python — shipping

## Github

Github is the source of truth.

### Github Actions

`concurrency` to cancel previous runs on the same ref:

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

Cheap, always wanted.

---

## Public API design

**Docstrings**: short, *why*-oriented. Let the signature carry the structure:

```python
def parse(content: str, *, strict: bool = False) -> Document:
    """Parse a document, raising on the first ambiguity if strict.

    The non-strict mode is forgiving for back-compat; new callers should set
    strict=True to surface schema drift early.
    """
```

When the type hints carry the structure, the prose carries the rationale.

**API reference via `mkdocs-material` + `mkdocstrings`** for new projects; `sphinx` + `sphinx-autodoc` is the mature alternative. Both render docstrings to HTML.

**Exception hierarchy** — define a flat tree at `agent_transcript_viewer/errors.py`, re-export from `__init__.py`:

```python
# agent_transcript_viewer/errors.py
class AgentTranscriptViewerError(Exception):
    """Base exception for agent_transcript_viewer."""

class ValidationError(AgentTranscriptViewerError):
    """A user input failed schema validation."""

class NotFoundError(AgentTranscriptViewerError):
    """The requested resource does not exist."""
```

```python
# agent_transcript_viewer/__init__.py
from agent_transcript_viewer.errors import AgentTranscriptViewerError, ValidationError, NotFoundError
__all__ = ["AgentTranscriptViewerError", "ValidationError", "NotFoundError", "__version__"]
```

Give each failure mode its own exception variant. One variant per condition (lock-poison, init-failure, not-ready) keeps `except` clauses precise.

**Class-with-`__call__` vs function**: prefer a function for one-shot behaviour; a class for stateful workflows. Intermediate variables read better in Python than chained pipelines (`process(data).then(...).then(...)`).

**Avoid built-in names for fields and variables** (`type`, `id`, `list`, `dict`, `input`, `format`). Use `kind`/`type_` and `key`/`id_` so the built-in stays usable in scope.

---

## CLI

**Pure Python, `click` for argument parsing.** The CLI is a thin 1:1 mirror of
the SDK's public methods — every subcommand maps to one SDK call. stdout is
reserved for command output; progress and diagnostics go to stderr.

### `pyproject.toml`

```toml
[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[project]
name = "agent-transcript-viewer"
dynamic = ["version"]
requires-python = ">=3.10"

[project.scripts]
agent-transcript-viewer = "agent_transcript_viewer.cli:main"
```

### Testing

Drive the CLI in a subprocess for e2e coverage — assert against stdout and
exit codes:

```python
import subprocess

def it_renders_a_transcript(tmp_path):
    result = subprocess.run(
        ["agent-transcript-viewer", "write", str(tmp_path / "t.jsonl")],
        capture_output=True,
        text=True,
        check=True,
    )
    assert (tmp_path / "t.html").exists()
```

---


## Lint + format

**`ruff` for both.** One tool handles formatting, import sorting, and lint, faster than the legacy three-tool pipeline.

```toml
[tool.ruff]
line-length = 100        # 100 is reasonable; 88 (black default) is defensible
target-version = "py312"

[tool.ruff.lint]
select = [
  "E",    # pycodestyle errors
  "W",    # pycodestyle warnings
  "F",    # pyflakes
  "I",    # isort (import sorting)
  "B",    # flake8-bugbear (likely bugs)
  "C4",   # flake8-comprehensions
  "C90",  # mccabe complexity
  "UP",   # pyupgrade (modernise syntax)
  "ARG",  # unused-argument
  "SIM",  # flake8-simplify
  "PTH",  # use pathlib
  "PLR",  # pylint refactor (incl. complexity)
  "RUF",  # ruff-specific
]
```

Enable rule groups deliberately. The set above is a reasonable starting point. `D` (pydocstyle) is rarely worth the friction it adds.

**Per-file ignores for tests** (`PLR2004` magic numbers, `PLR0915` too-many-statements, `C901` too-complex are all OK in tests):

```toml
[tool.ruff.lint.per-file-ignores]
"*_test.py" = ["PLR2004", "PLR0915", "C901"]
"tests/**/*.py" = ["PLR2004", "PLR0915", "C901"]
```

**Type checker in CI** — `ty check agent_transcript_viewer/` or `mypy agent_transcript_viewer/` as a separate job. Type errors block merge.

**Security**: `bandit` is fine to run in CI. Tell it to skip `B101` (assert-used) for tests. Scope the per-file `# nosec B603,B607` annotations rather than blanket-skipping subprocess rules globally.

**`docformatter`**: optional. If you maintain Google-style docstrings, it formats them; if not, skip.

---

## Repo orchestration

**`justfile`** for contributor commands.

```make
default: ci

lint:
    uv run ruff check .

format:
    uv run ruff format .

format-check:
    uv run ruff format --check .

typecheck:
    uv run ty check agent_transcript_viewer/

test-unit:
    uv run pytest agent_transcript_viewer/ -x -q

test-integration:
    uv run pytest tests/integration/ -x -q

test-e2e:
    uv run pytest tests/e2e/ -x -q

test-cov:
    uv run pytest --cov=agent_transcript_viewer --cov-report=term-missing --cov-fail-under=85

ci:
    #!/usr/bin/env bash
    set -euo pipefail
    just lint &
    just format-check &
    just typecheck &
    wait
    just test-unit
    just test-cov

clean:
    rm -rf dist/ build/ .pytest_cache/ .ruff_cache/ .coverage htmlcov/

build:
    uv build
```

Run lint/format-check/typecheck in parallel before tests. Meaningful speedup.

**Pre-push (not pre-commit)** if you want client-side enforcement. Pre-commit hooks on every commit are net-negative — they slow down WIP commits and people learn to `--no-verify`. Pre-push runs once before the push, after you've reorganised commits. Install via `just hooks`:

```fish
#!/bin/sh
# scripts/hooks/pre-push
just ci
```

---

## CI/CD

`.github/workflows/` layout:

| File | Purpose |
|---|---|
| `test.yml` | `uv run pytest` matrix on Python 3.12, 3.13 |
| `lint.yml` | `uv run ruff check` + `ruff format --check` |
| `typecheck.yml` | `uv run ty check` (or mypy) |
| `security.yml` | `bandit -r agent_transcript_viewer` |
| `coverage.yml` | `pytest --cov --cov-fail-under=85` |
| `docs.yml` | Build + deploy mkdocs/sphinx site |
| `changelog-check.yml` | changelog fragment added under `docs/changelog.d/` (or `skip-changelog:` trailer) |
| `release.yml` | `uses: thekevinscott/putitoutthere/.github/workflows/release.yml@v0` |

**Use `astral-sh/setup-uv@v7`**, not `actions/setup-python`. uv installs and pins Python itself:

```yaml
- uses: actions/checkout@v6
- uses: astral-sh/setup-uv@v7
  with:
    python-version: "3.12"
    enable-cache: true
- run: uv sync --frozen
- run: uv run pytest
```

**Path filters** on every workflow so docs-only PRs don't run the test matrix:

```yaml
on:
  push:
    paths:
      - "agent_transcript_viewer/**"
      - "tests/**"
      - "pyproject.toml"
      - "uv.lock"
      - ".github/workflows/test.yml"
```

**Matrix sparingly.** Python 3.12 + 3.13 is enough; cross-OS only if you have native code or filesystem-specific behaviour. For PyO3 packages, matrix OS for wheel builds, Ubuntu-only for tests.

**Concurrency cancel previous runs**:

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

---

## Release flow

**Use `putitoutthere`.** Single reusable workflow, single config file, OIDC trusted publishing to PyPI. Versions derive from git tags via `hatch-vcs`. Provenance, retry-with-backoff, tag rollback, registry idempotency are all inside the workflow. Cross-cutting CHANGELOG / MIGRATIONS rules live in [../repo.md](../repo.md).

### Version source

`hatch-vcs` is not optional, and `dynamic = ["version"]` alone is not enough.
putitoutthere never edits `pyproject.toml` at release time, so the backend has
to derive the version itself. It supports three shapes and no others:

| Backend | Version source | How the release version reaches the build |
| --- | --- | --- |
| `hatch-vcs` (use this) | `[tool.hatch.version] source = "vcs"` | `SETUPTOOLS_SCM_PRETEND_VERSION` |
| `setuptools-scm` | `[tool.setuptools_scm]` | `SETUPTOOLS_SCM_PRETEND_VERSION` |
| `maturin` | sibling `Cargo.toml` | putitoutthere rewrites the manifest pre-build |

A fourth shape — hatchling's `[tool.hatch.version] path = "..."`, reading a
literal out of a `_version.py` — passes putitoutthere's PR-time checks, because
`dynamic` is declared and a `[tool.hatch.version]` block exists. Nothing rewrites
that literal and plain hatchling ignores `SETUPTOOLS_SCM_PRETEND_VERSION`, so the
wheel ships whatever is on disk. This repo shipped `0.0.0` to PyPI that way while
the release plan said `0.1.0`.

Anything reading the version at runtime reads it from installed distribution
metadata, never from a literal — a literal is the same bug one layer up.

### `putitoutthere.toml`

Repo-root config. Prescriptive schema — every package declares the same fields; defaults stay implicit.

```toml
[putitoutthere]
version = 1

[[package]]
name       = "agent_transcript_viewer"
kind       = "pypi"
path       = "."
globs      = ["agent_transcript_viewer/**/*.py", "pyproject.toml", "uv.lock"]
build      = "hatch"
tag_format = "v{version}"
```


### Reusable workflow

`.github/workflows/release.yml`:

```yaml
name: Release
on:
  push:
    branches: [main]

jobs:
  release:
    uses: thekevinscott/putitoutthere/.github/workflows/release.yml@v0
    permissions:
      contents: write
      id-token: write
```

The workflow drives `plan → build → publish → GitHub Release`. Consumer-side YAML stays at the seven-line stub above. `SETUPTOOLS_SCM_PRETEND_VERSION` handoff for `hatch-vcs` dynamic-version builds is set inside the workflow.

### Release trailer

Default cascade bump is `patch`. Override in the merge-commit body:

```
fix: handle empty token lists

release: minor
```

Grammar: `release: {patch|minor|major|skip} [pkg1, pkg2, ...]`. Last trailer wins. Optional package list scopes the bump.

### Trusted publishers

One-time registry setup per package — OIDC only.

- **PyPI**: under `https://pypi.org/manage/project/<name>/settings/publishing/`, add the GitHub publisher (owner, repo, workflow filename, and — if you pin one — the `release` environment). Brand-new projects use a pending publisher.

---
