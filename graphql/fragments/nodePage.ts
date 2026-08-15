import { gql } from "graphql-tag"
import paragraphSectionFields from "./paragraphSection"

export default gql`
    fragment nodePageFields on NodePage {
        __typename
        id
        nodePage {
            ...paragraphSectionFields
        }
    }
    ${paragraphSectionFields}
`