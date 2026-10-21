import { expect, test } from "@playwright/test"

test.describe("desktop navigation", () => {
    test("header links go to their pages", async ({ page }) => {
        await page.goto("/")
        const nav = page.locator("header .nav-wrap-main")

        await nav.getByRole("link", { name: "About" }).click()
        await expect(page).toHaveURL(/\/about$/)
        await expect(page.getByRole("heading", { level: 1 })).toContainText(
            "Building better"
        )

        await nav.getByRole("link", { name: "Portfolio" }).click()
        await expect(page).toHaveURL(/\/portfolio$/)

        await nav.getByRole("link", { name: "Contact" }).click()
        await expect(page).toHaveURL(/\/contact$/)

        await nav.getByRole("link", { name: "Home" }).click()
        await expect(page).toHaveURL(/\/$/)
    })

    test("the header shrinks and gains the sticky class after scrolling", async ({
        page,
    }) => {
        await page.goto("/")
        const header = page.locator("header.site-header")

        await expect(header).not.toHaveClass(/sticky/)
        await page.evaluate(() => window.scrollTo(0, 400))
        await expect(header).toHaveClass(/sticky/)
        await expect
            .poll(async () => (await header.boundingBox())?.height)
            .toBeLessThan(80)

        await page.evaluate(() => window.scrollTo(0, 0))
        await expect(header).not.toHaveClass(/sticky/)
    })

    test("the mobile menu is not shown", async ({ page }) => {
        await page.goto("/")

        await expect(page.locator("header .nav-wrap-mobile")).toBeHidden()
    })
})

test.describe("mobile navigation", () => {
    test.use({ viewport: { width: 390, height: 844 } })

    test("the desktop menu is hidden and the toggle opens the off-canvas menu", async ({
        page,
    }) => {
        await page.goto("/")
        const panel = page.locator(".off-canvas")

        await expect(page.locator("header .nav-wrap-main")).toBeHidden()
        await expect(panel).not.toHaveClass(/active/)

        await page.locator("header a.mobile-menu-toggle").click()
        await expect(panel).toHaveClass(/active/)
        await expect(panel.getByRole("link", { name: "About" })).toBeVisible()
    })

    test("a link in the off-canvas menu navigates to its page", async ({
        page,
    }) => {
        await page.goto("/")
        await page.locator("header a.mobile-menu-toggle").click()

        await page
            .locator(".off-canvas")
            .getByRole("link", { name: "Contact" })
            .click()

        await expect(page).toHaveURL(/\/contact$/)
    })

    test("the toggle closes the menu again", async ({ page }) => {
        await page.goto("/")
        const panel = page.locator(".off-canvas")

        await page.locator("header a.mobile-menu-toggle").click()
        await expect(panel).toHaveClass(/active/)

        await panel.locator("a.mobile-menu-toggle").click()
        await expect(panel).not.toHaveClass(/active/)
    })
})

test("keyboard users can tab through the header links in order", async ({
    page,
    browserName,
}) => {
    // Safari only moves focus to links with Option+Tab unless a preference is set.
    test.skip(
        browserName === "webkit",
        "Safari does not Tab to links by default"
    )

    await page.goto("/")

    const reached: string[] = []
    for (let i = 0; i < 6; i++) {
        await page.keyboard.press("Tab")
        reached.push(
            await page.evaluate(
                () => document.activeElement?.getAttribute("href") ?? ""
            )
        )
    }

    expect(reached.slice(0, 5)).toEqual([
        "/",
        "/",
        "/about",
        "/portfolio",
        "/contact",
    ])
})

// Known gaps from the audit: no skip link and the off-canvas menu ignores Escape.
test.fixme("a skip link is the first focusable element", async ({ page }) => {
    await page.goto("/")
    await page.keyboard.press("Tab")

    await expect(
        page.getByRole("link", { name: /skip to (main )?content/i })
    ).toBeFocused()
})

test.fixme("Escape closes the off-canvas menu", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto("/")
    await page.locator("header a.mobile-menu-toggle").click()

    await page.keyboard.press("Escape")

    await expect(page.locator(".off-canvas")).not.toHaveClass(/active/)
})
