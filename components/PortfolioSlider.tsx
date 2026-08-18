"use client"

import Slider from "react-slick"
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"
import Image from "next/image"

type PortfolioSliderProps = {
    data: string
    autoplay: string
    show: string
    scroll: string
}

export default function PortfolioSlider({ data, autoplay, show, scroll }: PortfolioSliderProps) {
    const toShow = Number(show)
    const toScroll = Number(scroll)
    const settings = {
        dots: true,
        infinite: true,
        autoplay: autoplay == "1" ? true : false,
        speed: 500,
        slidesToShow: toShow,
        slidesToScroll: toScroll,
        responsive: [
            {
                breakpoint: 992,
                settings: {
                    slidesToShow: toShow >= 3 ? 2 : toShow,
                    slidesToScroll: toScroll >= 3 ? 2 : toScroll
                }
            },
            {
                breakpoint: 576,
                settings: {
                    slidesToShow: toShow >= 3 ? 1 : toShow,
                    slidesToScroll: toScroll >= 3 ? 1 : toScroll
                }
            }
        ]
    }

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
