import { expect, test } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"
import { PAGES } from "./helpers"

/**
 * Automated accessibility scan (axe-core, WCAG 2.2 A/AA plus best practices).
 *
 * KNOWN lists the violations that exist today, taken from the audit. The test
 * fails when a NEW violation appears, and also when a listed one is fixed, so
 * entries must be deleted as the underlying issues are resolved.
 *
 * Automated checks find only part of the problems. `color-contrast` cannot be
 * decided by axe on these pages (text over background images); check it by
 * hand, along with keyboard use and screen reader behavior (docs/testing).
 */
const KNOWN: Record<string, string[]> = {
    // Icon-only social links have no accessible name.
    "link-name": [
        "home",
        "about",
        "portfolio",
        "project",
        "contact",
        "not-found",
    ],
    // No <main> landmark.
    "landmark-one-main": [
        "home",
        "about",
        "portfolio",
        "project",
        "contact",
        "not-found",
    ],
    region: ["home", "about", "portfolio", "project", "contact", "not-found"],
    // Heading levels skip (for example h1 to h3 in the footer call to action).
    "heading-order": ["home", "about", "portfolio", "project", "not-found"],
    // Project pages and the 404 page set no <title>.
    "document-title": ["project", "not-found"],
    // react-slick marks focusable slide dots with role="presentation".
    "presentation-role-conflict": ["portfolio"],
}

const knownFor = (name: string) =>
    Object.entries(KNOWN)
        .filter(([, pages]) => pages.includes(name))
        .map(([rule]) => rule)
        .sort()

for (const { name, path } of [
    ...PAGES,
    { name: "not-found", path: "/does-not-exist" },
]) {
    test(`@a11y ${name} page has no unexpected accessibility violations`, async ({
        page,
    }) => {
        await page.goto(path)
        await page.waitForLoadState("networkidle")

        const { violations } = await new AxeBuilder({ page })
            .withTags([
                "wcag2a",
                "wcag2aa",
                "wcag21a",
                "wcag21aa",
                "wcag22aa",
                "best-practice",
            ])
            .analyze()

        expect(violations.map((violation) => violation.id).sort()).toEqual(
            knownFor(name)
        )
    })
}

test("@a11y the open mobile menu has no new violations", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto("/")
    await page.locator("header a.mobile-menu-toggle").click()
    await expect(page.locator(".off-canvas")).toHaveClass(/active/)

    const { violations } = await new AxeBuilder({ page })
        .include(".off-canvas")
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze()

    expect(violations.map((violation) => violation.id)).toEqual([])
})
