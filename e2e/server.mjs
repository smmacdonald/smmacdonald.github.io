// Builds the static site against the mock Drupal and serves it the way GitHub
// Pages does (clean URLs, 404.html with a 404 status). Used by Playwright's
// webServer, and runnable by hand: node e2e/server.mjs
import http from "node:http"
import fs from "node:fs"
import path from "node:path"
import { spawn } from "node:child_process"
import { startMockDrupal } from "./mock-drupal.mjs"

const SITE_PORT = Number(process.env.E2E_SITE_PORT ?? 4011)
// Kept apart from .next so a running `next dev` is not disturbed.
const DIST_DIR = ".next-e2e"
const OUT_DIR = path.resolve(DIST_DIR)

const TYPES = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".txt": "text/plain; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".ico": "image/x-icon",
    ".woff2": "font/woff2",
    ".ttf": "font/ttf",
}

// `node e2e/server.mjs --record <drupal origin>` re-records the fixtures.
const recordAt = process.argv.indexOf("--record")
if (recordAt !== -1) {
    process.env.E2E_RECORD = process.argv[recordAt + 1]
    if (!process.env.E2E_RECORD)
        throw new Error(
            "--record needs the Drupal origin, e.g. https://example.ddev.site"
        )
}

const { origin } = await startMockDrupal()
console.log(`[e2e] mock Drupal on ${origin}`)

if (!process.env.E2E_SKIP_BUILD) {
    // Always build from scratch: a stale build cache would hide fixture changes.
    if (path.basename(OUT_DIR) === DIST_DIR) {
        fs.rmSync(OUT_DIR, { recursive: true, force: true })
    }

    await new Promise((resolve, reject) => {
        const build = spawn("npx", ["next", "build"], {
            stdio: "inherit",
            env: {
                ...process.env,
                NODE_ENV: "production",
                NEXT_DIST_DIR: DIST_DIR,
                NEXT_PUBLIC_LOCAL_API_URL: origin,
                NEXT_PUBLIC_LOCAL_API_GRAPHQL_URL: `${origin}/graphql`,
            },
        })
        build.on("exit", (code) =>
            code === 0
                ? resolve()
                : reject(new Error(`next build exited with ${code}`))
        )
    })
}

if (process.env.E2E_RECORD) {
    console.log("[e2e] fixtures recorded")
    process.exit(0)
}

function resolveFile(urlPath) {
    const clean =
        decodeURIComponent(urlPath.split("?")[0]).replace(/\/+$/, "") ||
        "/index"
    for (const candidate of [clean, `${clean}.html`, `${clean}/index.html`]) {
        const file = path.join(OUT_DIR, candidate)
        if (
            file.startsWith(OUT_DIR) &&
            fs.existsSync(file) &&
            fs.statSync(file).isFile()
        )
            return file
    }
    return null
}

http.createServer((request, response) => {
    const file = resolveFile(request.url)
    const target = file ?? path.join(OUT_DIR, "404.html")
    response.writeHead(file ? 200 : 404, {
        "Content-Type":
            TYPES[path.extname(target)] ?? "application/octet-stream",
    })
    fs.createReadStream(target).pipe(response)
}).listen(SITE_PORT, "127.0.0.1", () =>
    console.log(`[e2e] site on http://127.0.0.1:${SITE_PORT}`)
)
