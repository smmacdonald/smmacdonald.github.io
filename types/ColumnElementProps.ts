import { ParagraphImageProps } from "@/types/ParagraphImageProps"
import { ParagraphTextProps } from "@/types/ParagraphTextProps"
import { ParagraphSliderProps } from "@/types/ParagraphSliderProps"
import { ParagraphCardFeaturedImageTextProps } from "./ParagraphCardFeaturedImageTextProps"

export type ColumnElementProps =
    | ParagraphTextProps
    | ParagraphSliderProps
    | ParagraphImageProps
    | ParagraphCardFeaturedImageTextProps