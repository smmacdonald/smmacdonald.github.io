import { describe, expect, it } from "vitest"
import { sitemapToSlugParams } from "./sitemap"

const entries = (...paths: string[]) =>
    paths.map((view_node) => ({ view_node }))

describe("sitemapToSlugParams", () => {
    it("splits paths into slug arrays and trims leading/trailing slashes", () => {
        expect(
            sitemapToSlugParams(
                entries("/about", "/portfolio/neogenomics/", "contact")
            )
        ).toEqual([
            { slug: ["about"] },
            { slug: ["portfolio", "neogenomics"] },
            { slug: ["contact"] },
        ])
    })

    it("skips the homepage because app/page.tsx serves it", () => {
        expect(sitemapToSlugParams(entries("/homepage", "/about"))).toEqual([
            { slug: ["about"] },
        ])
    })

    it("keeps a nested path that merely ends in homepage", () => {
        expect(sitemapToSlugParams(entries("/portfolio/homepage"))).toEqual([
            { slug: ["portfolio", "homepage"] },
        ])
    })

    it("skips 403 and 404 pages anywhere in the path", () => {
        expect(
            sitemapToSlugParams(entries("/403", "/404", "/x/404", "/ok"))
        ).toEqual([{ slug: ["ok"] }])
    })

    it("returns an empty list for an empty sitemap", () => {
        expect(sitemapToSlugParams([])).toEqual([])
    })
})
