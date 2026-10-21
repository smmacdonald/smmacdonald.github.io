import { gql } from "graphql-tag"

export default gql`
    fragment socialMediaItemFields on ParagraphSocialMediaItem {
        __typename
        id
        link {
            url
            title
        }
        socialMediaIcon
    }
`
