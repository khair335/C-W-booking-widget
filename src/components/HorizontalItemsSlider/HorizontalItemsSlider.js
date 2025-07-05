import React, { useEffect, useRef, useState, useCallback } from 'react';
import Slider from "react-slick";
import CustomArrow from '../CustomArrow/CustomArrow';
import css from './HorizontalItemsSlider.module.css';
import { normalizeText } from '../../util/data';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Mousewheel, Keyboard } from 'swiper/modules';


const HorizontalItemsSlider = ({ items, onClick }) => {
    const firstSliderRef = useRef(null);
    const firstParentRef = useRef(null);
    const [currentSlide, setCurrentSlide] = useState(0);

    // Scroll Handler (Memoized)
    const handleScroll = useCallback((e) => {
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
            e.preventDefault();
            const slider = firstSliderRef.current?.innerSlider?.list;
            if (slider && slider.contains(e.target)) {
                e.deltaX > 0 ? firstSliderRef.current.slickNext() : firstSliderRef.current.slickPrev();
            }
        }
    }, []);

    // Attach/Detach Scroll Event
    useEffect(() => {
        const parent = firstParentRef.current;
        if (parent) {
            parent.addEventListener("wheel", handleScroll, { passive: false });
            return () => parent.removeEventListener("wheel", handleScroll);
        }
    }, [handleScroll]);

    const settingsCarousel = {
        className: "slider variable-width",
        dots: false,
        infinite: false,
        centerMode: false,
        slidesToShow: 1,
        slidesToScroll: 1,
        variableWidth: true,
        swipeToSlide: false,
        swipe: false,
        prevArrow: <CustomArrow direction="prev" disabled={currentSlide === 0} />,
        nextArrow: <CustomArrow direction="next" disabled={currentSlide >= items.length - 4} />, // Assuming 4 visible items
        beforeChange: (_, next) => setCurrentSlide(next),
        afterChange: (current) => setCurrentSlide(current),
        responsive: [
            {
                breakpoint: 1023,
                settings: {
                    slidesToShow: 1,
                    arrows: false,
                    swipe: true,
                    swipeToSlide: true,
                },
            },
        ],
    };

    return (
        <div className={css.horizontalItemsContainer}>
            <div className={css.horizontalItemsSlider} ref={firstParentRef}>
                <Swiper
                    cssMode={true}
                    navigation={true}
                    pagination={true}
                    mousewheel={true}
                    keyboard={true}
                    dots={false}
                    slidesPerView={'auto'}
                    modules={[Navigation, Mousewheel, Keyboard]}
                    className="mySwiper"
                >
                    {items.map((item, index) => (
                        <SwiperSlide key={index}>

                            <div key={index} className={css.itemsWrapper}>
                                <button className={css.pill} onClick={() => onClick(item)}>
                                    {normalizeText(item)}
                                </button>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </div>
    );
};

export default HorizontalItemsSlider;
