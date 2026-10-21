import { Metadata } from "next"
import { MetaTagProps } from "@/types/MetaTagProps"

export function parseMetadata(metaTags: MetaTagProps[]): Metadata {
    const metadata: Metadata = {}

    const getMeta = (key: string): string | undefined => {
        const tag = metaTags.find(
            ({ attributes }) =>
                attributes.name === key || attributes.property === key
        )

        return tag?.attributes.content ?? undefined
    }

    const getLink = (rel: string): string | undefined => {
        const tag = metaTags.find(({ attributes }) => attributes.rel === rel)

        return tag?.attributes.href ?? undefined
    }

    const title = getMeta("title")
    const description = getMeta("description")
    const robots = getMeta("robots")
    const canonical = getLink("canonical")

    if (title) {
        metadata.title = title
    }

    if (description) {
        metadata.description = description
    }

    if (robots) {
        metadata.robots = robots
    }

    if (canonical) {
        metadata.alternates = {
            canonical,
        }
    }

    const ogTitle = getMeta("og:title")
    const ogDescription = getMeta("og:description")
    const ogImage = getMeta("og:image")
    const ogUrl = getMeta("og:url")
    const ogType = getMeta("og:type")
    const ogSiteName = getMeta("og:site_name")

    if (ogTitle || ogDescription || ogImage || ogUrl || ogType || ogSiteName) {
        metadata.openGraph = {
            ...(ogTitle && { title: ogTitle }),
            ...(ogDescription && { description: ogDescription }),
            ...(ogImage && { images: [ogImage] }),
            ...(ogUrl && { url: ogUrl }),
            ...(ogType && {
                type: ogType as "website" | "article",
            }),
            ...(ogSiteName && { siteName: ogSiteName }),
        }
    }

    const twitterCard = getMeta("twitter:card")
    const twitterTitle = getMeta("twitter:title")
    const twitterDescription = getMeta("twitter:description")
    const twitterImage = getMeta("twitter:image")
    const twitterCreator = getMeta("twitter:creator")
    const twitterSite = getMeta("twitter:site")

    if (
        twitterCard ||
        twitterTitle ||
        twitterDescription ||
        twitterImage ||
        twitterCreator ||
        twitterSite
    ) {
        metadata.twitter = {
            ...(twitterCard && {
                card: twitterCard as
                    "summary" | "summary_large_image" | "player" | "app",
            }),
            ...(twitterTitle && {
                title: twitterTitle,
            }),
            ...(twitterDescription && {
                description: twitterDescription,
            }),
            ...(twitterImage && {
                images: [twitterImage],
            }),
            ...(twitterCreator && {
                creator: twitterCreator,
            }),
            ...(twitterSite && {
                site: twitterSite,
            }),
        }
    }

    return metadata
}

const HOME_SLUG = /\/homepage\/?$/

/**
 * Drupal serves the home page at `/` (`/homepage` redirects there), but its
 * metatag canonical and og:url still name `/homepage`. Point both at `/`.
 */
export function withHomeCanonical(metadata: Metadata): Metadata {
    const canonical = metadata.alternates?.canonical
    const ogUrl = metadata.openGraph?.url

    return {
        ...metadata,
        ...(typeof canonical === "string" && {
            alternates: {
                ...metadata.alternates,
                canonical: canonical.replace(HOME_SLUG, "/"),
            },
        }),
        ...(metadata.openGraph &&
            typeof ogUrl === "string" && {
                openGraph: {
                    ...metadata.openGraph,
                    url: ogUrl.replace(HOME_SLUG, "/"),
                },
            }),
    }
}
