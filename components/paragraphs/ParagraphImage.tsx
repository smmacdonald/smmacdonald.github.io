import Media from "./Media"
import { ParagraphImageProps } from "@/types/ParagraphImageProps"

export default function ParagraphImage(data: ParagraphImageProps) {
    const direction = data.animationDirection
    const animate = data.animate ?
        `animate-me ` + direction
        : ""
    return (
        <div className={`image-container ${animate}`}>
            <Media {...data} />
        </div>
    )
}