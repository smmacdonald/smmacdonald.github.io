import { gql } from "graphql-tag"

export default gql`
    fragment metatagFields on MetaTagUnion {
        ... on MetaTagScript {
            content
            attributes {
                integrity
                src
                type
            }
        }
        ... on MetaTagProperty {
            __typename
            attributes {
                content
                property
            }
        }
        ... on MetaTagValue {
            __typename
            attributes {
                content
                name
            }
        }
        ... on MetaTagLink {
            __typename
            tag
            attributes {
                href
                hreflang
                media
                rel
                sizes
                type
            }
        }
    }
`
