import { gql } from "graphql-tag"
import mediaImageFields from "../fragments/mediaImage"
import mediaLinkedImageFields from "../fragments/mediaLinkedImage"
import paragraphSocialMediaFields from "../fragments/paragraphSocialMedia"

export default gql`
    query GetBlock($id: ID!) {
        blockContent(id: $id) {
            __typename
            ... on BlockContentSiteLogo {
                __typename
                id
                title
                image {
                    ...mediaImageFields
                }
            }
            ... on BlockContentFooterBrandAndSocial {
                __typename
                id
                image {
                    ... on MediaLinkedImage {
                        ...mediaLinkedImageFields
                    }
                }
                body {
                    processed
                }
                socialMedia {
                    __typename
                    ... on ParagraphSocialMedia {
                        ...paragraphSocialMediaFields
                    }
                }
            }
            ... on BlockContentBasic {
                __typename
                id
                title
                body {
                    processed
                }
            }
        }
    }
    ${mediaImageFields}
    ${mediaLinkedImageFields}
    ${paragraphSocialMediaFields}
`