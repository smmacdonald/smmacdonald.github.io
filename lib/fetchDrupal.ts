
export async function fetchDrupal(
    endpoint: string,
    options: RequestInit = {}
) {
    const headers = new Headers(options.headers);

    headers.set("Content-Type", "application/json");

    if (
        process.env.DRUPAL_GRAPHQL_USER &&
        process.env.DRUPAL_GRAPHQL_PASSWORD
    ) {
        const credentials = Buffer.from(
            `${process.env.DRUPAL_GRAPHQL_USER}:${process.env.DRUPAL_GRAPHQL_PASSWORD}`
        ).toString("base64");

        headers.set("Authorization", `Basic ${credentials}`);
    }

    return fetch(endpoint, {
        ...options,
        headers,
    });
}