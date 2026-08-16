import Link from "next/link"
import { MediaLinkedImageProps } from "@/types/MediaLinkedImageProps"
import Image from "next/image"

export default function LinkedImage(data: MediaLinkedImageProps) {
    return (
        <div className={`image-wrapper paragraph__${data.__typename}`}>
            <Link href={data.link.url}>
                <Image
                    src={data.mediaImage1.url}
                    height={data.mediaImage1.height}
                    width={data.mediaImage1.width}
                    alt={data.mediaImage1.alt}
                    unoptimized />
            </Link>
        </div>
    )
}