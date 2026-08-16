import Link from "next/link"
// import Image from "../paragraphs/Image"
import Image from "next/image"
import { SiteLogoProps } from "@/types/SiteLogoProps"

export default function SiteLogo(data: SiteLogoProps) {
    return (
        <div className={`site-logo block__${data.__typename}`}>
            <Link href="/">
                <Image
                    src={data.image[0].mediaImage.url}
                    height={data.image[0].mediaImage.height}
                    width={data.image[0].mediaImage.width}
                    alt={data.image[0].mediaImage.alt}
                    unoptimized />
            </Link>
        </div>
    )
}