import { expect, test } from "@playwright/test"

test("a page whose Drupal breadcrumb trail is empty still gets a Home link", async ({
    page,
}) => {
    // The mock returns an empty trail for /about (E2E_EMPTY_BREADCRUMBS in playwright.config.ts).
    await page.goto("/about")
    const breadcrumbs = page.locator(".breadcrumbs")

    await expect(breadcrumbs.locator("li")).toHaveText(["Home", "About"])
    await expect(
        breadcrumbs.getByRole("link", { name: "Home" })
    ).toHaveAttribute("href", "/")
})

test("the Home link keeps its spacing when Drupal supplied the trail", async ({
    page,
}) => {
    await page.goto("/portfolio/macdonaldesign")
    const home = page
        .locator(".breadcrumbs")
        .getByRole("link", { name: "Home" })

    await expect(home).toHaveClass(/py-3/)
    expect(
        await home.evaluate((el) => parseFloat(getComputedStyle(el).paddingTop))
    ).toBeGreaterThan(0)
})

test("the Home link has the same spacing when it was added by the frontend", async ({
    page,
}) => {
    await page.goto("/about")
    const home = page
        .locator(".breadcrumbs")
        .getByRole("link", { name: "Home" })

    await expect(home).toHaveClass(/py-3/)
    expect(
        await home.evaluate((el) => parseFloat(getComputedStyle(el).paddingTop))
    ).toBeGreaterThan(0)
})
