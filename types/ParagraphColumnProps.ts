import { ColumnElementProps } from "./ColumnElementProps"

export type ParagraphColumnProps = {
    __typename: 'ParagraphColumn'
    id: string
    bgColor: string
    sectionId: string
    columnWidth: string[]
    styledBox: boolean
    element: ColumnElementProps[]
}