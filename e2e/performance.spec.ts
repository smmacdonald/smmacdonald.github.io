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

test("the Bootstrap subset still provides the classes the site relies on", async ({
    page,
}) => {
    await page.goto("/")

    // Probe each class on a throwaway element and read the style it produces.
    const styles = await page.evaluate(() => {
        const probe = (className: string, property: string) => {
            const element = document.createElement("div")
            element.className = className
            document.body.appendChild(element)
            const value = getComputedStyle(element).getPropertyValue(property)
            element.remove()
            return value
        }
        return {
            "d-flex": probe("d-flex", "display"),
            "d-none": probe("d-none", "display"),
            row: probe("row", "display"),
            "mb-5": probe("mb-5", "margin-bottom"),
            "p-4": probe("p-4", "padding-top"),
            invisible: probe("invisible", "visibility"),
            "list-unstyled": probe("list-unstyled", "list-style-type"),
            "visually-hidden": probe("visually-hidden", "position"),
            "form-control": probe("form-control", "border-top-width"),
            alert: probe("alert", "padding-top"),
        }
    })

    expect(styles).toEqual({
        "d-flex": "flex",
        "d-none": "none",
        row: "flex",
        "mb-5": "48px",
        "p-4": "24px",
        invisible: "hidden",
        "list-unstyled": "none",
        "visually-hidden": "absolute",
        "form-control": "1px",
        alert: "16px",
    })
})

test("the stylesheets stay within the size budget", async ({ page }) => {
    // Collect the body reads and await them all; "network idle" can fire first.
    const sizes: Promise<number>[] = []
    page.on("response", (response) => {
        if (response.request().resourceType() === "stylesheet") {
            sizes.push(response.body().then((body) => body.length))
        }
    })

    await page.goto("/")
    await page.waitForLoadState("networkidle")
    const stylesheetBytes = (await Promise.all(sizes)).reduce(
        (total, size) => total + size,
        0
    )

    // About 316 KB today: the Bootstrap subset, FontAwesome's CSS, slick and the
    // site styles. Importing all of Bootstrap again adds about 94 KB.
    expect(stylesheetBytes).toBeGreaterThan(100 * 1024)
    expect(stylesheetBytes).toBeLessThan(340 * 1024)
})
