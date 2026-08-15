import { gql } from "graphql-tag"
import mediaImageFields from "./mediaImage"

export default gql`
    fragment paragraphCardFeaturedImageTextFields on ParagraphCardFeaturedImageText {
        __typename
        id
        bgColor
        sectionId
        columnWidth
        media {
            ...mediaImageFields
        }
        body {
            processed
        }
    }
    ${mediaImageFields}
`