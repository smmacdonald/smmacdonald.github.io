import { ParagraphSectionProps } from "./ParagraphSectionProps"
import { MetaTagProps } from "./MetaTagProps"

export type PageProps = {
    id: string
    title: string
    pageHero: ParagraphSectionProps
    content: ParagraphSectionProps[]
    metatag: MetaTagProps[]
}