from pathlib import Path
from unittest.mock import patch

import pytest

from .AgentTranscriptViewer import AgentTranscriptViewer


@pytest.fixture(autouse=True)
def mock_load_data():
    with patch("agent_transcript_viewer.AgentTranscriptViewer.load_data") as load_data:
        yield load_data


def describe_AgentTranscriptViewer():
    def test_it_instantiates():
        assert AgentTranscriptViewer() is not None

    def describe_transcript_arg():
        def test_it_accepts_a_transcript():
            transcript = "foo.jsonl"
            viewer = AgentTranscriptViewer(transcript)
            assert viewer.__transcript__ == transcript

        def test_it_accepts_a_transcript_path():
            transcript = Path("foo.jsonl")
            viewer = AgentTranscriptViewer(transcript)
            assert viewer.__transcript__ == transcript

        def test_it_accepts_no_transcript():
            viewer = AgentTranscriptViewer()
            assert viewer.__transcript__ == None

    def describe_loading_transcripts():
        def test_it_calls_load_data_if_transcript_is_provided(mock_load_data):
            mock_load_data.side_effect = ["foo", "bar"]
            assert mock_load_data.call_count == 0
            transcript = "foo.jsonl"
            viewer = AgentTranscriptViewer(transcript)
            assert viewer.__transcript__ == transcript
            assert mock_load_data.call_count == 1
            assert viewer.__data__ == "foo"

            viewer.transcript = "bar.jsonl"
            assert mock_load_data.call_count == 2
            assert viewer.__data__ == "bar"

        def test_it_does_not_call_load_data_if_transcript_is_not_provided(
            mock_load_data,
        ):
            assert mock_load_data.call_count == 0
            AgentTranscriptViewer()
            assert mock_load_data.call_count == 0
