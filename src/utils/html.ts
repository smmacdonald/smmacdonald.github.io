export function fixCmsImagePaths(htmlString: string | undefined | null): string {
    if (!htmlString) return ''

    const baseUrl = process.env.NEXT_PUBLIC_LOCAL_API_URL || ''

    // Target relative attributes: src="/sites/... and srcset="/sites/...
    let fixedHtml = htmlString.replaceAll('src="/sites/', `src="${baseUrl}/sites/`)
    fixedHtml = fixedHtml.replaceAll('srcset="/sites/', `srcset="${baseUrl}/sites/`)

    return fixedHtml
}