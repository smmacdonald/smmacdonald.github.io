import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { withHomeBreadcrumb } from "./breadcrumbs"

describe("withHomeBreadcrumb", () => {
    beforeEach(() => {
        vi.spyOn(console, "warn").mockImplementation(() => {})
    })
    afterEach(() => vi.restoreAllMocks())

    it("leaves a trail that already starts with Home untouched, without warning", () => {
        const trail = [
            { url: "/", title: "Home" },
            { url: "/portfolio", title: "Portfolio" },
        ]

        expect(withHomeBreadcrumb(trail, "/portfolio/x")).toBe(trail)
        expect(console.warn).not.toHaveBeenCalled()
    })

    it("adds Home to an empty trail and warns with the page path", () => {
        expect(withHomeBreadcrumb([], "/about")).toEqual([
            { url: "/", title: "Home" },
        ])
        expect(console.warn).toHaveBeenCalledWith(
            expect.stringContaining("/about")
        )
    })

    it("puts Home in front of the intermediate crumbs Drupal did return", () => {
        expect(
            withHomeBreadcrumb(
                [{ url: "/portfolio", title: "Portfolio" }],
                "/portfolio/x"
            )
        ).toEqual([
            { url: "/", title: "Home" },
            { url: "/portfolio", title: "Portfolio" },
        ])
    })
})
