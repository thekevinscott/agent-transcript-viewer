# Migrations

This file is a pointer, not the record — never append entries here.

Migration records live in [`docs/migrations.d/`](../../docs/migrations.d/) at
the repository root: one timestamped file per breaking change, named
`YYYY-MM-DD-frontend-<slug>.md` (UTC merge date). Newest = highest sort order.
Entries for this package are the files with `-frontend-` after the date
prefix; fragments predating the `packages/node` rename use `-node-`.
