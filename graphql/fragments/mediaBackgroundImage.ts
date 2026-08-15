import { gql } from "graphql-tag"

export default gql`
    fragment mediaBackgroundImageFields on MediaBackgroundImage {
        __typename
        id
        mediaImage2 {
            url
        }
    }
`