---
diataxis: tutorial
---

# Getting Started

Agent Transcript Viewer turns an agent transcript into a single interactive
HTML file. Install the Python package, point it at a transcript, and open the
result in any browser.

## Install

```sh
pip install agent-transcript-viewer
```

## Your first view

<!-- Smallest end-to-end example that runs successfully. Filled in when the
SDK lands (see the sdk epic). -->

```python
from agent_transcript_viewer import AgentTranscriptViewer

viewer = AgentTranscriptViewer(transcript="path/to/transcript.jsonl")
viewer.write("transcript.html")
```

## Next steps

- [How-to Guides](./guide/) — task-oriented recipes.
- [Reference](./reference/) — the full API surface.
- [Explanation](./explanation/) — the concepts and "why" behind the design.
