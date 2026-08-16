import LinkedImage from "../paragraphs/LinkedImage"
import ParagraphSocialMedia from "../paragraphs/ParagraphSocialMedia"
import { FooterBrandAndSocialProps } from "@/types/FooterBrandAndSocialProps"

export default function FooterBrandAndSocial(data: FooterBrandAndSocialProps) {
    return (
        <div
            id={`block-id-${data.id}`}
            className={`footer-brand-social-wrapper block__${data.__typename}`}>
            <div className="footer-logo-wrapper mb-4">
                <LinkedImage {...data.image[0]} />
            </div>
            <div className="footer-about-wrapper">
                <div
                    key={data.id}
                    dangerouslySetInnerHTML={{
                        __html: data.body.processed,
                    }}
                />
            </div>
            <div className="footer-social-wrapper">
                <ParagraphSocialMedia
                    {...data.socialMedia[0]} />
            </div>
        </div>
    )
}