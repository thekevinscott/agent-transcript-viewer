"""E2e tier: the installed package, exercised the way a user reaches it.

Placeholder. The tier's real subject is the CLI, which does not exist yet —
there is no `[project.scripts]` entry to invoke. Until then this asserts only
that the package imports and reports a version.
"""

import agent_transcript_viewer


def test_package_imports_and_reports_a_version():
    assert isinstance(agent_transcript_viewer.__version__, str)
    assert agent_transcript_viewer.__version__
