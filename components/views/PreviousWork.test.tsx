import { beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import PreviousWork from "./PreviousWork"

vi.mock("../PortfolioSlider", () => ({
    default: ({ data }: { data: string }) => (
        <div data-testid="slider">{data}</div>
    ),
}))

const filters = [
    { tid: "5", name: "Web &amp; Apps", count: "3" },
    { tid: "6", name: "Branding", count: "1" },
]
const all = [
    {
        title: "Alpha",
        field_slider: "/sites/a.png",
        field_tags: "Drupal",
        field_media: "",
    },
    {
        title: "Beta",
        field_slider: "/sites/b1.png, /sites/b2.png",
        field_tags: "Next.js, React",
        field_media: "",
    },
]
const branding = [
    {
        title: "Gamma",
        field_slider: "/sites/g.png",
        field_tags: "Logo",
        field_media: "",
    },
]

const json = (body: unknown) => new Response(JSON.stringify(body))

/** A fetch mock that, like the real one, rejects when its request is aborted. */
function respondWhenReleased(body: unknown, signal?: AbortSignal | null) {
    let release: () => void = () => {}
    const promise = new Promise<Response>((resolve, reject) => {
        release = () => resolve(json(body))
        signal?.addEventListener("abort", () =>
            reject(new DOMException("Aborted", "AbortError"))
        )
    })
    return { promise, release }
}

describe("PreviousWork", () => {
    beforeEach(() => {
        vi.stubEnv("NEXT_PUBLIC_LOCAL_API_URL", "https://cms.test")
        vi.spyOn(console, "error").mockImplementation(() => {})
    })

    it("loads the filters and all archived projects", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn((url: string) =>
                Promise.resolve(
                    json(url.includes("projects-filters") ? filters : all)
                )
            )
        )
        render(<PreviousWork />)

        expect(screen.getByText("Loading portfolio...")).toBeInTheDocument()
        expect(await screen.findByText("Alpha")).toBeInTheDocument()
        expect(screen.getByText("Beta")).toBeInTheDocument()

        // HTML entities from Drupal are decoded in filter labels.
        expect(screen.getByLabelText("Web & Apps (3)")).toBeInTheDocument()
        expect(screen.getByLabelText("- Any -")).toBeChecked()

        // Multiple images use the slider; tags are split into labels.
        expect(screen.getByTestId("slider")).toHaveTextContent("b1.png")
        expect(screen.getByText("Next.js")).toBeInTheDocument()
        expect(screen.getByText("React")).toBeInTheDocument()
    })

    it("requests and shows the projects for the selected filter", async () => {
        const user = userEvent.setup()
        const fetchMock = vi.fn((url: string) =>
            Promise.resolve(
                json(
                    url.includes("projects-filters")
                        ? filters
                        : url.endsWith("/archived/6")
                          ? branding
                          : all
                )
            )
        )
        vi.stubGlobal("fetch", fetchMock)
        render(<PreviousWork />)

        await user.click(await screen.findByLabelText("Branding (1)"))

        expect(await screen.findByText("Gamma")).toBeInTheDocument()
        expect(screen.queryByText("Alpha")).not.toBeInTheDocument()
        expect(fetchMock).toHaveBeenCalledWith(
            "https://cms.test/rest/projects/archived/6",
            expect.anything()
        )
    })

    it("ignores a slow response that was superseded by a newer filter", async () => {
        const user = userEvent.setup()
        const slow = vi.fn()
        vi.stubGlobal(
            "fetch",
            vi.fn((url: string, init?: RequestInit) => {
                if (url.includes("projects-filters"))
                    return Promise.resolve(json(filters))
                if (url.endsWith("/archived/5")) {
                    const { promise, release } = respondWhenReleased(
                        [{ ...all[0], title: "Slow result" }],
                        init?.signal
                    )
                    slow.mockImplementation(release)
                    return promise
                }
                if (url.endsWith("/archived/6"))
                    return Promise.resolve(json(branding))
                return Promise.resolve(json(all))
            })
        )
        render(<PreviousWork />)

        await user.click(await screen.findByLabelText("Web & Apps (3)"))
        await user.click(screen.getByLabelText("Branding (1)"))
        expect(await screen.findByText("Gamma")).toBeInTheDocument()

        slow() // the first, now-stale request would resolve here
        await waitFor(() =>
            expect(screen.queryByText("Slow result")).not.toBeInTheDocument()
        )
        expect(screen.getByText("Gamma")).toBeInTheDocument()
    })
})
