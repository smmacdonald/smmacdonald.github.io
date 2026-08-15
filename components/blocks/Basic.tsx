import { BasicBlockProps } from "@/types/BasicBlockProps"

export default function Basic(data: BasicBlockProps) {
    return (
        <div
            key={data.id}
            dangerouslySetInnerHTML={{
                __html: data.body.processed,
            }}
        />
    )
}