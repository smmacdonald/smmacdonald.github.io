const NAMED_ENTITIES: Record<string, string> = {
    amp: "&",
    lt: "<",
    gt: ">",
    quot: '"',
    apos: "'",
    nbsp: " ",
    ndash: "–",
    mdash: "—",
    hellip: "…",
    lsquo: "‘",
    rsquo: "’",
    ldquo: "“",
    rdquo: "”",
    bull: "•",
    middot: "·",
    laquo: "«",
    raquo: "»",
    copy: "©",
    reg: "®",
    trade: "™",
    euro: "€",
    pound: "£",
    yen: "¥",
    cent: "¢",
    deg: "°",
    times: "×",
    divide: "÷",
    eacute: "é",
    egrave: "è",
    agrave: "à",
    aacute: "á",
    ccedil: "ç",
    ntilde: "ñ",
    ouml: "ö",
    uuml: "ü",
    auml: "ä",
}

/**
 * Turn the HTML entities in plain text back into characters ("Earth &amp; Sky"
 * becomes "Earth & Sky"). Drupal's REST views HTML-escape every field, but the
 * values are rendered as text (and used in URLs), where the escapes would show
 * literally. Decodes once, so `&amp;amp;` becomes `&amp;`; entities that are
 * not recognised are left as they are.
 *
 * Only use this on plain-text fields. Fields that hold HTML (rich text) are
 * meant to be rendered by the browser as they are.
 */
export function decodeHtmlEntities(text: string): string {
    return text.replace(
        /&(#x[0-9a-f]+|#\d+|[a-z][a-z0-9]*);/gi,
        (match, entity: string) => {
            if (entity[0] === "#") {
                const code =
                    entity[1].toLowerCase() === "x"
                        ? parseInt(entity.slice(2), 16)
                        : parseInt(entity.slice(1), 10)

                return code > 0 && code <= 0x10ffff
                    ? String.fromCodePoint(code)
                    : match
            }

            return (
                NAMED_ENTITIES[entity] ??
                NAMED_ENTITIES[entity.toLowerCase()] ??
                match
            )
        }
    )
}

/** Decode the entities in every string property of a plain-text record. */
export function decodeStringFields<T extends object>(item: T): T {
    return Object.fromEntries(
        Object.entries(item).map(([key, value]) => [
            key,
            typeof value === "string" ? decodeHtmlEntities(value) : value,
        ])
    ) as T
}
