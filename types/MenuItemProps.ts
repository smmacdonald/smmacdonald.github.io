export type MenuItemProps = {
    url: string
    title: string
    internal: boolean
    children: MenuItemProps[]
}