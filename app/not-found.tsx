import Link from "next/link"

export default function NotFound() {
    return (
        <section className="container py-5">
            <h1>Page not found</h1>
            <p>The page you are looking for does not exist or has moved.</p>
            <Link href="/">Return home</Link>
        </section>
    )
}
