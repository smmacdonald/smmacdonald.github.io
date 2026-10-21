import { describe, expect, it } from "vitest"
import { externalLinkLabel } from "./externalLink"

describe("externalLinkLabel", () => {
    it("prefers the CMS link title", () => {
        expect(externalLinkLabel("https://github.com/x", " My GitHub ")).toBe(
            "My GitHub"
        )
    })

    it.each([
        ["https://www.linkedin.com/in/someone/", "LinkedIn"],
        ["https://github.com/someone", "GitHub"],
        ["https://x.com/someone", "X"],
    ])("names %s from its host when the title is empty", (url, label) => {
        expect(externalLinkLabel(url, "")).toBe(label)
        expect(externalLinkLabel(url, null)).toBe(label)
        expect(externalLinkLabel(url)).toBe(label)
    })

    it("falls back to the host for unknown sites", () => {
        expect(externalLinkLabel("https://www.example.org/page")).toBe(
            "example.org"
        )
    })

    it("falls back to the raw value when it is not a URL", () => {
        expect(externalLinkLabel("not a url")).toBe("not a url")
    })
})
