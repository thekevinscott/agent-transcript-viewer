"""Tests for the package's public re-export surface."""

from . import __all__, __version__, get_viewer_html


def test_exports_the_version_as_a_string():
    assert isinstance(__version__, str)


def test_exports_the_viewer_html_reader():
    assert callable(get_viewer_html)


def test_all_names_the_whole_public_surface():
    assert __all__ == ["__version__", "get_viewer_html"]
