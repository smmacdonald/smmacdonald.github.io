import { describe, expect, it } from "vitest"
import { parseMetadata } from "./metadata"
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
