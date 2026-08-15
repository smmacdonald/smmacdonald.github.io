import Basic from "../blocks/Basic"
import FooterBrandAndSocial from "../blocks/FooterBrandAndSocial"
import { FooterBrandAndSocialProps } from "@/types/FooterBrandAndSocialProps"
import { BasicBlockProps } from "@/types/BasicBlockProps"

type FooterProps = {
    brand: FooterBrandAndSocialProps
    contact: BasicBlockProps
    legal: BasicBlockProps
}

export default function Footer({ brand, contact, legal }: FooterProps) {
    return (
        <footer className="site-footer">
            <div className="footer-main padding-top-bottom-90">
                <div className="container">
                    <div className="row">
                        <div className="col-md-5 mb-4">
                            <FooterBrandAndSocial {...brand} />
                        </div>
                        <div className="col-md-5 offset-md-2">
                            <Basic {...contact} />
                        </div>
                    </div>
                </div>
            </div>
            <div className="footer-bottom">
                <div className="container">
                    <div className="row">
                        <div className="col">
                            <div className="copyright-container padding-top-bottom-30">
                                <Basic {...legal} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}