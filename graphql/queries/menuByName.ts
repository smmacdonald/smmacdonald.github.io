import { gql } from "graphql-tag"
import menuItemFields from "../fragments/menuItem"

export default gql`
  query Menus($name: MenuAvailable!) {
    menu(name: $name) {
      name
      items {
        ...menuItemFields
        children {
          ...menuItemFields
          children {
            ...menuItemFields
          }
        }
      }
    }
  }
  ${menuItemFields}
`