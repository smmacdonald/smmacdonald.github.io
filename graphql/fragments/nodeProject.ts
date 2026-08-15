import { gql } from "graphql-tag"
import paragraphSectionFields from "./paragraphSection"

export default gql`
    fragment nodeProjectFields on NodeProject {
        __typename
        id
        projectPage {
            ...paragraphSectionFields
        }
    }
    ${paragraphSectionFields}
`