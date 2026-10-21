import { describe, expect, it, vi } from "vitest"
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
            <header>
                <a className="mobile-menu-toggle" href="#">
                    Open menu
                </a>
            </header>
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

    it("keeps the closed panel out of the tab order and accessibility tree", () => {
        expect(renderOffCanvas()).toHaveAttribute("inert")
    })

    it("becomes interactive when open", async () => {
        const user = userEvent.setup()
        const panel = renderOffCanvas()

        await user.click(screen.getByText("Open menu"))

        expect(panel).not.toHaveAttribute("inert")
    })

    it("exposes the open state on every toggle via aria-expanded", async () => {
        const user = userEvent.setup()
        const panel = renderOffCanvas()
        const toggles = () =>
            Array.from(document.querySelectorAll("a.mobile-menu-toggle"))

        expect(toggles().length).toBeGreaterThan(1)
        toggles().forEach((toggle) => {
            expect(toggle).toHaveAttribute("role", "button")
            expect(toggle).toHaveAttribute("aria-expanded", "false")
            expect(toggle).toHaveAttribute("aria-controls", panel.id)
        })

        await user.click(screen.getByText("Open menu"))

        toggles().forEach((toggle) =>
            expect(toggle).toHaveAttribute("aria-expanded", "true")
        )
    })

    it("closes on Escape and returns focus to the header toggle", async () => {
        const user = userEvent.setup()
        const panel = renderOffCanvas()

        await user.click(screen.getByText("Open menu"))
        expect(panel).toHaveClass("active")

        await user.keyboard("{Escape}")

        expect(panel).not.toHaveClass("active")
        expect(screen.getByText("Open menu")).toHaveFocus()
    })

    it("moves focus into the panel when it opens", async () => {
        const user = userEvent.setup()
        const panel = renderOffCanvas()

        await user.click(screen.getByText("Open menu"))

        expect(panel).toContainElement(document.activeElement as HTMLElement)
    })

    it("closes when a link inside the panel is followed", async () => {
        const user = userEvent.setup()
        const panel = renderOffCanvas()

        await user.click(screen.getByText("Open menu"))
        await user.click(screen.getByRole("link", { name: "About" }))

        expect(panel).not.toHaveClass("active")
    })

    it("toggles with the Space key like a button", async () => {
        const user = userEvent.setup()
        const panel = renderOffCanvas()

        screen.getByText("Open menu").focus()
        await user.keyboard(" ")
        expect(panel).toHaveClass("active")

        await user.keyboard(" ")
        expect(panel).not.toHaveClass("active")
    })

    it("does not follow the toggle's # link", async () => {
        const user = userEvent.setup()
        renderOffCanvas()
        const click = vi.fn((event: MouseEvent) => event.defaultPrevented)
        document.addEventListener("click", click)

        await user.click(screen.getByText("Open menu"))

        document.removeEventListener("click", click)
        expect(click).toHaveReturnedWith(true)
    })
})
