import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import SocialMediaElement from "./SocialMediaElement"
import type { ParagraphSocialMediaItemProps } from "@/types/ParagraphSocialMediaItemProps"

const item = (title: string): ParagraphSocialMediaItemProps => ({
    __typename: "ParagraphSocialMediaItem",
    id: "1",
    link: { url: "https://www.linkedin.com/in/someone/", title },
    socialMediaIcon: "fa-brands fa-linkedin-in",
})

describe("SocialMediaElement", () => {
    it("has an accessible name even when Drupal supplies no link title", () => {
        render(<SocialMediaElement {...item("")} />)

        expect(
            screen.getByRole("link", { name: "LinkedIn (opens in a new tab)" })
        ).toBeInTheDocument()
    })

    it("uses the link title when there is one", () => {
        render(<SocialMediaElement {...item("Find me on LinkedIn")} />)

        expect(
            screen.getByRole("link", {
                name: "Find me on LinkedIn (opens in a new tab)",
            })
        ).toBeInTheDocument()
    })

    it("opens in a new tab safely", () => {
        render(<SocialMediaElement {...item("")} />)
        const link = screen.getByRole("link")

        expect(link).toHaveAttribute("target", "_blank")
        expect(link).toHaveAttribute("rel", "noopener noreferrer")
    })
})
