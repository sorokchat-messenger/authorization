import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  // Resolves the path aliases declared in tsconfig.json, including the ones
  // added by `nest g library`.
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    root: "./",
    include: ["**/*.spec.ts"],
    coverage: {
      exclude: [
        "test/**",
        "src/**/*.spec.ts",
        "src/**/*.options.ts",
        "src/**/*.schema.ts",
        "src/**/*.env.ts",
        "src/**/*.module.ts",
        "src/**/*.interface.ts",
        "src/**/*.provider.ts",
        "src/**/index.ts",
        "node_modules/**",
        "dist/**",
      ],
    },
  },
});
