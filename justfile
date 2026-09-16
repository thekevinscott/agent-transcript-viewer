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

# ---- Aggregates ----------------------------------------------------------

lint: py-lint node-lint
format: py-format
typecheck: py-typecheck node-typecheck
test: py-test node-test
build: py-build node-build

ci: lint typecheck test

hooks:
    pre-commit install --install-hooks

clean:
    rm -rf packages/python/dist packages/node/dist docs/.vitepress/dist
