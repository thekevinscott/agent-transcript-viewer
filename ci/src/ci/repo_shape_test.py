"""Tests for the repo-shape structural gate."""

import json
from pathlib import Path

from ci.repo_shape import (
    manifest_violations,
    putitoutthere_violations,
    rust_remnants,
    template_name_remnants,
    violations,
)


def _write(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text)


def _clean_root(tmp_path: Path) -> Path:
    """A minimal repo root that already satisfies every check."""
    _write(
        tmp_path / "putitoutthere.toml",
        '[[package]]\nname = "agent-transcript-viewer-pypi"\nkind = "pypi"\n'
        'pypi = "agent-transcript-viewer"\npath = "packages/python"\n',
    )
    _write(
        tmp_path / "packages/python/pyproject.toml",
        '[project]\nname = "agent-transcript-viewer"\n'
        '[project.urls]\nRepository = "https://github.com/thekevinscott/agent-transcript-viewer"\n',
    )
    _write(
        tmp_path / "packages/node/package.json",
        json.dumps(
            {
                "name": "agent-transcript-viewer-frontend",
                "private": True,
                "repository": "https://github.com/thekevinscott/agent-transcript-viewer",
            }
        ),
    )
    return tmp_path


def test_clean_root_has_no_violations(tmp_path):
    assert violations(_clean_root(tmp_path)) == []


def test_rust_crate_is_flagged(tmp_path):
    root = _clean_root(tmp_path)
    _write(root / "packages/rust/Cargo.toml", '[package]\nname = "x"\n')
    assert any("rust" in p for p in rust_remnants(root))


def test_rust_workflow_is_flagged(tmp_path):
    root = _clean_root(tmp_path)
    _write(root / ".github/workflows/rust.yml", "name: Rust\n")
    assert any("rust.yml" in p for p in rust_remnants(root))


def test_maturin_backend_is_flagged(tmp_path):
    root = _clean_root(tmp_path)
    _write(root / "packages/docs-example/pyproject.toml", '[build-system]\nrequires = ["maturin"]\n')
    assert any("maturin" in p for p in rust_remnants(root))


def test_multiple_putitoutthere_packages_are_flagged(tmp_path):
    root = _clean_root(tmp_path)
    _write(
        root / "putitoutthere.toml",
        '[[package]]\nname = "a"\nkind = "pypi"\npypi = "agent-transcript-viewer"\n'
        '[[package]]\nname = "b"\nkind = "npm"\nnpm = "x"\n',
    )
    assert any("exactly 1 package" in p for p in putitoutthere_violations(root))


def test_non_pypi_package_is_flagged(tmp_path):
    root = _clean_root(tmp_path)
    _write(
        root / "putitoutthere.toml",
        '[[package]]\nname = "a"\nkind = "npm"\nnpm = "agent-transcript-viewer"\n',
    )
    assert any("not 'pypi'" in p for p in putitoutthere_violations(root))


def test_wrong_repository_url_is_flagged(tmp_path):
    root = _clean_root(tmp_path)
    _write(
        root / "packages/node/package.json",
        json.dumps({"private": True, "repository": "https://github.com/thekevinbot/template-lib"}),
    )
    assert any("repository" in p for p in manifest_violations(root))


def test_publishable_node_package_is_flagged(tmp_path):
    root = _clean_root(tmp_path)
    _write(
        root / "packages/node/package.json",
        json.dumps(
            {
                "private": False,
                "repository": "https://github.com/thekevinscott/agent-transcript-viewer",
                "bin": {"x": "dist/bin.js"},
            }
        ),
    )
    problems = manifest_violations(root)
    assert any("private" in p for p in problems)
    assert any("'bin'" in p for p in problems)


def test_template_name_is_flagged(tmp_path):
    root = _clean_root(tmp_path)
    _write(root / "README.md", "# mynewproduct\n")
    assert template_name_remnants(root) == ["README.md"]


def test_skipped_directories_are_not_scanned(tmp_path):
    root = _clean_root(tmp_path)
    _write(root / "node_modules/dep/package.json", '"mynewproduct"')
    _write(root / "internal/notes.md", "mynewproduct")
    assert template_name_remnants(root) == []


def test_this_repo_is_clean():
    """The real repo satisfies every structural invariant."""
    assert violations() == []
