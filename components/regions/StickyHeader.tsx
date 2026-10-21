"use client"

import { useEffect, useState } from "react"

/** Adds the `sticky` class once the page has scrolled. Content is rendered on the server. */
export default function StickyHeader({
    children,
}: {
    children: React.ReactNode
}) {
    const [isScrolled, setIsScrolled] = useState(false)

    useEffect(() => {
        const checkScroll = () => {
            if (window.scrollY > 10) {
                setIsScrolled(true)
            } else {
                setIsScrolled(false)
            }
        }
        checkScroll()

        window.addEventListener("scroll", checkScroll)
        return () => window.removeEventListener("scroll", checkScroll)
    }, [])

    return (
        <header className={`site-header ${isScrolled ? "sticky" : ""}`}>
            {children}
        </header>
    )
}
