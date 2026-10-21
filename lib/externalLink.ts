const KNOWN_SITES: Record<string, string> = {
    "linkedin.com": "LinkedIn",
    "github.com": "GitHub",
    "x.com": "X",
    "twitter.com": "Twitter",
    "facebook.com": "Facebook",
    "instagram.com": "Instagram",
    "youtube.com": "YouTube",
}

/**
 * A readable name for a link that only shows an icon. Uses the CMS link title
 * when there is one, otherwise names the site from its host.
 */
export function externalLinkLabel(url: string, title?: string | null): string {
    if (title?.trim()) return title.trim()

    try {
        const host = new URL(url).hostname.replace(/^www\./, "")
        return KNOWN_SITES[host] ?? host
    } catch {
        return url
    }
}
