import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
    title: "Page not found | portfolio",
}

export default function NotFound() {
    return (
        <section className="container py-5">
            <h1>Page not found</h1>
            <p>The page you are looking for does not exist or has moved.</p>
            <Link href="/">Return home</Link>
        </section>
    )
}
