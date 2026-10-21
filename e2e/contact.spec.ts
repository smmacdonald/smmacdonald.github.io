import { expect, test } from "@playwright/test"

const SUBMIT = "**/webform_rest/submit"

async function fillForm(page: import("@playwright/test").Page) {
    await page.getByLabel(/Your Name/).fill("Ada Lovelace")
    await page.getByLabel(/Your Email/).fill("ada@example.com")
    await page.getByLabel(/Subject/).fill("Hello")
    await page.getByLabel(/Message/).fill("I would like to work together.")
}

test.beforeEach(async ({ page }) => {
    await page.goto("/contact")
})

test("renders the form fields from Drupal with labels", async ({ page }) => {
    for (const label of [/Your Name/, /Your Email/, /Subject/, /Message/]) {
        await expect(page.getByLabel(label)).toBeVisible()
        await expect(page.getByLabel(label)).toHaveJSProperty("required", true)
    }
    await expect(
        page.getByRole("button", { name: /submit|send/i })
    ).toBeVisible()
})

test("the honeypot field is not visible to visitors", async ({ page }) => {
    await expect(page.locator(".invisible select")).toBeHidden()
})

test("does not submit while required fields are empty", async ({ page }) => {
    let submitted = false
    await page.route(SUBMIT, (route) => {
        submitted = true
        return route.fulfill({ status: 200, body: "{}" })
    })

    await page.getByRole("button", { name: /submit|send/i }).click()

    expect(submitted).toBe(false)
    await expect(page.getByLabel(/Your Name/)).toBeFocused()
})

test("submits the values and confirms success", async ({ page }) => {
    let payload: Record<string, string> = {}
    await page.route(SUBMIT, (route) => {
        payload = route.request().postDataJSON()
        return route.fulfill({
            status: 200,
            contentType: "application/json",
            body: '{"sid":"1"}',
        })
    })

    await fillForm(page)
    await page.getByRole("button", { name: /submit|send/i }).click()

    await expect(page.locator("#contact").getByRole("alert")).toContainText(
        "Your message has been sent successfully."
    )
    expect(payload).toMatchObject({
        webform_id: "contact",
        name: "Ada Lovelace",
        email: "ada@example.com",
        subject: "Hello",
        message: "I would like to work together.",
    })
    await expect(page.getByLabel(/Your Name/)).toHaveValue("")
})

test("shows an error and keeps the input when the submission fails", async ({
    page,
}) => {
    await page.route(SUBMIT, (route) =>
        route.fulfill({
            status: 500,
            contentType: "text/plain",
            body: "Server error",
        })
    )

    await fillForm(page)
    await page.getByRole("button", { name: /submit|send/i }).click()

    await expect(page.locator("#contact").getByRole("alert")).toBeVisible()
    await expect(page.getByLabel(/Your Name/)).toHaveValue("Ada Lovelace")
})

test("a failed submission shows a generic message, not the server response", async ({
    page,
}) => {
    await page.route(SUBMIT, (route) =>
        route.fulfill({
            status: 500,
            contentType: "text/plain",
            body: "SQLSTATE[HY000] secret detail",
        })
    )

    await fillForm(page)
    await page.getByRole("button", { name: /submit|send/i }).click()

    const alert = page.locator("#contact").getByRole("alert")
    await expect(alert).toHaveText("There was a problem submitting the form.")
    await expect(alert).not.toContainText("SQLSTATE")
})
