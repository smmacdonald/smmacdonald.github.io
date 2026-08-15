import { MenuItemProps } from "@/types/MenuItemProps"
import Link from "next/link"

type Props = {
    item: MenuItemProps
    level: number
}

export default function MenuItem({ item, level }: Props) {
    const hasChildren = item.children?.length > 0

    return (
        <li className="menu__item">

            <Link
                href={item.url ? item.url : "#"}
                title={item.title.toLowerCase().replace(/\s+/g, '-')}
                className={`menu__link ${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
                {item.title}
            </Link>

            {hasChildren && (
                <ul className={`menu menu-level-${level + 1} list-unstyled dropdown-list `}>
                    {item.children.map((child, index) => (
                        <MenuItem
                            key={index}
                            item={child}
                            level={level + 1}
                        />
                    ))}
                </ul>
            )}

        </li>
    )
}