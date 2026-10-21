import fs from "node:fs"
import path from "node:path"
import type { Page } from "@playwright/test"

const fixture = (...segments: string[]) =>
    JSON.parse(
        fs.readFileSync(path.join(__dirname, "fixtures", ...segments), "utf8")
    )

/** Archived projects and filters exactly as the mock Drupal serves them. */
export const archivedProjects: { title: string }[] = fixture(
    "rest",
    "rest_projects_archived.json"
)
export const archivedFilters: { name: string; count: string; tid: string }[] =
    fixture("rest", "rest_projects_filters_archived.json")

/** Collects console errors and failed network requests while a page is used. */
export function trackProblems(page: Page) {
    const problems: string[] = []
    page.on("console", (message) => {
        if (message.type() === "error")
            problems.push(`console: ${message.text()}`)
    })
    page.on("pageerror", (error) =>
        problems.push(`pageerror: ${error.message}`)
    )
    page.on("requestfailed", (request) => {
        const reason = request.failure()?.errorText
        // Next aborts in-flight link prefetches when the page settles; that is normal.
        if (reason !== "net::ERR_ABORTED")
            problems.push(`request failed: ${request.url()} (${reason})`)
    })
    page.on("response", (response) => {
        if (response.status() >= 400)
            problems.push(`${response.status()}: ${response.url()}`)
    })
    return problems
}

/** Site pages covered by the smoke and accessibility tests. */
export const PAGES = [
    { name: "home", path: "/" },
    { name: "about", path: "/about" },
    { name: "portfolio", path: "/portfolio" },
    { name: "project", path: "/portfolio/macdonaldesign" },
    { name: "contact", path: "/contact" },
] as const
