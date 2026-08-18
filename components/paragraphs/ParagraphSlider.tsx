"use client"

import Slider from "react-slick"
import ParagraphImage from "./ParagraphImage"

import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"
import { ParagraphSliderProps } from "@/types/ParagraphSliderProps"

export default function ParagraphSlider(data: ParagraphSliderProps) {
    const show = Number(data.slidesToShow)
    const scroll = Number(data.slidesToScroll)

    const settings = {
        dots: true,
        infinite: true,
        autoplay: data.autoplay,
        speed: 500,
        slidesToShow: show,
        slidesToScroll: scroll,
        responsive: [
            {
                breakpoint: 992,
                settings: {
                    slidesToShow: show >= 3 ? 2 : show,
                    slidesToScroll: scroll >= 3 ? 2 : scroll
                }
            },
            {
                breakpoint: 576,
                settings: {
                    slidesToShow: show >= 3 ? 1 : show,
                    slidesToScroll: scroll >= 3 ? 1 : scroll
                }
            }
        ]
    }

    return (
        <Slider {...settings}>
            {data.slide?.map((item, index: number) => {
                return (
                    <ParagraphImage
                        key={index}
                        {...item} />
                )
            })}
        </Slider>
    )
}
