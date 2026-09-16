"""Access to the bundled, self-contained viewer HTML artifact."""

from importlib import resources


def get_viewer_html() -> str:
    """Return the contents of the bundled viewer.html.

    Read via importlib.resources so it works from an installed wheel
    regardless of the process's working directory.
    """
    return (
        resources.files("agent_transcript_viewer")
        .joinpath("_assets", "viewer.html")
        .read_text(encoding="utf-8")
    )
