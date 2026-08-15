import { gql } from "graphql-tag"

export default gql`
    fragment socialMediaItemFields on SocialMediaItem {
        __typename
        id
        link {
            url
            title
            internal
        }
        socialMediaIcon
    }
`