import Media from "./Media"
import ImageReveal from "./ImageReveal"
import { ParagraphImageProps } from "@/types/ParagraphImageProps"

export default function ParagraphImage(data: ParagraphImageProps) {
    const animate = data.animate
        ? `animate-image ` + data.animationDirection
        : ""

    return (
        <ImageReveal animateClass={animate}>
            <Media {...data} />
        </ImageReveal>
    )
}
