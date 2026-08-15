import { gql } from "graphql-tag"

export default gql`
  fragment paragraphTextFields on ParagraphText {
    __typename
    id
    verticalAlign
    body {
      processed
    }
  }
`