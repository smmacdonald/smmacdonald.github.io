import { describe, expect, it, vi } from "vitest"
import { getJson } from "./getJson"

describe("getJson", () => {
    it("returns the parsed body and sets a timeout signal", async () => {
        const fetchMock = vi.fn(() =>
            Promise.resolve(new Response(JSON.stringify({ a: 1 })))
        )
        vi.stubGlobal("fetch", fetchMock)

        await expect(getJson("https://cms.test/x")).resolves.toEqual({ a: 1 })

        const init = (
            fetchMock.mock.calls[0] as unknown as [string, RequestInit]
        )[1]
        expect(init.signal).toBeInstanceOf(AbortSignal)
    })

    it("throws on a non-2xx response, naming the URL and status", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn(() => Promise.resolve(new Response("", { status: 404 })))
        )

        await expect(getJson("https://cms.test/x")).rejects.toThrow(
            "https://cms.test/x failed: 404"
        )
    })
})
