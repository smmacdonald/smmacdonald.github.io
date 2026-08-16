import { fixCmsImagePaths } from "@/src/utils/html"
import PreviousWork from "./views/PreviousWork"
import FeaturedWork from "./views/FeaturedWork"
import { ParagraphBlockReferenceProps } from "@/types/ParagraphBlockReferenceProps"

export default function BlockReference(data: ParagraphBlockReferenceProps) {
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
            className={'section-container ' + data.padding}
            style={style}
        >
            {data.bgColor ? (
                <div className="color-overlay" style={{ backgroundColor: data.bgColor }} />
            ) : null}
            <div className="container">
                <div className="row">
                    {(() => {
                        switch (data.blockReference.id) {
                            case "views_block:portfolio-featured":
                                return (
                                    <FeaturedWork />
                                )

                            case "views_block:portfolio-archived":
                                return (
                                    <PreviousWork />
                                )

                            default:
                                return (
                                    <div
                                        dangerouslySetInnerHTML={{
                                            __html: fixCmsImagePaths(data.blockReference.render),
                                        }}
                                    />
                                )
                        }
                    })()}
                </div>
            </div>
        </section>
    )
}