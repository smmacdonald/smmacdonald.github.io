import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import FormTextField from "./FormTextField"
import FormEmail from "./FormEmail"
import FormTextArea from "./FormTextArea"
import FormSelect from "./FormSelect"
import type { WebformFieldProps } from "@/types/WebformProps"

const field = (overrides: Partial<WebformFieldProps>): WebformFieldProps => ({
    "#type": "textfield",
    "#title": "Field",
    "#webform_id": "contact--field",
    ...overrides,
})

describe("webform field components", () => {
    it.each([
        ["text field", FormTextField, "textbox"],
        ["email field", FormEmail, "textbox"],
        ["textarea", FormTextArea, "textbox"],
        ["select", FormSelect, "combobox"],
    ] as const)(
        "%s is labelled by its visible label",
        (_label, Component, role) => {
            render(
                <Component
                    name="field"
                    field={field({ "#title": "Your Name", "#required": true })}
                />
            )

            // getByLabelText only succeeds when label[for] matches the control's id.
            expect(screen.getByLabelText(/Your Name/)).toBe(
                screen.getByRole(role, { name: /Your Name/ })
            )
        }
    )

    it("falls back to the field name when there is no webform id", () => {
        render(
            <FormTextField
                name="fallback"
                field={field({ "#webform_id": undefined, "#title": "Name" })}
            />
        )

        expect(screen.getByLabelText("Name")).toHaveAttribute("id", "fallback")
    })

    it("marks required fields with an asterisk and the required attribute", () => {
        render(
            <FormEmail
                name="email"
                field={field({ "#title": "Email", "#required": true })}
            />
        )

        expect(screen.getByLabelText(/Email/)).toBeRequired()
        expect(screen.getByText("*", { exact: false })).toBeInTheDocument()
    })

    it("renders select options from #options", () => {
        render(
            <FormSelect
                name="topic"
                field={field({
                    "#title": "Topic",
                    "#options": { web: "Web", app: "App" },
                })}
            />
        )

        expect(
            screen.getAllByRole("option").map((option) => option.textContent)
        ).toEqual(["- Select -", "Web", "App"])
    })
})
