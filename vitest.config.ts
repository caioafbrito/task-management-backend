import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true, // Jest-like (describe, it, expect globais)
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.spec.ts"],
    passWithNoTests: true,
  },
});
