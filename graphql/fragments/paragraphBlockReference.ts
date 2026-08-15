import { gql } from "graphql-tag"
import mediaBackgroundImageFields from "./mediaBackgroundImage"

export default gql`
    fragment paragraphBlockReferenceFields on ParagraphBlockReference {
        ... on ParagraphBlockReference {
            __typename
            id
            bgColor
            bgImage {
                ...mediaBackgroundImageFields
            }
            bgImagePosition
            bgImageRepeat
            bgImageSize
            fullWidth
            margin
            padding
            sectionId
            blockReference {
                ... on BlockPlugin {
                    id
                    render
                }
            }
        }
    }
    ${mediaBackgroundImageFields}
`