# Roadmap

<!--
Forward-looking direction. Keep entries short — link out to issues or
design notes for detail. Use the three buckets below; move items down
as they ship.
-->

## Now

- Repo foundation: prune the template down to a pure-Python package +
  internal frontend workspace.
- Python SDK: `AgentTranscriptViewer` — load a transcript, render the
  self-contained HTML view.

## Next

- Static HTML viewer frontend (the internal TypeScript workspace).
- Offline packaging: bundle the built viewer into the wheel.
- `write` / `serve` SDK methods; URL-fragment encoding for shareable links.

## Later

- Thin CLI mirroring the SDK 1:1 (`click`, stdout reserved for output).
- Themes (paper / cool / dark) and viewer loading methods.

## Won't

- Publishing anything to npm or crates.io — PyPI only.
- A runtime server requirement for viewing: the output is a static file.
