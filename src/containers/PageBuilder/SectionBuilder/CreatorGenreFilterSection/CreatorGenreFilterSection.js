
import React, { useState, useEffect, useRef } from 'react';
import { CREATORS_LANDING_PAGE_SECTIONS } from '../../../../constants';
import Slider from "react-slick";
import { CustomArrow } from '../../../../components';
import css from './CreatorGenreFilterSection.module.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation,  Mousewheel, Keyboard } from 'swiper/modules';


const CreatorGenreFilterSection = () => {

  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [slideCount, setSlideCount] = React.useState(0);
  const [screenWidth, setScreenWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);
  const firstSliderRef = useRef();
  const sliderRefs = [firstSliderRef]; // Add more refs as needed

  // Create separate parent refs for each slider
  const firstParentRef = useRef(null);

  const parentRefs = [firstParentRef];


  useEffect(() => {
    setSlideCount(CREATORS_LANDING_PAGE_SECTIONS.length);
    setCurrentSlide(0);
  }, [CREATORS_LANDING_PAGE_SECTIONS]);


  useEffect(() => {
    // Set up scroll handlers for each parent container
    parentRefs.forEach((parentRef, index) => {
      if (!parentRef.current) return;

      const handleScroll = e => {
        // Only handle horizontal scrolling gestures
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
          e.preventDefault(); // Prevent default scroll behavior

          // Get the element that triggered the event
          const target = e.target;

          // Get corresponding slider ref for this parent
          const sliderRef = sliderRefs[index];

          if (sliderRef?.current && sliderRef.current.innerSlider.list.contains(target)) {
            if (e.deltaX > 0) {
              sliderRef.current?.slickNext();
            } else if (e.deltaX < 0) {
              sliderRef.current?.slickPrev();
            }
          }
        }
      };

      const element = parentRef.current;
      element.addEventListener("wheel", handleScroll, { passive: false });

      return () => {
        element.removeEventListener("wheel", handleScroll);
      };
    });
  }, [CREATORS_LANDING_PAGE_SECTIONS]);



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
    nextArrow: <CustomArrow direction="next" disabled={currentSlide >= slideCount - 4} />, // Assuming 4 visible items
    beforeChange: (current, next) => setCurrentSlide(next),
    afterChange: current => setCurrentSlide(current),
    onInit: () => setSlideCount(CREATORS_LANDING_PAGE_SECTIONS.length),
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


  // currently using dummy data will update later
  return <div className={css.creatorGenreFilterSection}>
    <div className={css.creatorGenreFilterSectionSlider} ref={firstParentRef}>
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

        {CREATORS_LANDING_PAGE_SECTIONS.map((item) => {
          return (
            <SwiperSlide>
              <div className={css.itemsWrapper}>
                <div className={css.creatorGenreFilterSectionSliderItem}>{item}</div>
              </div>
            </SwiperSlide>
          )
        })}
      </Swiper>
    </div>
  </div>;
};

export default CreatorGenreFilterSection;
