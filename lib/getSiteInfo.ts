import siteInfo from "@/graphql/queries/siteInfo"
import { fetchGraphQL } from "./graphql"

export async function getSiteInfo() {
    return fetchGraphQL(siteInfo)
}