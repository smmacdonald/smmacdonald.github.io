import { WebformFieldProps } from "@/types/WebformProps"

type Props = {
    name: string
    field: WebformFieldProps
}

export default function FormTextField({ name, field }: Props) {
    return (
        <div className={`mb-3 ${field['#webform_id']} ${field["#wrapper_attributes"]?.class?.join(" ") || ""}`}>
            <label
                htmlFor={name}
                className="form-label"
            >
                {field['#title']}

                {field['#required'] && (
                    <span className="text-danger">
                        {" "}*
                    </span>
                )}
            </label>

            <input
                id={field['#webform_id']}
                name={name}
                type="text"
                className="form-control"
                defaultValue={
                    field["#default_value"] || ""
                }
                required={field['#required']}
            />
        </div>
    )
}