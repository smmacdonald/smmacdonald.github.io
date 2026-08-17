import { WebformFieldProps } from "@/types/WebformProps"

type Props = {
    name: string
    field: WebformFieldProps
}

export default function FormActions({ name, field }: Props) {
    return (
        <div className="mt-4">
            <button
                type={name}
                className="button transparent"
            >
                {field["#submit__label"] || "Submit"}
            </button>
        </div>
    )
}