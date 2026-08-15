import Text from "./paragraphs/Text"
import ParagraphImage from "./paragraphs/ParagraphImage"
import ParagraphSlider from "./paragraphs/ParagraphSlider"
import { ParagraphColumnProps } from "@/types/ParagraphColumnProps"

export default function Column(data: ParagraphColumnProps) {
    const styledBox = data.styledBox
        ? "column-wrapper styled-box"
        : "column-wrapper"

    return (
        <div
            key={`column-${data.id}`}
            id={`pid-${data.id}`}
            className={`${styledBox} ${data.columnWidth?.join(" ")}`}
        >
            <div
                className="column-content-wrapper"
                style={
                    data.bgColor
                        ? { backgroundColor: data.bgColor }
                        : undefined
                }
            >
                {data.element.map((element, index: number) => {
                    switch (element.__typename) {
                        case "ParagraphSlider":
                            return (
                                <ParagraphSlider
                                    key={index}
                                    {...element} />
                            )

                        case "ParagraphImage":
                            return (
                                <ParagraphImage
                                    key={index}
                                    {...element} />
                            )

                        case "ParagraphText":
                            return (
                                <Text
                                    key={index}
                                    {...element} />
                            )

                        default:
                            return null
                    }
                })}
            </div>
        </div>
    )
}