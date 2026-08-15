"use client"

import { useState, useEffect } from "react";

import SiteLogo from "../blocks/SiteLogo"
import Menu from "../navigation/Menu"
import { SiteLogoProps } from "@/types/SiteLogoProps";
import { MenuProps } from "@/types/MenuProps";

type OffCanvasProps = {
    logo: SiteLogoProps
    mainMenu: MenuProps
    mobileToggle: MenuProps
}

export default function OffCanvas({ logo, mainMenu, mobileToggle }: OffCanvasProps) {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleClick = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (target.closest(".mobile-menu-toggle")) {
                setIsOpen(prevOpen => !prevOpen);
            }
        };

        document.addEventListener("click", handleClick);

        return () => {
            document.removeEventListener("click", handleClick);
        };
    }, []);

    return (
        <div className={`off-canvas${isOpen ? ' active' : ''}`}>
            <div className="off-canvas-wrap">
                <SiteLogo {...logo} />
                <div className="menu-toggle-wrapper">
                    <Menu data={mainMenu} />
                </div>
                <div className="off-canvas-menu">
                    <Menu data={mobileToggle} />
                </div>
            </div>
        </div>
    )
}