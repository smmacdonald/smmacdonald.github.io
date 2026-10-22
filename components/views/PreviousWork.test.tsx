import { beforeEach, describe, expect, it, vi } from "vitest"
import PreviousWork from "./PreviousWork"
import PreviousWorkFilter from "./PreviousWorkFilter"

const filters = [
    { tid: "5", name: "Web", count: "1" },
    { tid: "6", name: "Branding", count: "1" },
]
const byUrl: Record<string, unknown> = {
    "https://cms.test/rest/projects-filters/archived": filters,
    "https://cms.test/rest/projects/archived": [{ title: "A" }, { title: "B" }],
    "https://cms.test/rest/projects/archived/5": [{ title: "A" }],
    "https://cms.test/rest/projects/archived/6": [{ title: "B" }],
}

describe("PreviousWork (server component)", () => {
    beforeEach(() => {
        vi.stubEnv("NEXT_PUBLIC_LOCAL_API_URL", "https://cms.test")
    })

    it("loads the filters, the full list and each filter's list at build time", async () => {
        const fetchMock = vi.fn((url: string) =>
            Promise.resolve(new Response(JSON.stringify(byUrl[url])))
        )
        vi.stubGlobal("fetch", fetchMock)

        const element = await PreviousWork()

        expect(element.type).toBe(PreviousWorkFilter)
        expect(element.props.filters).toEqual(filters)
        expect(element.props.projectsByTerm).toEqual({
            all: [{ title: "A" }, { title: "B" }],
            "5": [{ title: "A" }],
            "6": [{ title: "B" }],
        })
        expect(fetchMock).toHaveBeenCalledTimes(4)
    })

    it("decodes the HTML entities Drupal's REST views put in text and URLs", async () => {
        const escaped: Record<string, unknown> = {
            "https://cms.test/rest/projects-filters/archived": [
                { tid: "5", name: "Local &amp; Creative", count: "2" },
            ],
            "https://cms.test/rest/projects/archived": [
                {
                    title: "Earth &amp; Sky",
                    field_tags: "Wordpress, R&amp;D",
                    field_slider: "/sites/a.jpg?h=1&amp;itok=2",
                    field_media: "",
                },
            ],
            "https://cms.test/rest/projects/archived/5": [
                {
                    title: "Isaacs &amp; Isaacs",
                    field_tags: "Wordpress",
                    field_slider: "/sites/b.jpg?h=3&amp;itok=4",
                    field_media: "",
                },
            ],
        }
        vi.stubGlobal(
            "fetch",
            vi.fn((url: string) =>
                Promise.resolve(new Response(JSON.stringify(escaped[url])))
            )
        )

        const element = await PreviousWork()

        expect(element.props.filters[0].name).toBe("Local & Creative")
        expect(element.props.projectsByTerm.all[0]).toMatchObject({
            title: "Earth & Sky",
            field_tags: "Wordpress, R&D",
            field_slider: "/sites/a.jpg?h=1&itok=2",
        })
        expect(element.props.projectsByTerm["5"][0].title).toBe(
            "Isaacs & Isaacs"
        )
    })

    it("fails the build when any request fails", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn((url: string) =>
                Promise.resolve(
                    url.endsWith("/archived/6")
                        ? new Response("boom", { status: 500 })
                        : new Response(JSON.stringify(byUrl[url]))
                )
            )
        )

        await expect(PreviousWork()).rejects.toThrow(/archived\/6.*500/)
    })
})
