"use client"

export default function Error({
    retry,
}: {
    error: unknown
    retry: () => void
}) {
    return (
        <section className="container py-5" role="alert">
            <h1>Something went wrong</h1>
            <p>This page could not be loaded. Please try again.</p>
            <button type="button" className="button transparent" onClick={() => retry()}>
                Try again
            </button>
        </section>
    )
}
