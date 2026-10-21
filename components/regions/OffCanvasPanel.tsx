"use client"

import { useEffect, useRef, useState } from "react"

const PANEL_ID = "off-canvas-menu"
const TOGGLE = "a.mobile-menu-toggle"

/**
 * The slide-in mobile menu. Menu items titled "mobile menu toggle" come from
 * Drupal as links (`.mobile-menu-toggle`); this adds the button behavior they
 * lack: toggling, `aria-expanded`, Escape to close, and keeping the closed
 * panel out of the tab order.
 */
export default function OffCanvasPanel({
    children,
}: {
    children: React.ReactNode
}) {
    const [isOpen, setIsOpen] = useState(false)
    const panelRef = useRef<HTMLDivElement>(null)
    const hasOpened = useRef(false)

    // Describe the toggle links to assistive technology and keep them in sync.
    useEffect(() => {
        document.querySelectorAll<HTMLElement>(TOGGLE).forEach((toggle) => {
            toggle.setAttribute("role", "button")
            toggle.setAttribute("aria-label", "Menu")
            toggle.setAttribute("aria-controls", PANEL_ID)
            toggle.setAttribute("aria-expanded", String(isOpen))
        })
    }, [isOpen])

    useEffect(() => {
        const handleClick = (event: MouseEvent) => {
            const target = event.target as HTMLElement

            if (target.closest(".mobile-menu-toggle")) {
                // The toggle is an <a href="#">; don't jump to the top of the page.
                event.preventDefault()
                setIsOpen((prevOpen) => !prevOpen)
                return
            }

            // Following a link in the panel leaves it, so close the panel.
            if (target.closest(`#${PANEL_ID} a[href]`)) {
                setIsOpen(false)
            }
        }

        // role="button" links should also respond to Space, like a button.
        const handleSpace = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement

            if (event.key === " " && target.closest(TOGGLE)) {
                event.preventDefault()
                setIsOpen((prevOpen) => !prevOpen)
            }
        }

        document.addEventListener("click", handleClick)
        document.addEventListener("keydown", handleSpace)

        return () => {
            document.removeEventListener("click", handleClick)
            document.removeEventListener("keydown", handleSpace)
        }
    }, [])

    // While open: Escape closes the panel and returns focus to the header toggle.
    useEffect(() => {
        if (!isOpen) return

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsOpen(false)
                document.querySelector<HTMLElement>(`header ${TOGGLE}`)?.focus()
            }
        }

        document.addEventListener("keydown", handleEscape)
        return () => document.removeEventListener("keydown", handleEscape)
    }, [isOpen])

    // Move focus into the panel when it opens (not on first render).
    useEffect(() => {
        if (!isOpen) return
        hasOpened.current = true
        panelRef.current?.querySelector<HTMLElement>(TOGGLE)?.focus()
    }, [isOpen])

    return (
        <div
            ref={panelRef}
            id={PANEL_ID}
            className={`off-canvas${isOpen ? " active" : ""}`}
            inert={!isOpen}
        >
            <div className="off-canvas-wrap">{children}</div>
        </div>
    )
}
