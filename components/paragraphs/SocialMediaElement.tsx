import Link from "next/link"
import { ParagraphSocialMediaItemProps } from "@/types/ParagraphSocialMediaItemProps"

export default function SocialMediaElement(data: ParagraphSocialMediaItemProps) {
    return (
        <Link
            href={data.link.url}
            title={data.link.title}
            tabIndex={0}
            className={`image-wrapper paragraph__${data.__typename} ${data.socialMediaIcon}`}
            target="_blank"
        >
            <span className="social-media-title">{data.link.title}</span>
        </Link>
    )
}