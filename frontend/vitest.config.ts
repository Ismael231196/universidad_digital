import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./tests/setupTests.ts",
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      reportsDirectory: "./coverage",
      lines: 85,
      branches: 85,
      functions: 85,
      statements: 85
    },
    include: ["tests/**/*.test.{ts,tsx}"],
    exclude: ["node_modules", "dist"]
  }
});

