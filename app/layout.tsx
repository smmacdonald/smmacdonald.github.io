import type { Metadata } from "next"

import "@/assets/scss/styles.scss"
import { getSiteInfo } from "@/lib/getSiteInfo"

import Header from "@/components/regions/Header"
import Footer from "@/components/regions/Footer"
import OffCanvas from "@/components/regions/OffCanvas"

export const metadata: Metadata = {
    metadataBase: new URL("https://smmacdonald.github.io/"),
}

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    const siteInfo = await getSiteInfo()
    return (
        <html lang="en" data-scroll-behavior="smooth">
            <body>
                <a
                    href="#main-content"
                    className="skip-link visually-hidden-focusable"
                >
                    Skip to main content
                </a>
                <Header
                    logo={siteInfo.data.logo}
                    mainMenu={siteInfo.data.main}
                    mobileToggle={siteInfo.data.menuToggle}
                />

                <main id="main-content" tabIndex={-1}>
                    {children}
                </main>

                <Footer
                    brand={siteInfo.data.footerBrand}
                    contact={siteInfo.data.contactCTA}
                    legal={siteInfo.data.copyright}
                />
                <OffCanvas
                    logo={siteInfo.data.logo}
                    mainMenu={siteInfo.data.main}
                    mobileToggle={siteInfo.data.menuToggle}
                />
            </body>
        </html>
    )
}
