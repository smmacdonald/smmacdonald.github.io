import { beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import WebformContact from "./WebformContact"

const fields = {
    name: {
        "#type": "textfield",
        "#title": "Your Name",
        "#webform_id": "contact--name",
    },
    actions: { "#type": "webform_actions", "#submit__label": "Send" },
}

describe("WebformContact (server component)", () => {
    beforeEach(() => {
        vi.stubEnv("NEXT_PUBLIC_LOCAL_API_URL", "https://cms.test")
    })

    it("renders the fields fetched from Drupal at build time", async () => {
        const fetchMock = vi.fn(() =>
            Promise.resolve(new Response(JSON.stringify(fields)))
        )
        vi.stubGlobal("fetch", fetchMock)

        render(await WebformContact())

        expect(fetchMock).toHaveBeenCalledWith(
            "https://cms.test/webform_rest/contact/fields?_format=json",
            expect.anything()
        )
        expect(screen.getByLabelText("Your Name")).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Send" })).toBeInTheDocument()
    })

    it("fails the build when Drupal refuses the field definitions", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn(() =>
                Promise.resolve(new Response("denied", { status: 403 }))
            )
        )

        await expect(WebformContact()).rejects.toThrow(/403/)
    })
})
