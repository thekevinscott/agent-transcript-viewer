from pathlib import Path

import agent_transcript_viewer
from agent_transcript_viewer import AgentTranscriptViewer

fixtures = Path(__file__).parent.parent / "__fixtures__"


def describe_basic():
    def test_sdk_exposes_a_nonempty_version_string():
        assert isinstance(agent_transcript_viewer.__version__, str)
        assert agent_transcript_viewer.__version__

    def describe_sdk():
        def test_sdk_instantiates():
            assert AgentTranscriptViewer() is not None

        def test_sdk_loads_transcript():
            transcript_path = fixtures / "three-lines.jsonl"
            viewer = AgentTranscriptViewer(transcript_path)
            assert viewer.transcript == transcript_path
