import { MenuProps } from "@/types/MenuProps"
import MenuItem from "./MenuItem"

type Props = {
    data: MenuProps
    level?: number
}

export default function Menu({ data, level = 0 }: Props) {
    return (
        <div className="menu-wrapper">

            {level === 0 && (
                <div className="menu--tile d-none">
                    {data.name}
                </div>
            )}

            <ul className={`menu-items menu-level-0 list-unstyled ${data.name.toLowerCase().replace(/\s+/g, '-')}`}>
                {data.items.map((item, index) => (
                    <MenuItem
                        key={index}
                        item={item}
                        level={level}
                    />
                ))}
            </ul>

        </div>
    )
}