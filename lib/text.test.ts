import { describe, expect, it } from "vitest"
import { decodeHtmlEntities, decodeStringFields } from "./text"

describe("decodeHtmlEntities", () => {
    it("decodes the ampersand that Drupal's REST views escape", () => {
        expect(decodeHtmlEntities("Earth &amp; Sky")).toBe("Earth & Sky")
        expect(decodeHtmlEntities("Isaacs &amp; Isaacs")).toBe(
            "Isaacs & Isaacs"
        )
    })

    it("decodes quotes and apostrophes in named, decimal and hex form", () => {
        expect(
            decodeHtmlEntities("&quot;Hi&quot; &#039;there&#039; &#x27;x&#x27;")
        ).toBe("\"Hi\" 'there' 'x'")
    })

    it("decodes typographic and symbol entities", () => {
        expect(
            decodeHtmlEntities("A&ndash;B&mdash;C&hellip; &copy; &eacute;")
        ).toBe("A–B—C… © é")
    })

    it("decodes the escapes inside an image URL's query string", () => {
        expect(
            decodeHtmlEntities(
                "/sites/default/files/a.jpg?h=9b0a&amp;itok=0eYU6"
            )
        ).toBe("/sites/default/files/a.jpg?h=9b0a&itok=0eYU6")
    })

    it("decodes only once, so an escaped escape stays visible as an entity", () => {
        expect(decodeHtmlEntities("&amp;amp;")).toBe("&amp;")
    })

    it("leaves unknown entities, bare ampersands and plain text alone", () => {
        expect(decodeHtmlEntities("&notarealentity; AT&T R&D")).toBe(
            "&notarealentity; AT&T R&D"
        )
        expect(decodeHtmlEntities("Plain title")).toBe("Plain title")
        expect(decodeHtmlEntities("")).toBe("")
    })

    it("ignores out-of-range numeric entities", () => {
        expect(decodeHtmlEntities("&#0; &#99999999999;")).toBe(
            "&#0; &#99999999999;"
        )
    })
})

describe("decodeStringFields", () => {
    it("decodes every string field and keeps other values", () => {
        expect(
            decodeStringFields({
                title: "Earth &amp; Sky",
                count: 3,
                tags: "Drupal, R&amp;D",
            })
        ).toEqual({ title: "Earth & Sky", count: 3, tags: "Drupal, R&D" })
    })
})
