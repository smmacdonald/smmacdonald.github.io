import { describe, expect, it, vi } from "vitest"
import { gql } from "graphql-tag"
import { fetchGraphQL } from "./graphql"

const query = gql`
    query Test($id: ID!) {
        node(id: $id) {
            id
        }
    }
`

const respond = (body: unknown, init: ResponseInit = { status: 200 }) =>
    Promise.resolve(new Response(JSON.stringify(body), init))

describe("fetchGraphQL", () => {
    it("throws when the endpoint is not configured", async () => {
        vi.stubEnv("NEXT_PUBLIC_LOCAL_API_GRAPHQL_URL", "")

        await expect(fetchGraphQL(query)).rejects.toThrow(/not configured/)
    })

    it("posts the printed query and variables as JSON and returns the result", async () => {
        vi.stubEnv(
            "NEXT_PUBLIC_LOCAL_API_GRAPHQL_URL",
            "https://cms.test/graphql"
        )
        const fetchMock = vi.fn(() => respond({ data: { node: { id: "1" } } }))
        vi.stubGlobal("fetch", fetchMock)

        const result = await fetchGraphQL(query, { id: "1" })

        expect(result).toEqual({ data: { node: { id: "1" } } })

        const [url, init] = fetchMock.mock.calls[0] as unknown as [
            string,
            RequestInit,
        ]
        expect(url).toBe("https://cms.test/graphql")
        expect(init.method).toBe("POST")
        expect(init.signal).toBeInstanceOf(AbortSignal)

        const body = JSON.parse(init.body as string)
        expect(body.variables).toEqual({ id: "1" })
        expect(body.query).toContain("query Test")
    })

    it("throws on a non-2xx response", async () => {
        vi.stubEnv(
            "NEXT_PUBLIC_LOCAL_API_GRAPHQL_URL",
            "https://cms.test/graphql"
        )
        vi.stubGlobal(
            "fetch",
            vi.fn(() =>
                respond({}, { status: 500, statusText: "Server Error" })
            )
        )

        await expect(fetchGraphQL(query)).rejects.toThrow(/500/)
    })

    it("throws with the messages when GraphQL returns errors", async () => {
        vi.stubEnv(
            "NEXT_PUBLIC_LOCAL_API_GRAPHQL_URL",
            "https://cms.test/graphql"
        )
        vi.stubGlobal(
            "fetch",
            vi.fn(() =>
                respond({
                    errors: [{ message: "first" }, { message: "second" }],
                })
            )
        )

        await expect(fetchGraphQL(query)).rejects.toThrow(/first; second/)
    })

    it("propagates network failures", async () => {
        vi.stubEnv(
            "NEXT_PUBLIC_LOCAL_API_GRAPHQL_URL",
            "https://cms.test/graphql"
        )
        vi.stubGlobal(
            "fetch",
            vi.fn(() => Promise.reject(new TypeError("fetch failed")))
        )

        await expect(fetchGraphQL(query)).rejects.toThrow("fetch failed")
    })
})
