"use client"

import { useEffect, useRef, useState } from "react"

/** Adds the `animated` class the first time the wrapped image scrolls into view. */
export default function ImageReveal({
    animateClass,
    children,
}: {
    animateClass: string
    children: React.ReactNode
}) {
    const ref = useRef<HTMLDivElement>(null)
    const [hasBeenSeen, setHasBeenSeen] = useState(false)

    useEffect(() => {
        // If it already triggered, don't set up a new observer
        if (hasBeenSeen) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setHasBeenSeen(true)

                    // Stop observing immediately after it enters the viewport
                    if (ref.current) {
                        observer.unobserve(ref.current)
                    }
                }
            },
            { threshold: 0.5 }
        )

        const node = ref.current

        if (node) {
            observer.observe(node)
        }

        return () => {
            if (node) {
                observer.unobserve(node)
            }
        }
    }, [hasBeenSeen])

    return (
        <div
            ref={ref}
            className={`image-container ${animateClass} ${hasBeenSeen ? "animated" : ""}`}
        >
            {children}
        </div>
    )
}
