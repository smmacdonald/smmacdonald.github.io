export type MetaTagProps = {
    __typename:
    | "MetaTagValue"
    | "MetaTagProperty"
    | "MetaTagLink"
    tag?: string
    attributes: {
        name?: string
        property?: string
        content?: string
        rel?: string
        href?: string
        hreflang?: string
        media?: string
        sizes?: string
        type?: string
    }
}