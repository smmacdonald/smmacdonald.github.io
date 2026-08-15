import { ParagraphImageProps } from "./ParagraphImageProps"

export type ParagraphSliderProps = {
    __typename: 'ParagraphSlider'
    id: string
    sectionId: string
    autoplay: boolean
    slidesToScroll: string
    slidesToShow: string
    slide: ParagraphImageProps[]
}
