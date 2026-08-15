import { gql } from "graphql-tag"

export default gql`
  fragment menuItemFields on MenuItem {
    url
    title
    internal
  }
`