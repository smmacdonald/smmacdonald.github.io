import { gql } from "graphql-tag"

export default gql`
    fragment mediaImageFields on MediaImage {
        __typename
        id
        mediaImage {
            url
            alt
            height
            width
            variations(styles: FEATURED_IMAGE) {
                url
            }
        }
    }
`