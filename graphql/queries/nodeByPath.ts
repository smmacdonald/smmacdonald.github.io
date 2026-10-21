import { gql } from "graphql-tag"
import paragraphSectionFields from "../fragments/paragraphSection"
import paragraphBlockReferenceFields from "../fragments/paragraphBlockReference"
import breadcrumbsFields from "../fragments/breadcrumbs"
import metatagFields from "../fragments/metatag"

export default gql`
    query ByPath($path: String!) {
        route(path: $path) {
            ... on RouteInternal {
                __typename
                entity {
                    ... on NodePage {
                        id
                        title
                        pageHero: heroSection {
                            ...paragraphSectionFields
                        }
                        content {
                            ...paragraphSectionFields
                            ...paragraphBlockReferenceFields
                        }
                        metatag {
                            ...metatagFields
                        }
                    }
                    ... on NodeProject {
                        id
                        title
                        projectHero: heroSection {
                            ...paragraphSectionFields
                        }
                        content {
                            ...paragraphSectionFields
                        }
                        metatag {
                            ...metatagFields
                        }
                    }
                }
                breadcrumbs {
                    ...breadcrumbsFields
                }
            }
        }
    }
    ${paragraphSectionFields}
    ${paragraphBlockReferenceFields}
    ${breadcrumbsFields}
    ${metatagFields}
`
