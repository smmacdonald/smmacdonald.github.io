import SocialMediaElement from "./SocialMediaElement"
import { ParagraphSocialMediaProps } from "@/types/ParagraphSocialMediaProps"

export default function ParagraphSocialMedia(data: ParagraphSocialMediaProps) {
    return (
        <ul className={`p-0 m-0 paragraph__${data.__typename}`}>
            {data?.socialMediaElement && data.socialMediaElement.map((item, index: number) => (
                <li
                    key={index}
                    className="list-unstyled">
                    <SocialMediaElement
                        {...item} />
                </li>
            ))}
        </ul>
    )
}