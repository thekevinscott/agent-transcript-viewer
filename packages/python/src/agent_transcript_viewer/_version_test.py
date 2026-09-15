"""Tests for the package version module."""

import agent_transcript_viewer
from agent_transcript_viewer._version import __version__


def test_version_is_a_nonempty_string():
    assert isinstance(__version__, str)
    assert __version__


def test_version_is_reexported_at_package_root():
    assert agent_transcript_viewer.__version__ == __version__
