"""Python's only contact with the shared transcript-parsing fixture corpus.

Parsing lives entirely in packages/node/src/load.ts (docs/internals/repo.md,
"Shared parsing"). Python's role is the byte-level limit it will enforce:
decoded text must be valid UTF-8 within 50 MiB. This test reads the same
corpus the TypeScript parity suite reads (tests/fixtures/transcripts/,
tests/fixtures/expected/) and checks only byte-level properties, never
record structure.
"""

from pathlib import Path

FIXTURES_ROOT = Path(__file__).resolve().parents[4] / "tests" / "fixtures"
MAX_DECODED_BYTES = 50 * 1024 * 1024


def _jsonl_files() -> list[Path]:
    return sorted((FIXTURES_ROOT / "transcripts").rglob("*.jsonl"))


def test_fixture_corpus_exists_and_is_shared_with_typescript():
    assert (FIXTURES_ROOT / "transcripts" / "sample_transcript.jsonl").is_file()
    assert (FIXTURES_ROOT / "expected" / "sample_transcript.json").is_file()


def test_every_fixture_file_decodes_as_utf8_within_the_byte_limit():
    files = _jsonl_files()
    assert files
    for path in files:
        data = path.read_bytes()
        assert len(data) <= MAX_DECODED_BYTES
        data.decode("utf-8")
