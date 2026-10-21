export type PreviousWorkFilterProps = {
    name: string
    count: string
    tid: string
}

export type PreviousWorkProjectProps = {
    field_media: string
    field_slider: string
    field_tags: string
    title: string
}

/** Archived projects keyed by filter term id; `all` holds the unfiltered list. */
export type PreviousWorkProjectsByTerm = Record<
    string,
    PreviousWorkProjectProps[]
>
