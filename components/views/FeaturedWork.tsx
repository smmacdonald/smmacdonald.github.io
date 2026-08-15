import Link from "next/link"
import PortfolioSlider from "../PortfolioSlider"
import Image from "next/image"

type FeaturedProjectProps = {
    field_filter: string
    field_slider: string
    title: string
    field_tags: string
    url: string
}

export default async function FeaturedWork() {
    const path = process.env.NEXT_PUBLIC_LOCAL_API_URL + '/rest/projects/featured'
    let data = await fetch(path)
    let posts: FeaturedProjectProps[] = await data.json()

    return (
        <>
            <div className="h2">Selected work</div>
            {posts.map((post, i) => (
                <div key={i} className="col-lg-3 col-md-6 pb-4 portfolio-item">
                    <div className="portfolio-featured-work">
                        <div className="portfolio-featured-image">
                            {post.field_slider.includes(', ') ? (
                                <PortfolioSlider
                                    data={post.field_slider}
                                    autoplay="1"
                                    show="1"
                                    scroll="1" />
                            ) : (
                                <Image
                                    src={process.env.NEXT_PUBLIC_LOCAL_API_URL + post.field_slider}
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

                                ) : ''}
                            </div>
                            <Link
                                href={post.url}
                                tabIndex={0}
                                title={`Link to project: ${post.title}`}
                                className="arrow-right fa-regular fa-arrow-right">View Project</Link>
                        </div>
                    </div>
                </div>
            ))}
        </>
    )
}