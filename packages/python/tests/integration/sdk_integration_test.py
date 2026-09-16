"""Integration tier: exercises the SDK through its public entry point.

Per DESIGN's testing convention, integration targets the SDK exclusively —
the CLI is a thin wrapper and gets its own coverage in the e2e tier.
"""

import agent_transcript_viewer


def test_sdk_exposes_a_nonempty_version_string():
    assert isinstance(agent_transcript_viewer.__version__, str)
    assert agent_transcript_viewer.__version__
