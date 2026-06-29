import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    // Mirror the tsconfig path alias so frontend tests can import via "@/...".
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  // Use the automatic JSX runtime so component tests don't need to import React.
  esbuild: {
    jsx: "automatic",
  },
  test: {
    coverage: {
      provider: "v8",
      include: ["server/**/*.ts", "src/**/*.ts"],
      exclude: [
        "server/**/*.test.ts",
        "server/__tests__/**",
        "src/**/*.test.{ts,tsx}",
        "**/*.d.ts",
      ],
    },
    // Two isolated projects: the backend suite runs against an in-memory
    // MongoDB (node + mongo setup), the frontend suite unit-tests pure helpers
    // and schemas (node, no database) so the mongo setup never runs for them.
    projects: [
      {
        extends: true,
        test: {
          name: "backend",
          environment: "node",
          include: ["server/**/*.test.ts"],
          setupFiles: ["server/__tests__/setup.ts"],
          // Each test file gets its own in-memory mongod and a fresh module
          // registry (isolate), so rate-limiter state does not leak.
          isolate: true,
          hookTimeout: 120_000,
          testTimeout: 30_000,
        },
      },
      {
        extends: true,
        test: {
          name: "frontend",
          // jsdom so React component tests can render; pure-helper tests run
          // fine under it too.
          environment: "jsdom",
          include: ["src/**/*.test.{ts,tsx}"],
          setupFiles: ["src/test/setup.ts"],
        },
      },
    ],
  },
});
