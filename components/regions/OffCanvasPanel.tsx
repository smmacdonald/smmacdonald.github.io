"use client"

import { useEffect, useState } from "react"

/** Opens and closes the off-canvas panel when a `.mobile-menu-toggle` is clicked. */
export default function OffCanvasPanel({
    children,
}: {
    children: React.ReactNode
}) {
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        const handleClick = (event: MouseEvent) => {
            const target = event.target as HTMLElement
            if (target.closest(".mobile-menu-toggle")) {
                setIsOpen((prevOpen) => !prevOpen)
            }
        }

        document.addEventListener("click", handleClick)

        return () => {
            document.removeEventListener("click", handleClick)
        }
    }, [])

    return (
        <div className={`off-canvas${isOpen ? " active" : ""}`}>
            <div className="off-canvas-wrap">{children}</div>
        </div>
    )
}
