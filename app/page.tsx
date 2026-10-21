import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { parseMetadata, withHomeCanonical } from "@/lib/metadata"
import { getPageByPath } from "@/lib/getPage"
import Section from "@/components/Section"
import { PageProps } from "@/types/PageProps"

async function getHomePage() {
    const { data } = await getPageByPath("/homepage")
    const entity = data?.route?.entity

    if (!entity) {
        notFound()
    }

    return entity
}

export async function generateMetadata(): Promise<Metadata> {
    const data = await getHomePage()
    return withHomeCanonical(parseMetadata(data.metatag ?? []))
}

export default async function Home() {
    const entity: PageProps = await getHomePage()
    return (
        <>
            {entity.pageHero && <Section {...entity.pageHero} />}

            {entity.content?.map((section, index: number) => (
                <Section key={index} {...section} />
            ))}
        </>
    )
}
