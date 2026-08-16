import { fixCmsImagePaths } from "@/src/utils/html"
import { ParagraphTextProps } from "@/types/ParagraphTextProps"

export default function Text(data: ParagraphTextProps) {
    return (
        <div
            className=
            {`text-wrapper 
          ${data.verticalAlign ?
                    "d-flex justify-content-center h-100 flex-column"
                    : ""}
            paragraph__${data.__typename}`}>
            <div
                dangerouslySetInnerHTML={{
                    __html: fixCmsImagePaths(data.body?.processed),
                }}
            />
        </div>
    )
}