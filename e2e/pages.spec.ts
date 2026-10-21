import { expect, test } from "@playwright/test"
import { PAGES, trackProblems } from "./helpers"

for (const { name, path } of PAGES) {
    test(`${name} page loads without console errors or failed requests`, async ({
        page,
    }) => {
        const problems = trackProblems(page)

        const response = await page.goto(path)
        await page.waitForLoadState("networkidle")

        expect(response?.status()).toBe(200)
        await expect(
            page.getByRole("heading", { level: 1 }).first()
        ).toBeVisible()
        expect(problems).toEqual([])
    })
}

test("home page shows the headline, featured work and footer contact links", async ({
    page,
}) => {
    await page.goto("/")

    await expect(page).toHaveTitle("Homepage | portfolio")
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
        "I build powerful"
    )
    await expect(page.locator('a[href^="/portfolio/"]').first()).toBeVisible()
    await expect(page.locator('footer a[href^="mailto:"]')).toHaveCount(1)
})

test("every internal link on every page resolves", async ({
    page,
    request,
}) => {
    const links = new Set<string>()

    for (const { path } of PAGES) {
        await page.goto(path)
        for (const href of await page
            .locator('a[href^="/"]')
            .evaluateAll((anchors) =>
                anchors.map((anchor) => anchor.getAttribute("href") as string)
            )) {
            links.add(href.split("#")[0] || "/")
        }
    }

    expect(links.size).toBeGreaterThan(5)
    for (const href of links) {
        const response = await request.get(href)
        expect(response.status(), `GET ${href}`).toBe(200)
    }
})

test("social links point to the expected external profiles", async ({
    page,
}) => {
    await page.goto("/")

    const hrefs = await page
        .locator('footer a[href^="https://"]')
        .evaluateAll((anchors) =>
            anchors.map((anchor) => anchor.getAttribute("href"))
        )

    expect(hrefs).toEqual([
        "https://www.linkedin.com/in/smmacdonald/",
        "https://github.com/smmacdonald",
    ])
})

test("external links that open a new tab set rel=noopener noreferrer and name the destination", async ({
    page,
}) => {
    await page.goto("/")
    const links = page.locator('a[target="_blank"]')

    await expect(links).toHaveCount(2)
    for (const link of await links.all()) {
        await expect(link).toHaveAttribute("rel", "noopener noreferrer")
        await expect(link).toHaveAccessibleName(/opens in a new tab/)
    }
    await expect(
        page.getByRole("link", { name: "LinkedIn (opens in a new tab)" })
    ).toBeVisible()
    await expect(
        page.getByRole("link", { name: "GitHub (opens in a new tab)" })
    ).toBeVisible()
})

test("project pages use the title from Drupal's metatags", async ({ page }) => {
    await page.goto("/portfolio/macdonaldesign")

    await expect(page).toHaveTitle("MacDonalDesign | portfolio")
})

test("the 404 page has a title", async ({ page }) => {
    await page.goto("/does-not-exist")

    await expect(page).toHaveTitle("Page not found | portfolio")
})

test("the home page canonical is / rather than the redirecting /homepage", async ({
    page,
}) => {
    await page.goto("/")

    const canonical = await page
        .locator('link[rel="canonical"]')
        .getAttribute("href")

    expect(new URL(canonical!).pathname).toBe("/")
})

test("the home page offers Drupal's thumbnail as the share image", async ({
    page,
}) => {
    await page.goto("/")

    // The fixture's home page has a Metatag "Image" (a legacy image_src link).
    const ogImage = page.locator('meta[property="og:image"]')
    await expect(ogImage).toHaveAttribute(
        "content",
        /^https?:\/\/.+\/sites\/default\/files\/.+\.(jpe?g|png)$/
    )
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
        "content",
        "summary_large_image"
    )
    await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute(
        "content",
        (await ogImage.getAttribute("content"))!
    )
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
        "content",
        "Homepage | portfolio"
    )
})
