Added: `packages/node` now exposes the transcript parsing implementation —
`loadRecords`, `parseTranscriptText`, and `summarizeTranscript` — ported from
`design-snapshot`'s `load.py` and `render.py._Header`. This is the single
parsing implementation for the project; Python does not parse transcripts.
See `docs/internals/repo.md` ("Shared parsing") for the decision and its
consequences.
