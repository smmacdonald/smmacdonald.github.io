import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import Breadcrumbs from "./Breadcrumbs"

describe("Breadcrumbs", () => {
    it("links the trail and shows the current page as plain text", () => {
        render(
            <Breadcrumbs
                data={[
                    { url: "/", title: "Home" },
                    { url: "/portfolio", title: "Portfolio" },
                ]}
                current="NeoGenomics"
            />
        )

        const items = screen.getAllByRole("listitem")
        expect(items.map((item) => item.textContent)).toEqual([
            "Home",
            "Portfolio",
            "NeoGenomics",
        ])
        expect(screen.getByRole("link", { name: "Portfolio" })).toHaveAttribute(
            "href",
            "/portfolio"
        )
        expect(
            screen.queryByRole("link", { name: "NeoGenomics" })
        ).not.toBeInTheDocument()
    })
})
