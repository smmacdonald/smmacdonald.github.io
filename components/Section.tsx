import Column from "./Column"
import FeaturedColumn from "./FeaturedColumn"
import { ParagraphSectionProps } from "@/types/ParagraphSectionProps"

export default function Section(data: ParagraphSectionProps) {
    const hasBgImage = data.bgImage?.mediaImage2?.url
    const style = hasBgImage
        ? {
            backgroundImage: `url(${data.bgImage.mediaImage2.url})`,
            backgroundSize: data.bgImageSize,
            backgroundPosition: data.bgImagePosition,
            backgroundRepeat: data.bgImageRepeat,
        }
        : {}

    return (
        <section
            id={data.sectionId ? `pid-` + data.sectionId : `pid-` + data.id}
            className={"section-container " + data.padding}
            style={style}
        >
            {data.bgColor ? (
                <div className="color-overlay" style={{ backgroundColor: data.bgColor }} />
            ) : null}
            <div className="container">
                <div className="row">

                    {data.content?.map((column, index: number) => {
                        switch (column.__typename) {
                            case "ParagraphColumn":
                                return (
                                    <Column
                                        key={index}
                                        {...column} />
                                )

                            case "ParagraphCardFeaturedImageText":
                                return (
                                    <FeaturedColumn
                                        key={index}
                                        {...column} />
                                )

                            default:
                                return null
                        }
                    })}
                </div>
            </div>
        </section>
    )
}