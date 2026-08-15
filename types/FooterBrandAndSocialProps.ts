import { MediaLinkedImageProps } from "./MediaLinkedImageProps"
import { ParagraphSocialMediaItemProps } from "./ParagraphSocialMediaItemProps"
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
