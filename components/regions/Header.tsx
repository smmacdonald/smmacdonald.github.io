"use client"

import { useState, useEffect } from 'react';

import SiteLogo from "../blocks/SiteLogo"
import Menu from "../navigation/Menu"
// import { HeaderProps } from '@/types/HeaderProps';
import { SiteLogoProps } from '@/types/SiteLogoProps';
import { MenuProps } from '@/types/MenuProps';

type HeaderProps = {
    logo: SiteLogoProps
    mainMenu: MenuProps
    mobileToggle: MenuProps
}

export default function Header({ logo, mainMenu, mobileToggle }: HeaderProps) {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const checkScroll = () => {
            if (window.scrollY > 10) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };
        checkScroll();

        window.addEventListener('scroll', checkScroll);
        return () => window.removeEventListener('scroll', checkScroll);
    }, []);

    return (
        <header className={`site-header ${isScrolled ? 'sticky' : ''}`}>
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
        </header>
    )
}