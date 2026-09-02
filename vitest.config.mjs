import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "server-only": fileURLToPath(
        new URL("./tests/support/server-only.js", import.meta.url),
      ),
      "@": root,
    },
  },
  test: {
    environment: "node",
    setupFiles: ["./tests/setup.js"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: [
        "lib/server/auth/password.js",
        "lib/server/imports/analysis-engine.js",
        "lib/server/imports/heuristics.js",
        "lib/server/imports/parser.js",
      ],
      thresholds: {
        lines: 60,
        functions: 60,
        statements: 60,
        branches: 45,
      },
    },
  },
});
