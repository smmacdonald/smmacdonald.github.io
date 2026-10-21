import { afterEach, describe, expect, it } from "vitest"
import { render } from "@testing-library/react"
import BodyClassSync from "./BodyClassSync"

afterEach(() => {
    document.body.className = ""
})

describe("BodyClassSync", () => {
    it("adds a slugified page class to the body and removes it on unmount", () => {
        const { unmount } = render(<BodyClassSync title="Contact Me!" />)

        expect(document.body).toHaveClass("page-contact-me-")

        unmount()
        expect(document.body).not.toHaveClass("page-contact-me-")
    })

    it("swaps the class when the title changes", () => {
        const { rerender } = render(<BodyClassSync title="About" />)
        rerender(<BodyClassSync title="Portfolio" />)

        expect(document.body).toHaveClass("page-portfolio")
        expect(document.body).not.toHaveClass("page-about")
    })

    it("adds nothing for an empty title", () => {
        render(<BodyClassSync title="" />)

        expect(document.body.className).toBe("")
    })
})
