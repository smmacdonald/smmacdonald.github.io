import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import OffCanvas from "./OffCanvas"
import type { SiteLogoProps } from "@/types/SiteLogoProps"
import type { MenuProps } from "@/types/MenuProps"

const logo: SiteLogoProps = {
    __typename: "BlockContentSiteLogo",
    id: "1",
    title: "Logo",
    image: [
        {
            __typename: "MediaImage",
            id: "m1",
            mediaImage: {
                url: "https://cms.test/logo.png",
                alt: "Site logo",
                height: 40,
                width: 120,
                variations: [],
            },
        },
    ],
}
const mainMenu: MenuProps = {
    name: "Main",
    items: [{ url: "/about", title: "About", internal: true, children: [] }],
}
// The toggle is a menu link whose class comes from its title.
const toggleMenu: MenuProps = {
    name: "Mobile menu toggle",
    items: [
        {
            url: "#",
            title: "Mobile menu toggle",
            internal: false,
            children: [],
        },
    ],
}

function renderOffCanvas() {
    const view = render(
        <>
            <a className="mobile-menu-toggle" href="#">
                Open menu
            </a>
            <OffCanvas
                logo={logo}
                mainMenu={mainMenu}
                mobileToggle={toggleMenu}
            />
        </>
    )
    return view.container.querySelector(".off-canvas") as HTMLElement
}

describe("OffCanvas", () => {
    it("starts closed", () => {
        expect(renderOffCanvas()).not.toHaveClass("active")
    })

    it("toggles open and closed when a .mobile-menu-toggle element is clicked", async () => {
        const user = userEvent.setup()
        const panel = renderOffCanvas()

        await user.click(screen.getByText("Open menu"))
        expect(panel).toHaveClass("active")

        await user.click(screen.getByText("Open menu"))
        expect(panel).not.toHaveClass("active")
    })

    it("ignores clicks elsewhere on the page", async () => {
        const user = userEvent.setup()
        const panel = renderOffCanvas()

        await user.click(document.body)
        expect(panel).not.toHaveClass("active")
    })

    it("contains the main navigation links", () => {
        renderOffCanvas()

        expect(screen.getByRole("link", { name: "About" })).toHaveAttribute(
            "href",
            "/about"
        )
    })

    // Known accessibility gaps (see the audit): the panel does not close on
    // Escape and the toggle exposes no aria-expanded state.
    it.todo("closes when Escape is pressed")
    it.todo("exposes the open state to assistive technology via aria-expanded")
})
