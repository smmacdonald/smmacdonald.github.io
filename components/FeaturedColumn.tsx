import FeaturedImage from "./paragraphs/FeaturedImage"
import { fixCmsImagePaths } from "@/src/utils/html"
import { ParagraphCardFeaturedImageTextProps } from "@/types/ParagraphCardFeaturedImageTextProps"

export default function FeaturedColumn(data: ParagraphCardFeaturedImageTextProps) {
    return (
        <div
            id={`pid-${data.sectionId ? data.sectionId : data.id}`}
            className={`${data.columnWidth?.join(' ')} featured-image-text-wrapper paragraph__${data.__typename}`}>
            <div className="featured-content-wrap">
                <FeaturedImage
                    {...data.media} />
                <div
                    className="featured-text-wrap p-4"
                    style={{ backgroundColor: data.bgColor }}>
                    <div
                        dangerouslySetInnerHTML={{
                            __html: fixCmsImagePaths(data.body?.processed),
                        }}
                    />
                </div>
            </div>
        </div>
    )
}