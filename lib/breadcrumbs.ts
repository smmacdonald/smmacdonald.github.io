export type BreadcrumbItem = {
    url: string
    title: string
}

const HOME: BreadcrumbItem = { url: "/", title: "Home" }

/**
 * Makes sure a trail starts with the Home link.
 *
 * Drupal builds breadcrumbs from its own caches and has been seen returning an
 * empty trail for some pages (while others got Home), which dropped the Home
 * link and the spacing that comes with it. Home is always "/", so it does not
 * need to depend on that. Intermediate crumbs still come from Drupal.
 */
export function withHomeBreadcrumb(
    items: BreadcrumbItem[],
    path: string
): BreadcrumbItem[] {
    if (items[0]?.url === HOME.url) return items

    console.warn(
        `[breadcrumbs] Drupal returned no Home crumb for ${path}; adding it. ` +
            "If this is unexpected, clear the Drupal caches and rebuild."
    )

    return [HOME, ...items]
}
