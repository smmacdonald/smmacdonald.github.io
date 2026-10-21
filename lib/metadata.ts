import { Metadata } from "next"
import { MetaTagProps } from "@/types/MetaTagProps"

/** A link to an image on the Drupal host must not resolve against this site. */
function absoluteUrl(url: string): string {
    const origin = process.env.NEXT_PUBLIC_LOCAL_API_URL

    if (url.startsWith("/") && origin) {
        return new URL(url, origin).toString()
    }

    return url
}

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

    // Drupal's Metatag "Image" field is emitted as the legacy
    // <link rel="image_src">, not as og:image. Sharing apps ignore it and guess
    // an image from the page instead, so use it as the share image when there
    // is no explicit og:image, together with the page title and description.
    const imageSrc = getLink("image_src")
    const shareImage = !getMeta("og:image") && imageSrc ? imageSrc : undefined

    const ogTitle = getMeta("og:title") ?? (shareImage ? title : undefined)
    const ogDescription =
        getMeta("og:description") ?? (shareImage ? description : undefined)
    const ogImage = getMeta("og:image") ?? shareImage
    const ogUrl = getMeta("og:url")
    const ogType = getMeta("og:type")
    const ogSiteName = getMeta("og:site_name")

    if (ogTitle || ogDescription || ogImage || ogUrl || ogType || ogSiteName) {
        metadata.openGraph = {
            ...(ogTitle && { title: ogTitle }),
            ...(ogDescription && { description: ogDescription }),
            ...(ogImage && { images: [absoluteUrl(ogImage)] }),
            ...(ogUrl && { url: ogUrl }),
            ...(ogType && {
                type: ogType as "website" | "article",
            }),
            ...(ogSiteName && { siteName: ogSiteName }),
        }
    }

    const twitterCard =
        getMeta("twitter:card") ??
        (shareImage && !getMeta("twitter:image")
            ? "summary_large_image"
            : undefined)
    const twitterTitle =
        getMeta("twitter:title") ?? (shareImage ? title : undefined)
    const twitterDescription =
        getMeta("twitter:description") ?? (shareImage ? description : undefined)
    const twitterImage = getMeta("twitter:image") ?? shareImage
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
                images: [absoluteUrl(twitterImage)],
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
