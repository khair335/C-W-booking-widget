import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { carouselDataSelector, fetchCarouselData} from '../../../LandingPage/LandingPage.duck';
import css from './CustomHeroSection.module.css';
import CustomHeroListing from './CustomHeroListing';
import { useIntl } from '../../../../util/reactIntl';
import Slider from "react-slick";
import Skeleton from '../../../../components/Skeleton/Skeleton';



const CustomHeroSection = () => {

  const intl = useIntl();
  const dispatch = useDispatch();
  const carouselData = useSelector(carouselDataSelector);

  const limitedCarouselData = (carouselData || []).slice(0, 10);

  useEffect(() => {
    dispatch(fetchCarouselData());
  }, []);

  const firstSliderRef = useRef();

  const sliderRefs = [firstSliderRef]; // Add more refs as needed

  // Create separate parent refs for each slider
  const firstParentRef = useRef(null);
  const parentRefs = [firstParentRef];

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
  }, [limitedCarouselData]);

  const settings = {
    className: "slider variable-width",
    dots: true,
    infinite: false,
    centerMode: false,
    slidesToShow: 1,
    slidesToScroll: 1,
    variableWidth: false,
    vertical: true,
    verticalSwiping: true,
    swipeToSlide: true,
    autoplay: true,
    autoplaySpeed: 2000,

    arrows: false,
    fade: true, // Add fade effect
    cssEase: 'linear', // Smooth transition
    responsive: [
      {
        breakpoint: 767,
        settings: {
          slidesToShow: 1,
          autoplay: false,
          vertical: false,
        },
      },
    ],
  };

  if (limitedCarouselData.length === 0) {
    return <div className={css.sliderContainer}>
      <div
        className={css.container}
      >
        <div className={css.content}>
          <div className={css.leftSection}>
            <Skeleton width="100%" height={'400px'} rounded={9} />
          </div>
          <div className={css.rightSection}>
            <Skeleton width="70%" height={'40px'} rounded={0} bottom={12} /><br />
            <Skeleton width="30%" height={'10px'} rounded={0} bottom={12} /><br />
            <Skeleton width="60%" height={'10px'} rounded={0} bottom={12} /><br />
            <Skeleton width="20%" height={'40px'} rounded={30} bottom={2} />
          </div>
        </div>
      </div>


    </div>;
  }


  return <div>
    <div className={css.sliderContainer} ref={firstParentRef}>
      <Slider {...settings} className={css.slider} ref={firstSliderRef}>
        {limitedCarouselData.map((data, index) => (
          <React.Fragment key={index}>
            <CustomHeroListing data={data} intl={intl} />
          </React.Fragment>
        ))}
      </Slider>
    </div>
  </div>;
};

export default CustomHeroSection;
