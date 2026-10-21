import { expect, test } from "@playwright/test"

for (const path of ["/does-not-exist", "/portfolio/does-not-exist"]) {
    test(`${path} returns 404 with the not-found page`, async ({ page }) => {
        const response = await page.goto(path)

        expect(response?.status()).toBe(404)
        await expect(page.getByRole("heading", { level: 1 })).toHaveText(
            "Page not found"
        )
    })
}

test("the not-found page links back home", async ({ page }) => {
    await page.goto("/does-not-exist")

    await page.getByRole("link", { name: "Return home" }).click()

    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
        "I build powerful"
    )
})
