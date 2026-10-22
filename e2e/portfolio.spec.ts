import { expect, test } from "@playwright/test"
import { archivedFilters, archivedProjects } from "./helpers"

test.describe("portfolio listing", () => {
    test("shows every archived project and the filter options", async ({
        page,
    }) => {
        await page.goto("/portfolio")

        await expect(page.locator(".portfolio-archived-work")).toHaveCount(
            archivedProjects.length
        )
        await expect(page.getByLabel("- Any -")).toBeChecked()
        await expect(page.locator('input[name="PortfolioFilter"]')).toHaveCount(
            archivedFilters.length + 1
        )
    })

    test("filtering narrows the list and Any restores it", async ({ page }) => {
        await page.goto("/portfolio")
        const filter = archivedFilters.find(
            (item) => item.name === "Healthcare"
        )!
        const cards = page.locator(".portfolio-archived-work")

        // The radios are visually hidden; visitors click the label pills.
        await page.getByText(`Healthcare (${filter.count})`).click()
        await expect(
            page.getByLabel(`Healthcare (${filter.count})`)
        ).toBeChecked()
        await expect(cards).toHaveCount(Number(filter.count))

        await page.getByText("- Any -").click()
        await expect(cards).toHaveCount(archivedProjects.length)
    })

    test("filter counts add up to the full list", () => {
        const total = archivedFilters.reduce(
            (sum, item) => sum + Number(item.count),
            0
        )

        expect(total).toBe(archivedProjects.length)
    })

    test("filtering makes no Drupal data requests", async ({ page }) => {
        await page.goto("/portfolio")
        await page.waitForLoadState("networkidle")
        const requests: string[] = []
        page.on("request", (request) => requests.push(request.url()))

        await page.getByText(/^Government/).click()

        await expect(page.locator(".portfolio-archived-work")).toHaveCount(1)
        // Images and link prefetches may load; API calls must not happen.
        const apiCalls = requests.filter((url) =>
            /^\/(rest|graphql|webform_rest)(\/|$)/.test(new URL(url).pathname)
        )
        expect(apiCalls).toEqual([])
    })
})

test.describe("project pages", () => {
    test("a featured project opens from the home page", async ({ page }) => {
        await page.goto("/")

        await page
            .locator('a[href="/portfolio/macdonaldesign"]')
            .first()
            .click()

        await expect(page).toHaveURL(/\/portfolio\/macdonaldesign$/)
        await expect(page.getByRole("heading", { level: 1 })).toHaveText(
            "MacDonalDesign"
        )
    })

    test("shows breadcrumbs that link back up the tree", async ({ page }) => {
        await page.goto("/portfolio/macdonaldesign")
        const breadcrumbs = page.locator(".breadcrumbs")

        await expect(breadcrumbs.locator("li")).toHaveText([
            "Home",
            "Portfolio",
            "MacDonalDesign",
        ])

        await breadcrumbs.getByRole("link", { name: "Portfolio" }).click()
        await expect(page).toHaveURL(/\/portfolio$/)
    })
})

test.describe("text from Drupal's REST views", () => {
    test("project titles show their real characters, not HTML escapes", async ({
        page,
    }) => {
        await page.goto("/portfolio")

        // The REST view returns "Earth &amp; Sky"; visitors must see "Earth & Sky".
        await expect(
            page.getByText("Earth & Sky", { exact: true })
        ).toBeVisible()
        await expect(
            page.getByText("Isaacs & Isaacs", { exact: true })
        ).toBeVisible()
        expect(await page.locator("main").innerText()).not.toContain("&amp;")
    })

    test("filter labels and image URLs are decoded too", async ({ page }) => {
        await page.goto("/portfolio")

        await expect(page.getByLabel(/^Local & Creative/)).toBeAttached()
        // Image URLs must not carry a literal "&amp;" into their query strings.
        expect(await page.locator('img[src*="&amp;"]').count()).toBe(0)
    })

    test("no page shows a literal HTML escape in its visible text", async ({
        page,
    }) => {
        for (const path of [
            "/",
            "/about",
            "/portfolio",
            "/portfolio/macdonaldesign",
            "/contact",
        ]) {
            await page.goto(path)
            expect(await page.locator("body").innerText(), path).not.toMatch(
                /&(amp|lt|gt|quot|#\d+);/
            )
        }
    })
})
