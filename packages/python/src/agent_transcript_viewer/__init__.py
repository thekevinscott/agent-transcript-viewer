"""agent-transcript-viewer — generate and share self-contained HTML transcript views."""

from agent_transcript_viewer._version import __version__
from agent_transcript_viewer.viewer_assets import get_viewer_html

__all__ = ["__version__", "get_viewer_html"]
