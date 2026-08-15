import { gql } from "graphql-tag"
import paragraphImageFields from "./paragraphImage"

export default gql`
    fragment paragraphSliderFields on ParagraphSlider {
        __typename
        id
        sectionId
        autoplay
        slidesToScroll
        slidesToShow
        slide {
            ...paragraphImageFields
        }
    }
    ${paragraphImageFields}
`