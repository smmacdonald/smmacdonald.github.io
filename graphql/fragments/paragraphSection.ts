import { gql } from "graphql-tag"
import mediaBackgroundImageFields from "./mediaBackgroundImage"
import paragraphColumnFields from "./paragraphColumn"
import paragraphCardFeaturedImageTextFields from "./paragraphCardFeaturedIamgeText"

export default gql`
    fragment paragraphSectionFields on ParagraphSection {
        __typename
        id
        bgColor
        bgImage {
            ...mediaBackgroundImageFields
        }
        bgImagePosition
        bgImageRepeat
        bgImageSize
        centerContent
        fullWidth
        margin
        padding
        sectionId
        content {
            ...paragraphColumnFields
            ...paragraphCardFeaturedImageTextFields
        }
    }
    ${mediaBackgroundImageFields}
    ${paragraphColumnFields}
    ${paragraphCardFeaturedImageTextFields}
`