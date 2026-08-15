import { ParagraphColumnProps } from "./ParagraphColumnProps"
import { MediaBackgroundImageProps } from "./MediaBackgroundImageProps"
import { ParagraphCardFeaturedImageTextProps } from "./ParagraphCardFeaturedImageTextProps"

export type ParagraphSectionProps = {
    __typename: 'ParagraphSection',
    id: string
    bgColor: string
    bgImage: MediaBackgroundImageProps
    bgImagePosition: string
    bgImageRepeat: string
    bgImageSize: string
    centerContent: boolean
    fullWidth: boolean
    margin: string
    padding: string
    sectionId: string
    content: ParagraphSectionContentProps[]
}

type ParagraphSectionContentProps = | ParagraphColumnProps | ParagraphCardFeaturedImageTextProps