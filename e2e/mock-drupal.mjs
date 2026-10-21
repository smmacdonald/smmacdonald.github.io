// A tiny stand-in for the Drupal backend, used so builds and E2E tests never
// depend on a live site.
//
//   serve mode (default): answers from e2e/fixtures
//   record mode (E2E_RECORD=<drupal origin>): proxies to the real Drupal and
//   saves each response as a fixture
import http from "node:http"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const FIXTURES = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    "fixtures"
)
const ORIGIN_TOKEN = "__ORIGIN__"

const PLACEHOLDER_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="#4a4a4a"/></svg>'

const sanitize = (value) =>
    value.replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_|_$/g, "")

function fixtureFile(request, bodyText) {
    const url = new URL(request.url, "http://mock")

    if (url.pathname === "/graphql") {
        const { query = "", variables = {} } = JSON.parse(bodyText || "{}")
        const operation =
            /(?:query|mutation)\s+(\w+)/.exec(query)?.[1] ?? "anonymous"
        const suffix = Object.values(variables)
            .map((v) => sanitize(String(v)))
            .join("-")
        return path.join(
            FIXTURES,
            "graphql",
            `${operation}${suffix ? "--" + suffix : ""}.json`
        )
    }

    return path.join(
        FIXTURES,
        "rest",
        `${sanitize(url.pathname + url.search) || "root"}.json`
    )
}

const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "content-type, accept",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
}

function readBody(request) {
    return new Promise((resolve) => {
        const chunks = []
        request.on("data", (chunk) => chunks.push(chunk))
        request.on("end", () => resolve(Buffer.concat(chunks).toString()))
    })
}

const escapeSlashes = (value) => value.replaceAll("/", "\\/")

/**
 * Pass `port: 0` to get a free port. Next caches build-time fetches by URL in
 * .next/cache, so a fresh origin per run guarantees a fixture change is seen.
 */
export function startMockDrupal({
    port = 0,
    record = process.env.E2E_RECORD,
} = {}) {
    let ownOrigin = ""

    const server = http.createServer(async (request, response) => {
        const url = new URL(request.url, "http://mock")

        if (process.env.E2E_DEBUG)
            console.log(`[mock-drupal] ${request.method} ${request.url}`)

        if (request.method === "OPTIONS") {
            response.writeHead(204, cors).end()
            return
        }

        // Uploaded media: a neutral placeholder keeps layout realistic.
        if (url.pathname.startsWith("/sites/")) {
            response
                .writeHead(200, { ...cors, "Content-Type": "image/svg+xml" })
                .end(PLACEHOLDER_SVG)
            return
        }

        // Form submissions are never sent anywhere or recorded.
        if (url.pathname === "/webform_rest/submit") {
            response
                .writeHead(200, { ...cors, "Content-Type": "application/json" })
                .end('{"sid":"1"}')
            return
        }

        const bodyText =
            request.method === "POST" ? await readBody(request) : ""
        const file = fixtureFile(request, bodyText)

        try {
            if (record) {
                const upstream = await fetch(record + request.url, {
                    method: request.method,
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    body: request.method === "POST" ? bodyText : undefined,
                })
                const text = await upstream.text()
                if (!upstream.ok)
                    throw new Error(
                        `upstream ${upstream.status} for ${request.url}`
                    )
                const portable = text
                    .replaceAll(record, ORIGIN_TOKEN)
                    .replaceAll(
                        escapeSlashes(record),
                        escapeSlashes(ORIGIN_TOKEN)
                    )
                    // Drupal behind a non-standard port (e.g. DDEV) strips the host but
                    // leaves ":<port>" on relative URLs; make them plain paths.
                    .replace(/"url":":\d+(\\?\/)/g, '"url":"$1')
                fs.mkdirSync(path.dirname(file), { recursive: true })
                // Pretty-print so a re-recording produces small, reviewable diffs.
                fs.writeFileSync(
                    file,
                    JSON.stringify(JSON.parse(portable), null, 4) + "\n"
                )
                console.log(
                    `[mock-drupal] recorded ${path.relative(FIXTURES, file)}`
                )
            }

            let stored = fs.readFileSync(file, "utf8")

            // Reproduce a Drupal that returns an empty breadcrumb trail for some
            // pages (seen in production): E2E_EMPTY_BREADCRUMBS="/about,/portfolio".
            const emptyTrails = (process.env.E2E_EMPTY_BREADCRUMBS ?? "")
                .split(",")
                .filter(Boolean)
            if (emptyTrails.length && url.pathname === "/graphql") {
                const requested = JSON.parse(bodyText || "{}").variables?.path
                if (emptyTrails.includes(requested)) {
                    const result = JSON.parse(stored)
                    if (result.data?.route) result.data.route.breadcrumbs = []
                    stored = JSON.stringify(result)
                }
            }

            response
                .writeHead(200, { ...cors, "Content-Type": "application/json" })
                .end(
                    stored
                        .replaceAll(ORIGIN_TOKEN, ownOrigin)
                        .replaceAll(
                            escapeSlashes(ORIGIN_TOKEN),
                            escapeSlashes(ownOrigin)
                        )
                )
        } catch (error) {
            console.error(
                `[mock-drupal] no fixture for ${request.method} ${request.url}: ${error.message}`
            )
            response
                .writeHead(404, { ...cors, "Content-Type": "application/json" })
                .end(JSON.stringify({ error: "no fixture" }))
        }
    })

    return new Promise((resolve) =>
        server.listen(port, "127.0.0.1", () => {
            ownOrigin = `http://127.0.0.1:${server.address().port}`
            resolve({ server, origin: ownOrigin })
        })
    )
}
