# Agent Transcript Viewer

Generate and share self-contained, interactive HTML views of agent transcripts.

```bash
pip install agent-transcript-viewer
```

The Python SDK is the product: point it at a transcript, get back a single
static HTML file you can save, share, or serve — no server required to view
it.

## Development

This repo was scaffolded from
[`template-lib`](https://github.com/thekevinscott/template-lib) and keeps its
conventions: colocated unit tests, changelog fragments, `putitoutthere` for
releases, `just` for contributor commands.

- `just lint typecheck test build` — run the full local gate suite.
- [ARCHITECTURE.md](ARCHITECTURE.md) — package layout and release flow.
- [ROADMAP.md](ROADMAP.md) — where the project is headed.
- `docs/internals/` — contributor/agent conventions (not published).
