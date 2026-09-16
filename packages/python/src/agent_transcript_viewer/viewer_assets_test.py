"""Tests for reading the bundled viewer.html artifact."""

import pytest

from agent_transcript_viewer import viewer_assets


def test_get_viewer_html_returns_the_bundled_asset(monkeypatch, tmp_path):
    assets_dir = tmp_path / "_assets"
    assets_dir.mkdir()
    (assets_dir / "viewer.html").write_text(
        "<!doctype html><html></html>", encoding="utf-8"
    )
    monkeypatch.setattr(viewer_assets.resources, "files", lambda _package: tmp_path)

    assert viewer_assets.get_viewer_html() == "<!doctype html><html></html>"


def test_get_viewer_html_raises_when_the_asset_is_missing(monkeypatch, tmp_path):
    monkeypatch.setattr(viewer_assets.resources, "files", lambda _package: tmp_path)

    with pytest.raises(FileNotFoundError):
        viewer_assets.get_viewer_html()
