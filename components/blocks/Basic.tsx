import { BasicBlockProps } from "@/types/BasicBlockProps"

export default function Basic(data: BasicBlockProps) {
    return (
        <div
            id={`block-id-${data.id}`}
            className={`block__${data.__typename}`}
            dangerouslySetInnerHTML={{
                __html: data.body.processed,
            }}
        />
    )
}