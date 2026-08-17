"use client"

import { useEffect, useState } from "react"
import PortfolioSlider from "../PortfolioSlider"
import Image from "next/image"

type FormFieldItemProps = {
    name: string
    count: string
    tid: string
}
type ProjectItemProps = {
    field_media: string
    field_slider: string
    field_tags: string
    title: string
}

export default function PreviousWork() {
    const [termId, setTermId] = useState("")
    const [formFields, setFormFields] = useState<FormFieldItemProps[]>([])
    const [projects, setProjects] = useState<ProjectItemProps[]>([])
    const [loading, setLoading] = useState(true)

    const baseUrl = process.env.NEXT_PUBLIC_LOCAL_API_URL

    // Fetch projects
    const fetchProjects = async (term: string) => {
        try {
            const url = term
                ? `${baseUrl}/rest/projects/archived/${term}`
                : `${baseUrl}/rest/projects/archived`

            const res = await fetch(url)

            if (!res.ok) {
                throw new Error(`Projects request failed: ${res.status}`)
            }

            const data = await res.json()

            setProjects(data)
        } catch (error) {
            console.error("Failed to load projects:", error)
        }
    }

    // Initial load
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [formRes, projectsRes] = await Promise.all([
                    fetch(`${baseUrl}/rest/projects-filters/archived`),
                    fetch(`${baseUrl}/rest/projects/archived`),
                ])

                const [formData, projectsData] = await Promise.all([
                    formRes.json(),
                    projectsRes.json(),
                ])

                setFormFields(formData)
                setProjects(projectsData)

            } catch (error) {
                console.error("Failed to load initial data:", error)
            } finally {
                setLoading(false)
            }
        }

        loadInitialData()
    }, [baseUrl])

    // Fetch filtered projects
    useEffect(() => {
        if (!termId) return

        fetchProjects(termId)
    }, [termId])

    const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTermId(e.target.value)
    }

    if (loading)
        return <div>Loading portfolio...</div>

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
                        defaultChecked
                        onChange={handleRadioChange}
                    />
                    <label className="form-check-label" htmlFor="flexRadioDefault-All">
                        - Any -
                    </label>
                </div>
                {formFields?.map((element, i: number) => (
                    <div key={i} className="form-check">
                        <input
                            className="form-check-input"
                            type="radio"
                            name="PortfolioFilter"
                            value={element.tid}
                            id={`flexRadioDefault-${element.tid}`}
                            onChange={handleRadioChange}
                        />
                        <label
                            className="form-check-label"
                            htmlFor={`flexRadioDefault-${element.tid}`}
                        >
                            {element.name?.replaceAll('&amp;', '&')} ({element.count})
                        </label>
                    </div>
                ))}
            </form>
            {projects?.map((post, i) => (
                <div key={i} className="col-lg-3 col-md-6 pb-4 portfolio-item">
                    <div className="portfolio-archived-work">
                        <div className="portfolio-featured-image">
                            {post.field_slider.includes(', ') ? (
                                <PortfolioSlider data={post.field_slider} autoplay="1" show="1" scroll="1" />
                            ) : (
                                <Image
                                    src={process.env.NEXT_PUBLIC_LOCAL_API_URL + post.field_slider.trim()}
                                    height={400}
                                    width={600}
                                    alt=""
                                    unoptimized />
                            )}
                        </div>
                        <div className="portfolio-content-wrap p-4">
                            <div className="h4 portfolio-title">{post.title}</div>
                            <div className="portfolio-tags mt-auto">
                                {post.field_tags.includes(', ') ? (
                                    post.field_tags.split(', ').map((item, index) => {
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