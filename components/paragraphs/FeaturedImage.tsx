import { MediaImageProps } from "@/types/MediaImageProps"
import Image from "next/image"

export default function FeaturedImage(data: MediaImageProps) {
    return (
        <div className="image-wrapper">
            <Image
                src={data.mediaImage.variations[0].url}
                height={400}
                width={600}
                alt={data.mediaImage.alt}
                unoptimized />
        </div>
    )
}