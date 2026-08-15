"use client"

import Slider from "react-slick";
import ParagraphImage from "./ParagraphImage"

import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"
import { ParagraphSliderProps } from "@/types/ParagraphSliderProps";

export default function ParagraphSlider(data: ParagraphSliderProps) {
    const settings = {
        dots: true,
        infinite: true,
        autoplay: data.autoplay,
        speed: 500,
        slidesToShow: Number(data.slidesToShow),
        slidesToScroll: Number(data.slidesToScroll)
    };

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
