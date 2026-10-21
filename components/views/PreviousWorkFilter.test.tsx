import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import PreviousWorkFilter from "./PreviousWorkFilter"
import type { PreviousWorkProjectsByTerm } from "@/types/PreviousWorkProps"

vi.mock("../PortfolioSlider", () => ({
    default: ({ data }: { data: string }) => (
        <div data-testid="slider">{data}</div>
    ),
}))

const filters = [
    { tid: "5", name: "Web &amp; Apps", count: "3" },
    { tid: "6", name: "Branding", count: "1" },
]
const project = (title: string, field_slider: string, field_tags: string) => ({
    title,
    field_slider,
    field_tags,
    field_media: "",
})
const projectsByTerm: PreviousWorkProjectsByTerm = {
    all: [
        project("Alpha", "/sites/a.png", "Drupal"),
        project("Beta", "/sites/b1.png, /sites/b2.png", "Next.js, React"),
        project("Gamma", "/sites/g.png", "Logo"),
    ],
    "5": [project("Alpha", "/sites/a.png", "Drupal")],
    "6": [project("Gamma", "/sites/g.png", "Logo")],
}

function renderFilter() {
    vi.stubEnv("NEXT_PUBLIC_LOCAL_API_URL", "https://cms.test")
    return render(
        <PreviousWorkFilter filters={filters} projectsByTerm={projectsByTerm} />
    )
}

describe("PreviousWorkFilter", () => {
    it("shows every project by default, with no loading state", () => {
        renderFilter()

        expect(screen.getByLabelText("- Any -")).toBeChecked()
        expect(screen.getByText("Alpha")).toBeInTheDocument()
        expect(screen.getByText("Beta")).toBeInTheDocument()
        expect(screen.getByText("Gamma")).toBeInTheDocument()
    })

    it("decodes HTML entities in filter labels and shows counts", () => {
        renderFilter()

        expect(screen.getByLabelText("Web & Apps (3)")).toBeInTheDocument()
        expect(screen.getByLabelText("Branding (1)")).toBeInTheDocument()
    })

    it("switches to the selected filter's projects without any request", async () => {
        const user = userEvent.setup()
        const fetchMock = vi.fn()
        vi.stubGlobal("fetch", fetchMock)
        renderFilter()

        await user.click(screen.getByLabelText("Branding (1)"))

        expect(screen.getByText("Gamma")).toBeInTheDocument()
        expect(screen.queryByText("Alpha")).not.toBeInTheDocument()
        expect(screen.getByLabelText("Branding (1)")).toBeChecked()
        expect(fetchMock).not.toHaveBeenCalled()
    })

    it("returns to all projects when Any is selected again", async () => {
        const user = userEvent.setup()
        renderFilter()

        await user.click(screen.getByLabelText("Branding (1)"))
        await user.click(screen.getByLabelText("- Any -"))

        expect(screen.getByText("Alpha")).toBeInTheDocument()
        expect(screen.getByText("Gamma")).toBeInTheDocument()
    })

    it("uses the slider for multiple images and splits tags into labels", () => {
        renderFilter()

        expect(screen.getByTestId("slider")).toHaveTextContent("b1.png")
        expect(screen.getByText("Next.js")).toBeInTheDocument()
        expect(screen.getByText("React")).toBeInTheDocument()
    })
})
