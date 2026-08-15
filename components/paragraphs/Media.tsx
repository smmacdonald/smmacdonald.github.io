import { ParagraphImageProps } from "@/types/ParagraphImageProps"
import Image from "next/image"

export default function Media(data: ParagraphImageProps) {
    return (
        <div className="image-wrapper">
            <Image
                src={data.media.mediaImage.url}
                height={data.media.mediaImage.height}
                width={data.media.mediaImage.width}
                alt={data.media.mediaImage.alt}
                unoptimized />
        </div>
    )
}