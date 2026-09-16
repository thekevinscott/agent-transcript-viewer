from pathlib import Path

from hatchling.builders.hooks.plugin.interface import BuildHookInterface


class ViewerAssetBuildHook(BuildHookInterface):
    PLUGIN_NAME = "viewer-asset"

    def initialize(self, version: str, build_data: dict) -> None:
        if version == "editable":
            # A dev install is not a distributable artifact, and requiring a
            # Node build to run `pytest` would couple the unit tier to the
            # frontend toolchain. `get_viewer_html()` raises until the asset
            # is there, which is the honest state of such a checkout.
            return

        dest = Path(
            self.root, "src", "agent_transcript_viewer", "_assets", "viewer.html"
        )
        if dest.is_file():
            # Building the wheel from an already-unpacked sdist: the asset
            # travelled with the sdist (via the `artifacts` config) and
            # packages/node isn't a sibling directory in that tree.
            return

        source = Path(self.root, "..", "node", "dist", "viewer.html").resolve()
        if not source.is_file():
            raise FileNotFoundError(
                f"{source} does not exist — run `just node-build` (or `pnpm run build` "
                "in packages/node) before building the Python package"
            )

        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(source.read_bytes())
