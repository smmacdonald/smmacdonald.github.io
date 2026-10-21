import SiteLogo from "../blocks/SiteLogo"
import Menu from "../navigation/Menu"
import StickyHeader from "./StickyHeader"
import { SiteLogoProps } from "@/types/SiteLogoProps"
import { MenuProps } from "@/types/MenuProps"

type HeaderProps = {
    logo: SiteLogoProps
    mainMenu: MenuProps
    mobileToggle: MenuProps
}

export default function Header({ logo, mainMenu, mobileToggle }: HeaderProps) {
    return (
        <StickyHeader>
            <div className="container">
                <div className="row">
                    <div className="col">
                        <SiteLogo {...logo} />
                    </div>
                    <div className="col">
                        <div className="nav-wrap-main">
                            <Menu data={mainMenu} />
                        </div>
                        <div className="nav-wrap-mobile">
                            <Menu data={mobileToggle} />
                        </div>
                    </div>
                </div>
            </div>
        </StickyHeader>
    )
}
