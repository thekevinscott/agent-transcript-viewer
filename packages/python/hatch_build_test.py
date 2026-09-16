"""Tests for the build hook that carries viewer.html into the distribution."""

from pathlib import Path

import pytest

from hatch_build import ViewerAssetBuildHook

DEST = ("src", "agent_transcript_viewer", "_assets", "viewer.html")


def _hook(root: Path) -> ViewerAssetBuildHook:
    return ViewerAssetBuildHook(str(root), {}, None, None, str(root), "wheel")


def _write(path: Path, text: str) -> Path:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text)
    return path


@pytest.fixture
def root(tmp_path):
    return tmp_path / "python"


def test_copies_the_node_build_output_into_the_package(root):
    _write(root.parent / "node" / "dist" / "viewer.html", "<!doctype html>")

    _hook(root).initialize("standard", {})

    assert root.joinpath(*DEST).read_text() == "<!doctype html>"


def test_leaves_an_editable_install_without_the_asset(root):
    _write(root.parent / "node" / "dist" / "viewer.html", "<!doctype html>")

    _hook(root).initialize("editable", {})

    assert not root.joinpath(*DEST).exists()


def test_keeps_the_asset_that_travelled_inside_an_sdist(root):
    _write(root.joinpath(*DEST), "from the sdist")

    _hook(root).initialize("standard", {})

    assert root.joinpath(*DEST).read_text() == "from the sdist"


def test_refuses_to_build_a_distribution_with_no_viewer_in_it(root):
    root.mkdir(parents=True)

    with pytest.raises(FileNotFoundError, match="just node-build"):
        _hook(root).initialize("standard", {})
