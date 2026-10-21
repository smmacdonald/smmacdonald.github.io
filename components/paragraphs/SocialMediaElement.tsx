import Link from "next/link"
import { externalLinkLabel } from "@/lib/externalLink"
import { ParagraphSocialMediaItemProps } from "@/types/ParagraphSocialMediaItemProps"

export default function SocialMediaElement(
    data: ParagraphSocialMediaItemProps
) {
    const label = externalLinkLabel(data.link.url, data.link.title)

    return (
        <Link
            href={data.link.url}
            title={data.link.title}
            aria-label={`${label} (opens in a new tab)`}
            className={`image-wrapper paragraph__${data.__typename} ${data.socialMediaIcon}`}
            target="_blank"
            rel="noopener noreferrer"
        >
            <span className="social-media-title">{data.link.title}</span>
        </Link>
    )
}
