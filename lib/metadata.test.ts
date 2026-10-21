import { describe, expect, it, vi } from "vitest"
import { parseMetadata, withHomeCanonical } from "./metadata"
import type { MetaTagProps } from "@/types/MetaTagProps"

const value = (name: string, content: string): MetaTagProps => ({
    __typename: "MetaTagValue",
    attributes: { name, content },
})
const property = (prop: string, content: string): MetaTagProps => ({
    __typename: "MetaTagProperty",
    attributes: { property: prop, content },
})
const link = (rel: string, href: string): MetaTagProps => ({
    __typename: "MetaTagLink",
    attributes: { rel, href },
})

describe("parseMetadata", () => {
    it("returns an empty object when there are no tags", () => {
        expect(parseMetadata([])).toEqual({})
    })

    it("maps title, description, robots and canonical", () => {
        const result = parseMetadata([
            value("title", "About | Shawn"),
            value("description", "About me"),
            value("robots", "index, follow"),
            link("canonical", "https://example.com/about"),
        ])

        expect(result.title).toBe("About | Shawn")
        expect(result.description).toBe("About me")
        expect(result.robots).toBe("index, follow")
        expect(result.alternates).toEqual({
            canonical: "https://example.com/about",
        })
    })

    it("builds openGraph only from the og tags that exist", () => {
        const result = parseMetadata([
            property("og:title", "OG title"),
            property("og:image", "https://example.com/og.png"),
            property("og:type", "website"),
        ])

        expect(result.openGraph).toEqual({
            title: "OG title",
            images: ["https://example.com/og.png"],
            type: "website",
        })
    })

    it("builds twitter metadata and omits it when no twitter tags exist", () => {
        expect(parseMetadata([value("title", "x")]).twitter).toBeUndefined()

        const result = parseMetadata([
            value("twitter:card", "summary_large_image"),
            value("twitter:site", "@shawn"),
        ])

        expect(result.twitter).toEqual({
            card: "summary_large_image",
            site: "@shawn",
        })
    })

    it("ignores tags with empty content", () => {
        const result = parseMetadata([value("title", ""), value("robots", "")])

        expect(result.title).toBeUndefined()
        expect(result.robots).toBeUndefined()
    })

    it("does not read a link tag's href as a meta value", () => {
        const result = parseMetadata([link("canonical", "https://x.test")])

        expect(result.title).toBeUndefined()
        expect(result.alternates?.canonical).toBe("https://x.test")
    })
})

describe("parseMetadata share image", () => {
    const IMAGE = "https://cms.test/sites/default/files/thumb.jpg"

    it("uses Drupal's legacy image_src link as the Open Graph and Twitter image", () => {
        const result = parseMetadata([
            value("title", "Home | portfolio"),
            value("description", "A developer"),
            link("image_src", IMAGE),
        ])

        expect(result.openGraph).toEqual({
            title: "Home | portfolio",
            description: "A developer",
            images: [IMAGE],
        })
        expect(result.twitter).toEqual({
            card: "summary_large_image",
            title: "Home | portfolio",
            description: "A developer",
            images: [IMAGE],
        })
    })

    it("prefers an explicit og:image and does not invent a Twitter card", () => {
        const result = parseMetadata([
            property("og:image", "https://cms.test/explicit.png"),
            link("image_src", IMAGE),
        ])

        expect(result.openGraph?.images).toEqual([
            "https://cms.test/explicit.png",
        ])
        expect(result.twitter).toBeUndefined()
    })

    it("keeps an explicit twitter:image and card when image_src is also present", () => {
        const result = parseMetadata([
            value("twitter:card", "summary"),
            value("twitter:image", "https://cms.test/tw.png"),
            link("image_src", IMAGE),
        ])

        expect((result.twitter as { card?: string }).card).toBe("summary")
        expect(result.twitter?.images).toEqual(["https://cms.test/tw.png"])
    })

    it("adds nothing when there is no image", () => {
        const result = parseMetadata([value("title", "x")])

        expect(result.openGraph).toBeUndefined()
        expect(result.twitter).toBeUndefined()
    })

    it("resolves a relative image URL against the Drupal host, not this site", () => {
        vi.stubEnv("NEXT_PUBLIC_LOCAL_API_URL", "https://cms.test")

        const result = parseMetadata([
            link("image_src", "/sites/default/files/thumb.jpg"),
        ])

        expect(result.openGraph?.images).toEqual([
            "https://cms.test/sites/default/files/thumb.jpg",
        ])
    })
})

describe("withHomeCanonical", () => {
    it("points the canonical and og:url at / instead of /homepage", () => {
        const result = withHomeCanonical({
            alternates: { canonical: "https://cms.test/homepage" },
            openGraph: { url: "https://cms.test/homepage", title: "Home" },
        })

        expect(result.alternates?.canonical).toBe("https://cms.test/")
        expect(result.openGraph?.url).toBe("https://cms.test/")
        expect(result.openGraph?.title).toBe("Home")
    })

    it("also handles a trailing slash", () => {
        expect(
            withHomeCanonical({
                alternates: { canonical: "https://cms.test/homepage/" },
            }).alternates?.canonical
        ).toBe("https://cms.test/")
    })

    it("leaves other URLs and missing values alone", () => {
        expect(
            withHomeCanonical({
                alternates: { canonical: "https://cms.test/about" },
            }).alternates?.canonical
        ).toBe("https://cms.test/about")
        expect(withHomeCanonical({ title: "x" })).toEqual({ title: "x" })
    })
})
