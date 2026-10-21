export type SitemapEntry = {
    view_node: string
}

/**
 * Convert the Drupal headless-sitemap response into `[...slug]` route params.
 * The homepage is served by app/page.tsx and the 403/404 pages are not routes.
 */
export function sitemapToSlugParams(entries: SitemapEntry[]) {
    return entries
        .map((item) => {
            const slug = item.view_node.replace(/^\/|\/$/g, "").split("/")

            if (
                slug.includes("403") ||
                slug.includes("404") ||
                (slug.length === 1 && slug[0] === "homepage")
            ) {
                return null
            }

            return { slug }
        })
        .filter((item) => item !== null)
}
