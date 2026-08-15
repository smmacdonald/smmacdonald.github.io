export type MetaTagProps = {
    __typename:
    | "MetaTagValue"
    | "MetaTagProperty"
    | "MetaTagLink"
    tag?: string | null
    attributes: {
        name?: string | null
        property?: string | null
        content?: string | null
        rel?: string | null
        href?: string | null
        hreflang?: string | null
        media?: string | null
        sizes?: string | null
        type?: string | null
    }
}