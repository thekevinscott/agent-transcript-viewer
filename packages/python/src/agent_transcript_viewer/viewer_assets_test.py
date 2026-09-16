"""Tests for reading the bundled viewer.html artifact."""

from unittest.mock import patch

import pytest

from agent_transcript_viewer.viewer_assets import get_viewer_html


@pytest.fixture
def files():
    with patch("agent_transcript_viewer.viewer_assets.resources.files") as mock:
        yield mock


def test_returns_the_bundled_asset(files):
    files.return_value.joinpath.return_value.read_text.return_value = (
        "<!doctype html><html></html>"
    )

    assert get_viewer_html() == "<!doctype html><html></html>"


def test_reads_utf8_from_the_assets_directory_of_its_own_package(files):
    get_viewer_html()

    files.assert_called_once_with("agent_transcript_viewer")
    files.return_value.joinpath.assert_called_once_with("_assets", "viewer.html")
    files.return_value.joinpath.return_value.read_text.assert_called_once_with(
        encoding="utf-8"
    )
