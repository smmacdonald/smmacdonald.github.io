import { print, type DocumentNode } from "graphql"

const REQUEST_TIMEOUT_MS = 15_000

export async function fetchGraphQL(
    query: DocumentNode,
    variables = {}
) {
    const endpoint = process.env.NEXT_PUBLIC_LOCAL_API_GRAPHQL_URL

    if (!endpoint) {
        throw new Error("NEXT_PUBLIC_LOCAL_API_GRAPHQL_URL is not configured")
    }

    const response = await fetch(endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            query: print(query),
            variables,
        }),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })

    if (!response.ok) {
        throw new Error(`GraphQL request failed: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()

    if (result.errors?.length) {
        const messages = result.errors.map((e: { message: string }) => e.message).join("; ")
        throw new Error(`GraphQL returned errors: ${messages}`)
    }

    return result
}
