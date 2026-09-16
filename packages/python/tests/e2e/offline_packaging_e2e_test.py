"""E2e tier: exercising the installed wheel with no Node and no network.

Issue #6's acceptance criteria ask for an e2e test that exercises `--out`
and `--url` from the installed wheel with networking disabled. There is no
CLI in this repo yet — `--out` is epic-cli issue #16, `--url` is issue #17 —
so this stays a named skip rather than a CLI invented to satisfy the
criterion, the same way tests/e2e/sdk_e2e_test.py and
packages/node/tests/e2e/viewer.spec.ts handle their own not-yet-built
pieces.
"""

import pytest


@pytest.mark.skip(reason="no CLI yet: --out is issue #16, --url is issue #17")
def test_installed_wheel_exports_and_generates_a_url_with_no_network():
    raise AssertionError("unreachable: see the skip reason above")
