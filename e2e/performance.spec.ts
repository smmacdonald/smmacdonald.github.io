import { expect, test } from "@playwright/test"

// Cheap guards for the quick wins from the performance review. They check
// bytes and markup, not timings, so they are stable.

test("the favicon is a small real icon", async ({ request }) => {
    const response = await request.get("/favicon.ico")

    expect(response.status()).toBe(200)
    // It used to be a 293 KB PNG with an .ico name.
    expect((await response.body()).length).toBeLessThan(20 * 1024)
})

test("the site fonts are served as WOFF2", async ({ page }) => {
    const siteFonts: string[] = []
    page.on("response", (response) => {
        const path = new URL(response.url()).pathname
        if (
            response.request().resourceType() === "font" &&
            /montserrat|playfair/i.test(path)
        ) {
            siteFonts.push(path)
        }
    })

    await page.goto("/")
    await page.waitForLoadState("networkidle")

    expect(siteFonts.length).toBeGreaterThan(0)
    expect(siteFonts.filter((path) => !path.endsWith(".woff2"))).toEqual([])
})

test("pages preconnect to the Drupal host that serves their images", async ({
    page,
}) => {
    await page.goto("/")

    const origin = await page
        .locator('link[rel="preconnect"][href^="http"]')
        .first()
        .getAttribute("href")

    expect(origin).toMatch(/^http:\/\/127\.0\.0\.1:\d+$/)
    // The hero image really does come from that host.
    await expect(page.locator("main section").first()).toHaveAttribute(
        "style",
        new RegExp(`url\\(.*${origin!.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`)
    )
})
