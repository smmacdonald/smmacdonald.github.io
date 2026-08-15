"use client"

import Slider from "react-slick";
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"
import Image from "next/image";

type PortfolioSliderProps = {
    data: string
    autoplay: string
    show: string
    scroll: string
}

export default function PortfolioSlider({ data, autoplay, show, scroll }: PortfolioSliderProps) {
    const settings = {
        dots: true,
        infinite: true,
        autoplay: autoplay == "1" ? true : false,
        speed: 500,
        slidesToShow: Number(show),
        slidesToScroll: Number(scroll)
    };
    const path = process.env.NEXT_PUBLIC_LOCAL_API_URL

    return (
        <Slider {...settings}>
            {data.split(',').map((item: string, index: number) => {
                return (
                    <Image
                        key={index}
                        src={path + item.trim()}
                        height={400}
                        width={600}
                        alt=""
                        unoptimized />
                )
            })}
        </Slider>
    )
}
