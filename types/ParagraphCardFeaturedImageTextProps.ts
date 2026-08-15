import { MediaImageProps } from "./MediaImageProps"

export type ParagraphCardFeaturedImageTextProps = {
    __typename: 'ParagraphCardFeaturedImageText'
    id: string
    bgColor: string
    sectionId: string
    columnWidth: string[]
    media: MediaImageProps
    body: {
        processed: string
    }
}