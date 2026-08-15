import block from "@/graphql/queries/blockById"
import { fetchGraphQL } from "./graphql"

export async function getBlock(id: string) {
    return fetchGraphQL(block, {
        id,
    })
}