import PreviousWorkFilter from "./PreviousWorkFilter"
import { getJson } from "@/lib/getJson"
import { decodeStringFields } from "@/lib/text"
import {
    PreviousWorkFilterProps,
    PreviousWorkProjectProps,
    PreviousWorkProjectsByTerm,
} from "@/types/PreviousWorkProps"

/** Loads every filter's project list at build time so filtering needs no requests. */
export default async function PreviousWork() {
    const baseUrl = process.env.NEXT_PUBLIC_LOCAL_API_URL

    // Drupal's REST views HTML-escape every field ("Earth &amp; Sky"); these are
    // plain text and URLs, so decode them before they are rendered.
    const [filterRows, allRows] = await Promise.all([
        getJson<PreviousWorkFilterProps[]>(
            `${baseUrl}/rest/projects-filters/archived`
        ),
        getJson<PreviousWorkProjectProps[]>(
            `${baseUrl}/rest/projects/archived`
        ),
    ])

    const filters = filterRows.map(decodeStringFields)
    const all = allRows.map(decodeStringFields)

    const lists = await Promise.all(
        filters.map((filter) =>
            getJson<PreviousWorkProjectProps[]>(
                `${baseUrl}/rest/projects/archived/${filter.tid}`
            )
        )
    )

    const projectsByTerm: PreviousWorkProjectsByTerm = { all }
    filters.forEach((filter, index) => {
        projectsByTerm[filter.tid] = lists[index].map(decodeStringFields)
    })

    return (
        <PreviousWorkFilter filters={filters} projectsByTerm={projectsByTerm} />
    )
}
