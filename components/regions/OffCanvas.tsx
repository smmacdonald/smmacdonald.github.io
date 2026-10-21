import SiteLogo from "../blocks/SiteLogo"
import Menu from "../navigation/Menu"
import OffCanvasPanel from "./OffCanvasPanel"
import { SiteLogoProps } from "@/types/SiteLogoProps"
import { MenuProps } from "@/types/MenuProps"

type OffCanvasProps = {
    logo: SiteLogoProps
    mainMenu: MenuProps
    mobileToggle: MenuProps
}

export default function OffCanvas({
    logo,
    mainMenu,
    mobileToggle,
}: OffCanvasProps) {
    return (
        <OffCanvasPanel>
            <SiteLogo {...logo} />
            <div className="menu-toggle-wrapper">
                <Menu data={mobileToggle} />
            </div>
            <div className="off-canvas-menu">
                <Menu data={mainMenu} />
            </div>
        </OffCanvasPanel>
    )
}
