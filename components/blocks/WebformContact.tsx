import ContactFormShell from "./ContactFormShell"
import { RenderFormFields } from "@/src/utils/RenderFormFields"
import { getJson } from "@/lib/getJson"
import { WebformProps } from "@/types/WebformProps"

/** Renders the contact form's fields at build time; submitting stays in the browser. */
export default async function WebformContact() {
    const fields = await getJson<WebformProps>(
        `${process.env.NEXT_PUBLIC_LOCAL_API_URL}/webform_rest/contact/fields?_format=json`
    )

    return (
        <ContactFormShell>
            {Object.entries(fields).map(([key, field], index) =>
                RenderFormFields(key, field, index)
            )}
        </ContactFormShell>
    )
}
