"""Repo-internal CI gate CLI (``ci``): one subcommand per gate.

Never published — this package exists so CI logic is real, tested source
instead of inline workflow YAML. Workflows and the justfile invoke it as
one-line wiring, e.g. ``uv run --project ci ci check-changelog``. The bright
line for what must live here is in ``docs/internals/repo.md``.
"""

from __future__ import annotations

import argparse
import sys

from ci import check_changelog, lint_workflow_scripts, repo_shape


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="ci",
        description="Repo-internal CI gates; one subcommand per gate.",
    )
    sub = parser.add_subparsers(dest="command", required=True)

    check = sub.add_parser(
        "check-changelog",
        help="Enforce that package changes add a changelog fragment "
        "(reads BASE_SHA / HEAD_SHA from the environment).",
    )
    check.set_defaults(entry=check_changelog.run)

    lint = sub.add_parser(
        "lint-workflow-scripts",
        help="Fail on non-trivial inline scripts in workflow / action YAML.",
    )
    lint.add_argument(
        "paths",
        nargs="*",
        help="YAML files to scan (default: .github/workflows/ and "
        ".github/actions/ relative to the current directory — run from the "
        "repo root).",
    )
    lint.set_defaults(entry=lint_workflow_scripts.run)

    shape = sub.add_parser(
        "check-repo-shape",
        help="Fail if template scaffolding survives (rust config, publishable "
        "npm manifest, template placeholder names).",
    )
    shape.set_defaults(entry=repo_shape.run)

    return parser


def main(argv: list[str] | None = None) -> int:
    args = _build_parser().parse_args(argv)
    return args.entry(args)


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
