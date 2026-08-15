import { MediaImageProps } from "./MediaImageProps"

export type ParagraphImageProps = {
    __typename: 'ParagraphImage'
    id: string
    animate: boolean
    animationDirection: string
    media: MediaImageProps
}