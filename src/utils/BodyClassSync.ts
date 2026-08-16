'use client';

import { useEffect } from 'react';

export default function BodyClassSync({ title }: { title: string }) {
    useEffect(() => {
        if (!title) return;

        const safeClass = title.toLowerCase().replace(/[^a-z0-9]/g, '-');
        document.body.classList.add(`page-${safeClass}`);

        // Clean up the class if the user navigates away
        return () => {
            document.body.classList.remove(`page-${safeClass}`);
        };
    }, [title]);

    return null; // This component doesn't render any HTML
}