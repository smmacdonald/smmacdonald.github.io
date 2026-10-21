import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { parseMetadata } from "@/lib/metadata"
import { getPageByPath } from "@/lib/getPage"
import { sitemapToSlugParams } from "@/lib/sitemap"
import { getJson } from "@/lib/getJson"
import { withHomeBreadcrumb } from "@/lib/breadcrumbs"
import BodyClassSync from "@/src/utils/BodyClassSync"

import Section from "@/components/Section"
import Breadcrumbs from "@/components/blocks/Breadcrumbs"
import BlockReference from "@/components/BlockReference"

import { ParagraphBlockReferenceProps } from "@/types/ParagraphBlockReferenceProps"
import { ParagraphSectionProps } from "@/types/ParagraphSectionProps"

type Props = {
    params: Promise<{
        slug: string[]
    }>
}

type SectionElement = ParagraphSectionProps | ParagraphBlockReferenceProps

export const dynamicParams = false

export async function generateStaticParams() {
    const params = sitemapToSlugParams(
        await getJson(
            process.env.NEXT_PUBLIC_LOCAL_API_URL + "/rest/headless-sitemap"
        )
    )

    if (params.length === 0) {
        throw new Error(
            "The Drupal sitemap returned no routes; refusing to build an empty site"
        )
    }

    return params
}

async function getSlugPage(params: Props["params"]) {
    const { slug } = await params
    const path = `/${slug.join("/")}`
    const { data } = await getPageByPath(path)
    return data
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const data = await getSlugPage(params)
    return parseMetadata(data?.route?.entity?.metatag ?? [])
}

export default async function Slug({ params }: Props) {
    const data = await getSlugPage(params)
    const entity = data?.route?.entity
    const breadcrumbs = data?.route?.breadcrumbs
    const { slug } = await params

    if (!entity) {
        notFound()
    }
    return (
        <>
            <BodyClassSync title={entity.title} />
            {entity?.pageHero && (
                <Section key={entity.pageHero.id} {...entity.pageHero} />
            )}

            {entity?.projectHero && (
                <Section key={entity.projectHero.id} {...entity.projectHero} />
            )}

            {breadcrumbs && (
                <Breadcrumbs
                    data={withHomeBreadcrumb(breadcrumbs, `/${slug.join("/")}`)}
                    current={entity.title}
                />
            )}

            {entity?.content?.map((section: SectionElement, index: number) => {
                switch (section.__typename) {
                    case "ParagraphSection":
                        return <Section key={index} {...section} />

                    case "ParagraphBlockReference":
                        return <BlockReference key={index} {...section} />

                    default:
                        return null
                }
            })}
        </>
    )
}
