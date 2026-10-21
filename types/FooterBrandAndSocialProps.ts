import { MediaLinkedImageProps } from "./MediaLinkedImageProps"
import { ParagraphSocialMediaProps } from "./ParagraphSocialMediaProps"

export type FooterBrandAndSocialProps = {
    __typename: 'BlockContentFooterBrandAndSocial'
    id: string
    image: MediaLinkedImageProps[]
    body: {
        processed: string
    }
    socialMedia: ParagraphSocialMediaProps[]
}
