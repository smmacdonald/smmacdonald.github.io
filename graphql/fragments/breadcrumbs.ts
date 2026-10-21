import { gql } from "graphql-tag"

export default gql`
    fragment breadcrumbsFields on Link {
        url
        title
    }
`
