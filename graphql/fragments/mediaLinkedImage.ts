import { gql } from "graphql-tag"

export default gql`
    fragment mediaLinkedImageFields on MediaLinkedImage {
        __typename
        id
        mediaImage1 {
            url
            alt
            height
            width
        }
        link {
            url
        }
    }
`