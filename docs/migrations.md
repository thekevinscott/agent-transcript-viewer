---
diataxis: reference
---

# Migrations

Migration records live in each package's `migrations.d/` folder — one
timestamped file per breaking change, named `YYYY-MM-DD-<slug>.md` (UTC merge
date). Newest = highest sort order. The folders are the record: no rendered
file is assembled from them.

Changelog entries live alongside in each package's `changelog.d/` folder.
Published packages ship both folders where the packaging toolchain allows, so
the installed copy carries a version-exact record.
