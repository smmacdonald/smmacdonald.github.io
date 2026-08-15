import node from "@/graphql/queries/nodeByPath"
import { fetchGraphQL } from "./graphql"

export async function getPageByPath(path: string) {
    return fetchGraphQL(node, {
        path,
    })
}