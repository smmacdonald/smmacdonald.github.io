import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"

export default defineConfig({
    plugins: [react()],
    resolve: { tsconfigPaths: true },
    test: {
        environment: "jsdom",
        setupFiles: ["./vitest.setup.ts"],
        include: ["**/*.test.{ts,tsx}"],
        exclude: ["node_modules", ".next", "out", "e2e"],
        coverage: {
            provider: "v8",
            reporter: ["text-summary", "html"],
            include: [
                "lib/**/*.{ts,tsx}",
                "src/**/*.{ts,tsx}",
                "components/**/*.{ts,tsx}",
            ],
            exclude: ["**/*.test.{ts,tsx}"],
            // Baseline when added: ~73% statements/lines, ~64% branches/functions.
            thresholds: {
                statements: 70,
                lines: 70,
                branches: 60,
                functions: 60,
            },
        },
    },
})
