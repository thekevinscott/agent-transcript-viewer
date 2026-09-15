"""Structural invariants for the repo after the template prune.

This repo was scaffolded from ``template-lib`` (Rust core + maturin Python
wrapper + npm-published Node shim). agent-transcript-viewer keeps none of
that shape: the Python package is the only published artifact, the Node
package is an internal frontend workspace, and Rust is gone entirely. These
checks fail while any of the old shape survives, so the prune cannot be
half-done.
"""

from __future__ import annotations

import argparse
import json
import tomllib
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[3]

# The template's placeholder product name. Written split so this module and
# its test don't trip the very check they implement.
TEMPLATE_NAME = "my" + "newproduct"

# Directories that are not live config: dependency trees, build output,
# VCS internals, and local agent planning notes.
_SKIP_DIRS = {
    ".git",
    ".venv",
    ".worktrees",
    "__pycache__",
    "dist",
    "internal",
    "node_modules",
    "target",
}


def _files(root: Path) -> list[Path]:
    """All files under ``root``, skipping non-live directories."""
    out: list[Path] = []
    for path in sorted(root.rglob("*")):
        if not path.is_file():
            continue
        if any(part in _SKIP_DIRS for part in path.parts):
            continue
        out.append(path)
    return out


def rust_remnants(root: Path = REPO_ROOT) -> list[str]:
    """Live files that only make sense while a Rust crate ships."""
    problems: list[str] = []
    if (root / "packages" / "rust").is_dir():
        problems.append("packages/rust/ still exists")
    for path in _files(root):
        rel = path.relative_to(root).as_posix()
        name = path.name
        if name in ("Cargo.toml", "Cargo.lock"):
            problems.append(f"{rel}: cargo manifest still present")
        elif rel.startswith(".github/workflows/") and "rust" in name:
            problems.append(f"{rel}: rust workflow still present")
        elif name == "justfile" and "rust" in path.read_text():
            problems.append(f"{rel}: rust recipe still present")
        elif name == "pyproject.toml" and "maturin" in path.read_text():
            problems.append(f"{rel}: maturin build backend still present")
    return problems


def putitoutthere_violations(root: Path = REPO_ROOT) -> list[str]:
    """putitoutthere.toml must declare exactly one package: the PyPI one."""
    config = tomllib.loads((root / "putitoutthere.toml").read_text())
    packages = config.get("package", [])
    problems: list[str] = []
    if len(packages) != 1:
        problems.append(f"expected exactly 1 package, found {len(packages)}")
    for pkg in packages:
        if pkg.get("kind") != "pypi":
            problems.append(f"package {pkg.get('name')!r} kind is {pkg.get('kind')!r}, not 'pypi'")
        if pkg.get("pypi") != "agent-transcript-viewer":
            problems.append(
                f"package {pkg.get('name')!r} pypi name is {pkg.get('pypi')!r}, "
                "not 'agent-transcript-viewer'"
            )
    return problems


def manifest_violations(root: Path = REPO_ROOT) -> list[str]:
    """Surviving manifests must rename the project and fix repository URLs."""
    problems: list[str] = []
    expected_repo = "https://github.com/thekevinscott/agent-transcript-viewer"

    pyproject = tomllib.loads((root / "packages/python/pyproject.toml").read_text())
    project = pyproject.get("project", {})
    if project.get("name") != "agent-transcript-viewer":
        problems.append(f"packages/python name is {project.get('name')!r}")
    repo = project.get("urls", {}).get("Repository", "")
    if repo != expected_repo:
        problems.append(f"packages/python Repository is {repo!r}")

    package_json = json.loads((root / "packages/node/package.json").read_text())
    if package_json.get("repository") != expected_repo:
        problems.append(f"packages/node repository is {package_json.get('repository')!r}")
    if not package_json.get("private"):
        problems.append("packages/node is not marked private (must never publish)")
    for key in ("bin", "optionalDependencies", "publishConfig"):
        if key in package_json:
            problems.append(f"packages/node still has publish-time key {key!r}")
    return problems


def template_name_remnants(root: Path = REPO_ROOT) -> list[str]:
    """Live files still using the template's placeholder product name."""
    return [
        path.relative_to(root).as_posix()
        for path in _files(root)
        if path.suffix in {".toml", ".json", ".yml", ".py", ".ts", ".mjs", ".md"}
        and TEMPLATE_NAME in path.read_text(errors="ignore")
    ]


def violations(root: Path = REPO_ROOT) -> list[str]:
    """Every structural problem with the repo's current shape."""
    return [
        *rust_remnants(root),
        *putitoutthere_violations(root),
        *manifest_violations(root),
        *template_name_remnants(root),
    ]


def main() -> int:
    """Entry point. Returns the process exit code."""
    problems = violations()
    for problem in problems:
        print(f"::error::{problem}")
    if problems:
        print(f"{len(problems)} repo-shape violation(s); see internal/issues/epic-foundation/rename-and-prune.md")
        return 1
    print("repo shape OK: no rust, single PyPI package, renamed manifests")
    return 0


def run(_args: argparse.Namespace) -> int:
    """argparse adapter so ``ci.cli`` can dispatch uniformly."""
    return main()


if __name__ == "__main__":
    raise SystemExit(main())
