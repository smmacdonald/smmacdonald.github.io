const REQUEST_TIMEOUT_MS = 15_000

/** GET a Drupal REST endpoint at build time, failing loudly on any error. */
export async function getJson<T>(url: string): Promise<T> {
    const response = await fetch(url, {
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })

    if (!response.ok) {
        throw new Error(`Request to ${url} failed: ${response.status}`)
    }

    return response.json() as Promise<T>
}
