import { ImageVariationProps } from "./ImageVariationProps"

export type ImageProps = {
    url: string
    alt: string
    height: number
    width: number
    variations: ImageVariationProps[]
}