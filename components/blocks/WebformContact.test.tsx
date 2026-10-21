import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import WebformContact from "./WebformContact"

const fields = {
    name: {
        "#type": "textfield",
        "#title": "Your Name",
        "#required": true,
        "#webform_id": "contact--name",
    },
    email: {
        "#type": "email",
        "#title": "Your Email",
        "#required": true,
        "#webform_id": "contact--email",
    },
    message: {
        "#type": "textarea",
        "#title": "Message",
        "#webform_id": "contact--message",
    },
    actions: { "#type": "webform_actions", "#submit__label": "Send" },
}

const json = (body: unknown, init: ResponseInit = { status: 200 }) =>
    new Response(JSON.stringify(body), init)

function stubFetch(submit: () => Promise<Response>) {
    const fetchMock = vi.fn((url: string) =>
        url.includes("/webform_rest/contact/fields")
            ? Promise.resolve(json(fields))
            : submit()
    )
    vi.stubGlobal("fetch", fetchMock)
    return fetchMock
}

const submitCalls = (fetchMock: ReturnType<typeof stubFetch>) =>
    fetchMock.mock.calls.filter(([url]) => url.endsWith("/webform_rest/submit"))

async function fillForm(user: ReturnType<typeof userEvent.setup>) {
    await user.type(await screen.findByLabelText(/Your Name/), "Ada")
    await user.type(screen.getByLabelText(/Your Email/), "ada@example.com")
    await user.type(screen.getByLabelText(/Message/), "Hello")
}

describe("WebformContact", () => {
    beforeEach(() => {
        vi.stubEnv("NEXT_PUBLIC_LOCAL_API_URL", "https://cms.test")
        vi.spyOn(console, "error").mockImplementation(() => {})
    })
    afterEach(() => vi.restoreAllMocks())

    it("shows a loading state, then renders the fields from Drupal", async () => {
        stubFetch(() => Promise.resolve(json({})))
        render(<WebformContact />)

        expect(screen.getByText("Loading webform...")).toBeInTheDocument()
        expect(await screen.findByLabelText(/Your Name/)).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Send" })).toBeInTheDocument()
    })

    it("submits the values as JSON, shows success and resets the form", async () => {
        const user = userEvent.setup()
        const fetchMock = stubFetch(() => Promise.resolve(json({ ok: true })))
        render(<WebformContact />)

        await fillForm(user)
        await user.click(screen.getByRole("button", { name: "Send" }))

        expect(await screen.findByRole("alert")).toHaveTextContent(
            "Your message has been sent successfully."
        )
        expect(screen.getByLabelText(/Your Name/)).toHaveValue("")

        const [url, init] = submitCalls(fetchMock)[0] as unknown as [
            string,
            RequestInit,
        ]
        expect(url).toBe("https://cms.test/webform_rest/submit")
        expect(JSON.parse(init.body as string)).toEqual({
            webform_id: "contact",
            name: "Ada",
            email: "ada@example.com",
            message: "Hello",
        })
    })

    it("shows an error alert when Drupal rejects the submission", async () => {
        const user = userEvent.setup()
        stubFetch(() =>
            Promise.resolve(new Response("Validation failed", { status: 422 }))
        )
        render(<WebformContact />)

        await fillForm(user)
        await user.click(screen.getByRole("button", { name: "Send" }))

        expect(await screen.findByRole("alert")).toHaveTextContent(
            "Validation failed"
        )
        // The visitor's input is kept so they can retry.
        expect(screen.getByLabelText(/Your Name/)).toHaveValue("Ada")
    })

    it("does not send the form when a required field is empty", async () => {
        const user = userEvent.setup()
        const fetchMock = stubFetch(() => Promise.resolve(json({})))
        render(<WebformContact />)

        await screen.findByLabelText(/Your Name/)
        await user.click(screen.getByRole("button", { name: "Send" }))

        expect(submitCalls(fetchMock)).toHaveLength(0)
    })

    it("ignores a second submit while the first is still in flight", async () => {
        const user = userEvent.setup()
        let finish: (response: Response) => void = () => {}
        const fetchMock = stubFetch(
            () => new Promise<Response>((resolve) => (finish = resolve))
        )
        render(<WebformContact />)

        await fillForm(user)
        const button = screen.getByRole("button", { name: "Send" })
        await user.click(button)
        await user.click(button)

        expect(submitCalls(fetchMock)).toHaveLength(1)

        finish(json({ ok: true }))
        await waitFor(() =>
            expect(screen.getByRole("alert")).toHaveTextContent("sent")
        )
    })

    it("blocks submissions that fill the honeypot field", async () => {
        const user = userEvent.setup()
        const fetchMock = stubFetch(() => Promise.resolve(json({})))
        fetchMock.mockImplementation((url: string) =>
            Promise.resolve(
                url.includes("/fields")
                    ? json({
                          ...fields,
                          hidden_fields: {
                              "#type": "textfield",
                              "#title": "Leave empty",
                              "#webform_id": "contact--hidden_fields",
                          },
                      })
                    : json({})
            )
        )
        render(<WebformContact />)

        await fillForm(user)
        await user.type(screen.getByLabelText(/Leave empty/), "bot")
        await user.click(screen.getByRole("button", { name: "Send" }))

        expect(await screen.findByRole("alert")).toHaveTextContent(
            "There was a problem submitting the form."
        )
        expect(submitCalls(fetchMock)).toHaveLength(0)
    })
})
