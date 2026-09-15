set shell := ["bash", "-cu"]

default:
    @just --list

# ---- Python --------------------------------------------------------------

py-lint:
    cd packages/python && uv run ruff check . && uv run ruff format --check .

py-format:
    cd packages/python && uv run ruff check --fix . && uv run ruff format .

py-typecheck:
    cd packages/python && uv run mypy src

py-test:
    cd packages/python && uv run pytest

py-build:
    cd packages/python && uv build

# ---- Node (internal frontend workspace — never published) ----------------

node-install:
    cd packages/node && pnpm install --no-frozen-lockfile

node-lint:
    cd packages/node && pnpm run lint

node-typecheck:
    cd packages/node && pnpm run typecheck

node-test:
    cd packages/node && pnpm run test

node-build:
    cd packages/node && pnpm run build

# ---- Docs ----------------------------------------------------------------

docs-install:
    cd docs && pnpm install --no-frozen-lockfile

docs-dev:
    cd docs && pnpm run dev

docs-build:
    cd docs && pnpm run build

# ---- CI gates (repo-internal `ci` package) --------------------------------

# Gate: fail if any workflow / composite-action YAML encodes a non-trivial
# inline script (docs/internals/repo.md). Run from the repo root.
gha-lint:
    uv run --project ci ci lint-workflow-scripts

gha-test:
    cd ci && uv run pytest

# Gate: fail if template scaffolding survives (see
# docs/internals/repo.md, "Repo shape"). Run from the repo root.
repo-shape:
    uv run --project ci python -m ci.repo_shape

# ---- Aggregates ----------------------------------------------------------

lint: py-lint node-lint gha-lint
format: py-format
typecheck: py-typecheck node-typecheck
test: py-test node-test gha-test
build: py-build node-build

ci: lint typecheck test

hooks:
    pre-commit install --install-hooks

clean:
    rm -rf packages/python/dist packages/node/dist docs/.vitepress/dist
