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

py-test-integration:
    cd packages/python && uv run pytest tests/integration

py-build:
    cd packages/python && uv build

# ---- Frontend (internal viewer workspace — never published) --------------

frontend-install:
    cd packages/frontend && pnpm install --no-frozen-lockfile

frontend-lint:
    cd packages/frontend && pnpm run lint

frontend-typecheck:
    cd packages/frontend && pnpm run typecheck

frontend-test:
    cd packages/frontend && pnpm run test

frontend-build:
    cd packages/frontend && pnpm run build

# ---- Docs ----------------------------------------------------------------

docs-install:
    cd docs && pnpm install --no-frozen-lockfile

docs-dev:
    cd docs && pnpm run dev

docs-build:
    cd docs && pnpm run build

# ---- Aggregates ----------------------------------------------------------

lint: py-lint frontend-lint
format: py-format
typecheck: py-typecheck frontend-typecheck
test: py-test py-test-integration frontend-test
build: py-build frontend-build

ci: lint typecheck test

hooks:
    pre-commit install --install-hooks

clean:
    rm -rf packages/python/dist packages/frontend/dist docs/.vitepress/dist
