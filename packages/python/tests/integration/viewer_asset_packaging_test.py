"""Integration tier: proves the built wheel and sdist ship viewer.html.

Builds the real wheel via `uv build`, inspects its zip listing, then
installs it into an ephemeral environment (`uv run --with <wheel>`) to prove
get_viewer_html() reads it back through importlib.resources — never a path
relative to the working directory.
"""

import subprocess
import zipfile
from pathlib import Path

PACKAGE_ROOT = Path(__file__).resolve().parents[2]
ARTIFACT_PATH = "agent_transcript_viewer/_assets/viewer.html"


def _build(tmp_path: Path) -> None:
    subprocess.run(
        ["uv", "build", "--out-dir", str(tmp_path)],
        cwd=PACKAGE_ROOT,
        check=True,
        capture_output=True,
        text=True,
    )


def _names(archive_path: Path) -> list[str]:
    if archive_path.suffix == ".whl":
        with zipfile.ZipFile(archive_path) as archive:
            return archive.namelist()
    import tarfile

    with tarfile.open(archive_path) as archive:
        return archive.getnames()


def test_wheel_contains_the_viewer_asset(tmp_path):
    _build(tmp_path)
    wheels = list(tmp_path.glob("*.whl"))
    assert len(wheels) == 1, wheels

    names = _names(wheels[0])
    assert ARTIFACT_PATH in names, f"{ARTIFACT_PATH} missing from wheel contents: {names}"


def test_sdist_contains_the_viewer_asset(tmp_path):
    _build(tmp_path)
    sdists = list(tmp_path.glob("*.tar.gz"))
    assert len(sdists) == 1, sdists

    names = _names(sdists[0])
    assert any(name.endswith(ARTIFACT_PATH) for name in names), (
        f"{ARTIFACT_PATH} missing from sdist contents: {names}"
    )


def test_installed_wheel_reads_viewer_html_via_importlib_resources(tmp_path):
    _build(tmp_path)
    wheels = list(tmp_path.glob("*.whl"))
    assert len(wheels) == 1, wheels

    result = subprocess.run(
        [
            "uv",
            "run",
            "--no-project",
            "--with",
            str(wheels[0]),
            "python",
            "-c",
            "import agent_transcript_viewer as v; html = v.get_viewer_html(); "
            "assert html.strip().startswith('<!doctype html>'), html[:80]; print('ok')",
        ],
        cwd=tmp_path,
        capture_output=True,
        text=True,
    )
    assert result.returncode == 0, result.stderr
    assert result.stdout.strip() == "ok"
