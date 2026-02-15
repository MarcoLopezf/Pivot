import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./src/tests/setup.ts"],
    globals: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "text-summary", "json", "html", "lcov"],
      reportsDirectory: "./coverage",

      // ─── STRATEGIC COVERAGE: Only measure Tier 1 + Tier 2 ───
      include: [
        // Tier 1 — CORE (100%): Domain business logic
        "src/domain/**/entities/**/*.ts",
        "src/domain/**/value-objects/**/*.ts",
        "src/domain/**/services/**/*.ts",
        // Tier 2 — IMPORTANT (80%): Use cases + infrastructure
        "src/application/use-cases/**/*.ts",
        "src/infrastructure/database/mappers/**/*.ts",
        "src/infrastructure/services/**/*.ts",
      ],

      // Tier 3 — EXCLUDED (0%): Auto-validable, not worth unit testing
      exclude: [
        "node_modules/**",
        "src/app/**",
        "src/components/ui/**",
        "src/interfaces/**",
        "src/infrastructure/di/**",
        "src/infrastructure/auth/**",
        "src/infrastructure/ai/**",
        "src/infrastructure/database/repositories/**",
        "src/infrastructure/database/PrismaClient.ts",
        "src/infrastructure/logging/**",
        "src/application/dtos/**",
        "src/domain/**/repositories/**",
        "src/domain/**/services/I*.ts",
        "src/lib/**",
        "src/tests/**",
        "**/*.test.ts",
        "**/*.spec.ts",
        "**/*.d.ts",
      ],

      // Threshold enforcement (global minimum)
      thresholds: {
        lines: 70,
        branches: 70,
        functions: 70,
        statements: 70,
      },

      // Color-coded output: red < 50%, yellow 50-80%, green > 80%
      watermarks: {
        lines: [50, 80],
        branches: [50, 80],
        functions: [50, 80],
        statements: [50, 80],
      },
    },
  },
  resolve: {
    alias: {
      "@domain": path.resolve(__dirname, "./src/domain"),
      "@application": path.resolve(__dirname, "./src/application"),
      "@infrastructure": path.resolve(__dirname, "./src/infrastructure"),
      "@interfaces": path.resolve(__dirname, "./src/interfaces"),
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
