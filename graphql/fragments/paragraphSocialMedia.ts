import { gql } from "graphql-tag"
import socialMediaItemFields from "./socialMediaItem"

export default gql`
    fragment paragraphSocialMediaFields on ParagraphSocialMedia {
        __typename
        ... on ParagraphSocialMedia {
            __typename
            id
            socialMediaElement {
                __typename
                ... on ParagraphSocialMediaItem {
                    ...socialMediaItemFields
                }
            }
        }
    }
    ${socialMediaItemFields}
`