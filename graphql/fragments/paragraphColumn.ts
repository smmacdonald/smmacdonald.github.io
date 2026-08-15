import { gql } from "graphql-tag"
import paragraphImageFields from "./paragraphImage"
import paragraphTextFields from "./paragraphText"
import paragraphSliderFields from "./paragraphSlider"

export default gql`
  fragment paragraphColumnFields on ParagraphColumn {
    __typename
    id
    bgColor
    sectionId
    columnWidth
    styledBox
    element {
      ...paragraphImageFields
      ...paragraphTextFields
      ...paragraphSliderFields
    }
  }
  ${paragraphImageFields}
  ${paragraphTextFields}
  ${paragraphSliderFields}
`