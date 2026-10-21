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

// Known gap from the audit: external links open in a new tab but set no `rel`.
test.fixme("external links that open a new tab set rel=noopener noreferrer", async ({
    page,
}) => {
    await page.goto("/")

    for (const link of await page.locator('a[target="_blank"]').all()) {
        await expect(link).toHaveAttribute("rel", /noopener/)
    }
})

// Known gap from the audit: project pages request no SEO metadata from Drupal.
test.fixme("project pages have a title and meta description", async ({
    page,
}) => {
    await page.goto("/portfolio/macdonaldesign")

    await expect(page).toHaveTitle(/MacDonalDesign/)
    await expect(page.locator('meta[name="description"]')).toHaveCount(1)
})
