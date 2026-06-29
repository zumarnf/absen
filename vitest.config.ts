import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Backend integration tests run against an in-memory MongoDB in Node.
    environment: "node",
    include: ["server/**/*.test.ts"],
    setupFiles: ["server/__tests__/setup.ts"],
    // Each test file gets its own in-memory mongod and a fresh module registry
    // (isolate), so rate-limiter state does not leak between files.
    isolate: true,
    // mongodb-memory-server may download the binary on first run.
    hookTimeout: 120_000,
    testTimeout: 30_000,
    coverage: {
      provider: "v8",
      include: ["server/**/*.ts"],
      exclude: ["server/**/*.test.ts", "server/__tests__/**", "server/seed.ts"],
    },
  },
});
