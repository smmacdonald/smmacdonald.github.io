import { fetchGraphQL } from "./graphql"
import menu from "@/graphql/queries/menuByName"

export async function getMenus(name: string) {
    return fetchGraphQL(menu, {
        name,
    })
}