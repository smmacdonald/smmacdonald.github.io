import { print, type DocumentNode } from "graphql"

export async function fetchGraphQL(
    query: DocumentNode,
    variables = {}
) {
    const response = await fetch(
        process.env.NEXT_PUBLIC_LOCAL_API_GRAPHQL_URL!,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                query: print(query),
                variables,
            }),
        }
    )
    return response.json()
}