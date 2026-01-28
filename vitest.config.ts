import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: [],
    globals: true,
    coverage: {
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "src/interfaces/web/app/**"],
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
