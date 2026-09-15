"""Tests for the package version module."""

from agent_transcript_viewer._version import __version__


def test_version_is_a_nonempty_string():
    assert isinstance(__version__, str)
    assert __version__
