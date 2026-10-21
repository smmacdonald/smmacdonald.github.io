import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import ContactFormShell from "./ContactFormShell"
import { RenderFormFields } from "@/src/utils/RenderFormFields"
import type { WebformProps } from "@/types/WebformProps"

const fields: WebformProps = {
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

function renderForm(formFields: WebformProps = fields) {
    return render(
        <ContactFormShell>
            {Object.entries(formFields).map(([key, field], index) =>
                RenderFormFields(key, field, index)
            )}
        </ContactFormShell>
    )
}

function stubSubmit(submit: () => Promise<Response>) {
    const fetchMock = vi.fn(submit)
    vi.stubGlobal("fetch", fetchMock)
    return fetchMock
}

async function fillForm(user: ReturnType<typeof userEvent.setup>) {
    await user.type(screen.getByLabelText(/Your Name/), "Ada")
    await user.type(screen.getByLabelText(/Your Email/), "ada@example.com")
    await user.type(screen.getByLabelText(/Message/), "Hello")
}

describe("ContactFormShell", () => {
    beforeEach(() => {
        vi.stubEnv("NEXT_PUBLIC_LOCAL_API_URL", "https://cms.test")
        vi.spyOn(console, "error").mockImplementation(() => {})
    })
    afterEach(() => vi.restoreAllMocks())

    it("renders the server-provided fields with their labels", () => {
        renderForm()

        expect(screen.getByLabelText(/Your Name/)).toBeRequired()
        expect(screen.getByLabelText(/Your Email/)).toBeRequired()
        expect(screen.getByRole("button", { name: "Send" })).toBeInTheDocument()
    })

    it("submits the values as JSON, shows success and resets the form", async () => {
        const user = userEvent.setup()
        const fetchMock = stubSubmit(() => Promise.resolve(json({ ok: true })))
        renderForm()

        await fillForm(user)
        await user.click(screen.getByRole("button", { name: "Send" }))

        expect(await screen.findByRole("alert")).toHaveTextContent(
            "Your message has been sent successfully."
        )
        expect(screen.getByLabelText(/Your Name/)).toHaveValue("")

        const [url, init] = fetchMock.mock.calls[0] as unknown as [
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

    it("shows a generic error, not the server's response, when Drupal rejects the submission", async () => {
        const user = userEvent.setup()
        stubSubmit(() =>
            Promise.resolve(new Response("Validation failed", { status: 422 }))
        )
        renderForm()

        await fillForm(user)
        await user.click(screen.getByRole("button", { name: "Send" }))

        const alert = await screen.findByRole("alert")
        expect(alert).toHaveTextContent(
            "There was a problem submitting the form."
        )
        expect(alert).not.toHaveTextContent("Validation failed")
        // The visitor's input is kept so they can retry.
        expect(screen.getByLabelText(/Your Name/)).toHaveValue("Ada")
    })

    it("does not send the form when a required field is empty", async () => {
        const user = userEvent.setup()
        const fetchMock = stubSubmit(() => Promise.resolve(json({})))
        renderForm()

        await user.click(screen.getByRole("button", { name: "Send" }))

        expect(fetchMock).not.toHaveBeenCalled()
    })

    it("ignores a second submit while the first is still in flight", async () => {
        const user = userEvent.setup()
        let finish: (response: Response) => void = () => {}
        const fetchMock = stubSubmit(
            () => new Promise<Response>((resolve) => (finish = resolve))
        )
        renderForm()

        await fillForm(user)
        const button = screen.getByRole("button", { name: "Send" })
        await user.click(button)
        await user.click(button)

        expect(fetchMock).toHaveBeenCalledTimes(1)

        finish(json({ ok: true }))
        await waitFor(() =>
            expect(screen.getByRole("alert")).toHaveTextContent("sent")
        )
    })

    it("blocks submissions that fill the honeypot field", async () => {
        const user = userEvent.setup()
        const fetchMock = stubSubmit(() => Promise.resolve(json({})))
        renderForm({
            ...fields,
            hidden_fields: {
                "#type": "textfield",
                "#title": "Leave empty",
                "#webform_id": "contact--hidden_fields",
            },
        })

        await fillForm(user)
        await user.type(screen.getByLabelText(/Leave empty/), "bot")
        await user.click(screen.getByRole("button", { name: "Send" }))

        expect(await screen.findByRole("alert")).toHaveTextContent(
            "There was a problem submitting the form."
        )
        expect(fetchMock).not.toHaveBeenCalled()
    })
})
