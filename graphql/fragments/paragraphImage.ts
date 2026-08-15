import { gql } from "graphql-tag"
import mediaImageFields from "./mediaImage"

export default gql`
  fragment paragraphImageFields on ParagraphImage {
    __typename
    id
    animate
    animationDirection
    media {
      ...mediaImageFields
    }
  }
    ${mediaImageFields}
`