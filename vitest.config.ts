import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["src/**/*.test.ts", "src/**/*.spec.ts"],
    setupFiles: ["src/setupTests.ts"],
    coverage: {
      provider: "v8",
    },
    passWithNoTests: true
  },
  plugins: [tsconfigPaths()],
});
