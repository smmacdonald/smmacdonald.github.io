import Link from "next/link"

type BreadcrumbsProps = {
    data: BreadcrumbItemProp[]
    current: string
}
type BreadcrumbItemProp = {
    url: string
    title: string
}

export default function Breadcrumbs({ data, current }: BreadcrumbsProps) {
    return (
        <section className="breadcrumbs">
            <div className="container">
                <div className="row">
                    <div className="col-12">

                        <ol className="d-flex m-0 p-0 breadcrumb-list">
                            {data.map((node: BreadcrumbItemProp, index: number) => (
                                <li
                                    key={index}
                                    className="breadcrumb__item list-unstyled">
                                    <Link
                                        href={node.url}
                                        className={index == 0 ? "breadcrumb__link pe-3 py-3" : "menu__link px-3 py-3"}
                                    >
                                        <div className="breadcrumb__text">
                                            {node.title}
                                        </div>
                                    </Link>
                                </li>
                            ))}
                            <li
                                key="current"
                                className="breadcrumb__item list-unstyled current">
                                <div className="breadcrumb__text">
                                    {current}
                                </div>
                            </li>
                        </ol>

                    </div>
                </div>
            </div>
        </section>
    )
}