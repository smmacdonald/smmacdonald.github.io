export type WebformOptions = Record<string, string>

export type WebformWrapperAttributes = {
    class?: string[]
    [key: string]: unknown
}

export type WebformFieldProps = {
    "#title"?: string
    "#type": string
    "#required"?: boolean
    "#default_value"?: string | string[]
    "#test"?: string

    "#options"?: WebformOptions

    "#wrapper_attributes"?: WebformWrapperAttributes

    "#submit__label"?: string

    "#webform"?: string
    "#webform_id"?: string
    "#webform_key"?: string
    "#webform_parent_key"?: string
    "#webform_parent_flexbox"?: boolean
    "#webform_depth"?: number
    "#webform_children"?: string[]
    "#webform_multiple"?: boolean
    "#webform_composite"?: boolean
    "#webform_parents"?: string[]
    "#admin_title"?: string
    "#webform_plugin_id"?: string

    [key: string]: unknown
}

export type WebformProps = Record<string, WebformFieldProps>