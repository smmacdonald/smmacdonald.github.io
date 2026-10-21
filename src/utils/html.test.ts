import { describe, expect, it, vi } from "vitest"
import { fixCmsImagePaths } from "./html"

describe("fixCmsImagePaths", () => {
    it("returns an empty string for empty input", () => {
        expect(fixCmsImagePaths(undefined)).toBe("")
        expect(fixCmsImagePaths(null)).toBe("")
        expect(fixCmsImagePaths("")).toBe("")
    })

    it("prefixes relative /sites/ src and srcset attributes with the API origin", () => {
        vi.stubEnv("NEXT_PUBLIC_LOCAL_API_URL", "https://cms.test")

        const html =
            '<img src="/sites/default/a.png" srcset="/sites/default/a.png 1x">'

        expect(fixCmsImagePaths(html)).toBe(
            '<img src="https://cms.test/sites/default/a.png" srcset="https://cms.test/sites/default/a.png 1x">'
        )
    })

    // Known gap: only the first URL in a multi-candidate srcset is rewritten, so
    // later candidates stay relative and resolve against the Next.js origin.
    it.fails("rewrites every candidate in a multi-URL srcset", () => {
        vi.stubEnv("NEXT_PUBLIC_LOCAL_API_URL", "https://cms.test")

        expect(
            fixCmsImagePaths('<img srcset="/sites/a.png 1x, /sites/b.png 2x">')
        ).toBe(
            '<img srcset="https://cms.test/sites/a.png 1x, https://cms.test/sites/b.png 2x">'
        )
    })

    it("leaves absolute URLs and other paths alone", () => {
        vi.stubEnv("NEXT_PUBLIC_LOCAL_API_URL", "https://cms.test")

        const html =
            '<img src="https://other.test/sites/a.png"><a href="/sites/x">x</a>'

        expect(fixCmsImagePaths(html)).toBe(html)
    })
})
