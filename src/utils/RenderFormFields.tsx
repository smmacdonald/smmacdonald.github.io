import { WebformFieldProps } from "@/types/WebformProps"
import FormTextField from "@/components/form/FormTextField"
import FormEmail from "@/components/form/FormEmail"
import FormTextArea from "@/components/form/FormTextArea"
import FormActions from "@/components/form/FormActions"
import FormSelect from "@/components/form/FormSelect"

export function RenderFormFields(key: string, field: WebformFieldProps, index: number) {
    console.log(key)
    switch (field["#type"]) {
        case "textfield":
            return (
                <FormTextField
                    key={index}
                    name={key}
                    field={field} />
            )

        case "email":
            return (
                <FormEmail
                    key={index}
                    name={key}
                    field={field} />
            )

        case "textarea":
            return (
                <FormTextArea
                    key={index}
                    name={key}
                    field={field} />
            )

        case "select":
            return (
                <FormSelect
                    key={index}
                    name={key}
                    field={field} />
            )

        case "webform_actions":
            return (
                <FormActions
                    key={index}
                    name={key}
                    field={field} />
            )

        default:
            return null
    }
}