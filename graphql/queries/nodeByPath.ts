import { gql } from "graphql-tag"
import paragraphSectionFields from "../fragments/paragraphSection"
import paragraphBlockReferenceFields from "../fragments/paragraphBlockReference"
import breadcrumbsFields from "../fragments/breadcrumbs"

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
                            ... on MetaTagScript {
                                content
                                attributes {
                                    integrity
                                    src
                                    type
                                }
                            }
                            ... on MetaTagProperty {
                                __typename
                                attributes {
                                    content
                                    property
                                }
                            }
                            ... on MetaTagValue {
                                __typename
                                attributes {
                                    content
                                    name
                                }
                            }
                            ... on MetaTagLink {
                                __typename
                                tag
                                attributes {
                                    href
                                    hreflang
                                    media
                                    rel
                                    sizes
                                    type
                                }
                            }
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
`
