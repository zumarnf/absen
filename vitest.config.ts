import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    // Mirror the tsconfig path alias so frontend tests can import via "@/...".
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
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
          environment: "node",
          include: ["src/**/*.test.{ts,tsx}"],
        },
      },
    ],
  },
});
