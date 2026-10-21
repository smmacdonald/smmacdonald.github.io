import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { act, render } from "@testing-library/react"
import ParagraphImage from "./ParagraphImage"
import type { ParagraphImageProps } from "@/types/ParagraphImageProps"

const data: ParagraphImageProps = {
    __typename: "ParagraphImage",
    id: "p1",
    animate: true,
    animationDirection: "from-left",
    media: {
        __typename: "MediaImage",
        id: "m1",
        mediaImage: {
            url: "https://cms.test/a.png",
            alt: "A photo",
            height: 100,
            width: 200,
            variations: [],
        },
    },
}

let callback: IntersectionObserverCallback
const observe = vi.fn()
const unobserve = vi.fn()

beforeEach(() => {
    observe.mockClear()
    unobserve.mockClear()
    vi.stubGlobal(
        "IntersectionObserver",
        class {
            constructor(cb: IntersectionObserverCallback) {
                callback = cb
            }
            observe = observe
            unobserve = unobserve
            disconnect = vi.fn()
        }
    )
})
afterEach(() => vi.unstubAllGlobals())

const intersect = (isIntersecting: boolean) =>
    act(() =>
        callback(
            [{ isIntersecting } as IntersectionObserverEntry],
            {} as IntersectionObserver
        )
    )

describe("ParagraphImage", () => {
    it("renders the image with its alt text and animation classes", () => {
        const { container, getByAltText } = render(<ParagraphImage {...data} />)

        expect(getByAltText("A photo")).toBeInTheDocument()
        expect(container.firstChild).toHaveClass("animate-image", "from-left")
        expect(container.firstChild).not.toHaveClass("animated")
    })

    it("adds the animated class once it scrolls into view", () => {
        const { container } = render(<ParagraphImage {...data} />)

        intersect(false)
        expect(container.firstChild).not.toHaveClass("animated")

        intersect(true)
        expect(container.firstChild).toHaveClass("animated")
    })

    it("has no animation classes when animate is off", () => {
        const { container } = render(
            <ParagraphImage {...data} animate={false} />
        )

        expect(container.firstChild).not.toHaveClass("animate-image")
    })
})
