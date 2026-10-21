"use client"

import { useState } from "react"

/** Handles submitting the contact form; the fields themselves are rendered on the server. */
export default function ContactFormShell({
    children,
}: {
    children: React.ReactNode
}) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [error, setError] = useState("")

    async function handleSubmit(
        event: Parameters<
            NonNullable<React.ComponentProps<"form">["onSubmit"]>
        >[0]
    ) {
        event.preventDefault()

        if (isSubmitting) return

        setIsSubmitting(true)
        setSubmitted(false)
        setError("")

        const formElement = event.currentTarget
        const formData = new FormData(formElement)
        const values: Record<string, string> = {}

        formData.forEach((value, key) => {
            values[key] = value.toString()
        })

        if (values.hidden_fields) {
            console.log("There was a problem submitting the form.")
            setError("There was a problem submitting the form.")
            setIsSubmitting(false)
            return
        }

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_LOCAL_API_URL}/webform_rest/submit`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    body: JSON.stringify({
                        webform_id: "contact",
                        ...values,
                    }),
                }
            )

            const responseText = await response.text()

            if (!response.ok) {
                throw new Error(
                    responseText || `Drupal returned ${response.status}`
                )
            }

            setSubmitted(true)
            formElement.reset()
        } catch (err) {
            console.error("SUBMIT ERROR:", err)

            setError(
                err instanceof Error
                    ? err.message
                    : "There was a problem submitting the form."
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} id="contact">
            {submitted && (
                <div className="alert alert-success" role="alert">
                    Your message has been sent successfully.
                </div>
            )}

            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            {children}
        </form>
    )
}
