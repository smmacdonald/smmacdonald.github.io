"use client"

import { useState } from "react"
import PortfolioSlider from "../PortfolioSlider"
import Image from "next/image"
import {
    PreviousWorkFilterProps,
    PreviousWorkProjectsByTerm,
} from "@/types/PreviousWorkProps"

type Props = {
    filters: PreviousWorkFilterProps[]
    projectsByTerm: PreviousWorkProjectsByTerm
}

/** Switches between project lists that were already loaded on the server. */
export default function PreviousWorkFilter({ filters, projectsByTerm }: Props) {
    const [selected, setSelected] = useState("all")
    const projects = projectsByTerm[selected] ?? []

    return (
        <>
            <div className="h3 mb-4">Past Projects</div>
            <form className="previous-work-form">
                <div className="form-check">
                    <input
                        className="form-check-input"
                        type="radio"
                        name="PortfolioFilter"
                        value="all"
                        id="flexRadioDefault-All"
                        checked={selected === "all"}
                        onChange={() => setSelected("all")}
                    />
                    <label
                        className="form-check-label"
                        htmlFor="flexRadioDefault-All"
                    >
                        - Any -
                    </label>
                </div>
                {filters.map((element, i: number) => (
                    <div key={i} className="form-check">
                        <input
                            className="form-check-input"
                            type="radio"
                            name="PortfolioFilter"
                            value={element.tid}
                            id={`flexRadioDefault-${element.tid}`}
                            checked={selected === element.tid}
                            onChange={() => setSelected(element.tid)}
                        />
                        <label
                            className="form-check-label"
                            htmlFor={`flexRadioDefault-${element.tid}`}
                        >
                            {element.name?.replaceAll("&amp;", "&")} (
                            {element.count})
                        </label>
                    </div>
                ))}
            </form>
            {projects.map((post, i) => (
                <div key={i} className="col-lg-3 col-md-6 pb-4 portfolio-item">
                    <div className="portfolio-archived-work">
                        <div className="portfolio-featured-image">
                            {post.field_slider.includes(", ") ? (
                                <PortfolioSlider
                                    data={post.field_slider}
                                    autoplay="1"
                                    show="1"
                                    scroll="1"
                                />
                            ) : (
                                <Image
                                    src={
                                        process.env.NEXT_PUBLIC_LOCAL_API_URL +
                                        post.field_slider.trim()
                                    }
                                    height={400}
                                    width={600}
                                    alt=""
                                    unoptimized
                                />
                            )}
                        </div>
                        <div className="portfolio-content-wrap p-4">
                            <div className="h4 portfolio-title">
                                {post.title}
                            </div>
                            <div className="portfolio-tags mt-auto">
                                {post.field_tags.includes(", ") ? (
                                    post.field_tags
                                        .split(", ")
                                        .map((item, index) => {
                                            return (
                                                <span
                                                    key={index}
                                                    className="portfolio-term-label"
                                                >
                                                    {item.trim()}
                                                </span>
                                            )
                                        })
                                ) : (
                                    <>
                                        <span className="portfolio-term-label">
                                            {post.field_tags}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </>
    )
}
