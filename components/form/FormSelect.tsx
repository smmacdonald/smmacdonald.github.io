import { WebformFieldProps } from "@/types/WebformProps"

type Props = {
    name: string
    field: WebformFieldProps
}

export default function FormSelect({ name, field }: Props) {
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

            <select
                id={field['#webform_id']}
                name={name}
                className="form-select"
                defaultValue={
                    field["#default_value"] || ""
                }
                required={field['#required']}
            >
                <option value="">
                    - Select -
                </option>

                {Object.entries(
                    field["#options"] || {}
                ).map(
                    ([
                        optionValue,
                        optionLabel,
                    ]) => (
                        <option
                            key={optionValue}
                            value={optionValue}
                        >
                            {optionLabel}
                        </option>
                    )
                )}
            </select>
        </div>
    )
}