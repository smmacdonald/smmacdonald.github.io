import { defineConfig, devices } from "@playwright/test"

const PORT = Number(process.env.E2E_SITE_PORT ?? 4011)

export default defineConfig({
    testDir: "./e2e",
    testMatch: "**/*.spec.ts",
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    reporter: process.env.CI
        ? [["github"], ["html", { open: "never" }]]
        : [["list"], ["html", { open: "never" }]],
    use: {
        baseURL: `http://127.0.0.1:${PORT}`,
        trace: "on-first-retry",
        screenshot: "only-on-failure",
    },
    projects: [
        { name: "chromium", use: { ...devices["Desktop Chrome"] } },
        // Set E2E_ALL_BROWSERS=1 (CI, scheduled) to also run the other engines.
        ...(process.env.E2E_ALL_BROWSERS
            ? [
                  { name: "firefox", use: { ...devices["Desktop Firefox"] } },
                  { name: "webkit", use: { ...devices["Desktop Safari"] } },
              ]
            : []),
    ],
    webServer: {
        // Builds the site against the mock Drupal (e2e/fixtures), then serves it.
        command: "node e2e/server.mjs",
        // Simulates Drupal returning no breadcrumbs for /about (see breadcrumbs.spec.ts).
        env: { E2E_EMPTY_BREADCRUMBS: "/about" },
        url: `http://127.0.0.1:${PORT}`,
        reuseExistingServer: !process.env.CI,
        timeout: 240_000,
        stdout: "pipe",
    },
})
