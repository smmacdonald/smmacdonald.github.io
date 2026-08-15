import mediaImageFields from "../fragments/mediaImage"
import mediaLinkedImageFields from "../fragments/mediaLinkedImage"
import menuItemFields from "../fragments/menuItem"

import { gql } from "graphql-tag"

export default gql`
    query siteInfo {
        node(id: "1") {
            ... on NodePage {
                id
                metatag {
                    ... on MetaTagScript {
                        content
                        tag
                        attributes {
                            type
                            src
                            integrity
                        }
                    }
                    ... on MetaTagProperty {
                        __typename
                        tag
                        attributes {
                            property
                            content
                        }
                    }
                    ... on MetaTagValue {
                        __typename
                        tag
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
        }
        logo:blockContent(id: "1") {
            __typename
            ... on BlockContentSiteLogo {
                __typename
                id
                title
                image {
                    ...mediaImageFields
                }
            }
        }
        main:menu(name: MAIN) {
            name
            items {
                ...menuItemFields
                    children {
                        ...menuItemFields
                        children {
                        ...menuItemFields
                    }
                }
            }
        }
        menuToggle:menu(name: MOBILE_MENU_TOGGLE) {
            name
            items {
                ...menuItemFields
                    children {
                        ...menuItemFields
                        children {
                        ...menuItemFields
                    }
                }
            }
        }
        footerBrand:blockContent(id: "5") {
            __typename
            ... on BlockContentFooterBrandAndSocial {
                __typename
                id
                image {
                    ... on MediaLinkedImage {
                        ...mediaLinkedImageFields
                    }
                }
                body {
                    processed
                }
                socialMedia {
                    __typename
                    ... on ParagraphSocialMedia {
                        __typename
                        id
                        socialMediaElement {
                            __typename
                            ... on ParagraphSocialMediaItem {
                                __typename
                                id
                                link {
                                    url
                                    title
                                }
                                socialMediaIcon
                            }
                        }
                    }
                }
            }
        }
        contactCTA:blockContent(id: "2") {
            __typename
            ... on BlockContentBasic {
                __typename
                id
                title
                body {
                    processed
                }
            }
        }
        copyright:blockContent(id: "6") {
            __typename
            ... on BlockContentBasic {
                __typename
                id
                title
                body {
                    processed
                }
            }
        }
     }
    ${mediaImageFields}
    ${menuItemFields}
    ${mediaLinkedImageFields}
`