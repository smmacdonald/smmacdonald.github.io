import { beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import FeaturedWork from "./FeaturedWork"

vi.mock("../PortfolioSlider", () => ({
    default: ({ data }: { data: string }) => (
        <div data-testid="slider">{data}</div>
    ),
}))

describe("FeaturedWork (server component)", () => {
    beforeEach(() => {
        vi.stubEnv("NEXT_PUBLIC_LOCAL_API_URL", "https://cms.test")
    })

    it("shows titles and tags as text, decoding the entities Drupal escapes", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn(() =>
                Promise.resolve(
                    new Response(
                        JSON.stringify([
                            {
                                field_filter: "1",
                                title: "Earth &amp; Sky",
                                field_tags: "Wordpress, R&amp;D",
                                field_slider: "/sites/a.jpg?h=1&amp;itok=2",
                                url: "/portfolio/earth-sky",
                            },
                        ])
                    )
                )
            )
        )

        render(await FeaturedWork())

        expect(screen.getByText("Earth & Sky")).toBeInTheDocument()
        expect(screen.getByText("R&D")).toBeInTheDocument()
        expect(screen.getByAltText("Earth & Sky")).toHaveAttribute(
            "src",
            "https://cms.test/sites/a.jpg?h=1&itok=2"
        )
        expect(screen.queryByText(/&amp;/)).not.toBeInTheDocument()
    })
})
