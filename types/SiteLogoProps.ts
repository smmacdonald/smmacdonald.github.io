import { MediaImageProps } from "./MediaImageProps"

export type SiteLogoProps = {
    __typename: "BlockContentSiteLogo"
    id: string
    title: string
    image: MediaImageProps[]
}