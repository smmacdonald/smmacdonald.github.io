import { gql } from "graphql-tag"

export default gql`
    fragment breadcrumbsFields on Breadcrumbs {
        __typename
        url
        title
    }
`