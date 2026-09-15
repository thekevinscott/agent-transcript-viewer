import { defineConfig } from 'vitest/config';

// Lives at the package root (not under src/) so the testing-conventions
// location check — which scans src/ — never treats it as an untested source
// file. Unit tests are colocated with their subject as `*.test.ts`.
//
// Every glob is cwd-agnostic on purpose: the coverage gate runs vitest from
// the scan root (packages/node/src) while `pnpm test` and the mutation gate
// run from the package root, and a `src/`-anchored glob matches in only one
// of the two.
export default defineConfig({
  test: {
    include: ['**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['**/*.ts'],
      exclude: ['**/*.test.ts'],
    },
  },
});
