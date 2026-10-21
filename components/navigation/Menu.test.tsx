import { describe, expect, it } from "vitest"
import { render, screen, within } from "@testing-library/react"
import Menu from "./Menu"
import type { MenuProps } from "@/types/MenuProps"

const data: MenuProps = {
    name: "Main navigation",
    items: [
        { url: "/about", title: "About Me", internal: true, children: [] },
        {
            url: "/portfolio",
            title: "Portfolio",
            internal: true,
            children: [
                {
                    url: "/portfolio/neogenomics",
                    title: "NeoGenomics",
                    internal: true,
                    children: [],
                },
            ],
        },
        { url: "", title: "No Link", internal: false, children: [] },
    ],
}

describe("Menu", () => {
    it("renders each item as a link with its URL", () => {
        render(<Menu data={data} />)

        expect(screen.getByRole("link", { name: "About Me" })).toHaveAttribute(
            "href",
            "/about"
        )
        expect(
            screen.getByRole("link", { name: "NeoGenomics" })
        ).toHaveAttribute("href", "/portfolio/neogenomics")
    })

    it("nests children inside their parent item", () => {
        render(<Menu data={data} />)

        const parent = screen
            .getByRole("link", { name: "Portfolio" })
            .closest("li") as HTMLElement

        expect(
            within(parent).getByRole("link", { name: "NeoGenomics" })
        ).toBeInTheDocument()
    })

    it("falls back to # for items without a URL", () => {
        render(<Menu data={data} />)

        expect(screen.getByRole("link", { name: "No Link" })).toHaveAttribute(
            "href",
            "#"
        )
    })

    it("derives a CSS class from the item title", () => {
        render(<Menu data={data} />)

        expect(screen.getByRole("link", { name: "About Me" })).toHaveClass(
            "about-me"
        )
    })
})
