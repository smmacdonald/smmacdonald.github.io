"use client"

import { useEffect, useRef, useState } from "react"
import Media from "./Media"
import { ParagraphImageProps } from "@/types/ParagraphImageProps"

export default function ParagraphImage(data: ParagraphImageProps) {
    const ref = useRef<HTMLDivElement>(null)
    const [hasBeenSeen, setHasBeenSeen] = useState(false)

    const direction = data.animationDirection
    const animate = data.animate ? `animate-image ` + direction : ""

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
            className={`image-container ${animate} ${hasBeenSeen ? "animated" : ""}`}
        >
            <Media {...data} />
        </div>
    )
}
