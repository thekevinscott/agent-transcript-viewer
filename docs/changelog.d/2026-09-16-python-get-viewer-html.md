Added: `agent_transcript_viewer.get_viewer_html()`, which returns the bundled
viewer.html contents read via `importlib.resources`. Part of issue #6's
offline packaging — the wheel carries its own viewer artifact, no Node or
network access required at runtime.
