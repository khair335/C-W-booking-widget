import React, { useEffect, useState, useRef } from 'react';
import Slider from 'react-slick';
import css from './CreatorSpotlight.module.css';
import { Button, CustomArrow, ResponsiveImage } from '../../../../components';
import { useDispatch, useSelector } from 'react-redux';
import { featuredCreatorsSelector, fetchFeaturedCreators } from '../../../LandingPage/LandingPage.duck';
import { createResourceLocatorString } from '../../../../util/routes';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import { useRouteConfiguration } from '../../../../context/routeConfigurationContext';
import classNames from 'classnames';
import IconCollection from '../../../../components/IconCollection/IconCollection';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Mousewheel, Keyboard } from 'swiper/modules';


const CreatorSpotlight = ({ sectionTitle = "", sectionName, description }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const routeConfiguration = useRouteConfiguration();
  const featuredCreatorsData = useSelector(featuredCreatorsSelector);

  const [screenWidth, setScreenWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [slideCount, setSlideCount] = React.useState(0);

  useEffect(() => {
    dispatch(fetchFeaturedCreators());
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setScreenWidth(window.innerWidth);
      console.log('Screen width:', window.innerWidth);
    };

    window.addEventListener('resize', handleResize);

    // Initial log
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const bookPlaceholderImage = 'https://placehold.co/150x200.png'; // book placeholder image

  const featuredCreators = (featuredCreatorsData || []).map(creator => {
    const {
      attributes: { profile },
    } = creator;
    const { firstName = '', lastName = '', publicData } = profile || {};
    const { marketingBannerUrls = [], userProfileImage, displayName = '', userName, marketingPosters, } = publicData || {};

    return {
      id: creator?.id?.uuid,
      name: displayName || `${firstName} ${lastName}`,
      username: userName,
      image: userProfileImage?.key,
      marketingPosters,
      realUserName: userName,
    };
  });

  useEffect(() => {
    setSlideCount(featuredCreators.length);
    setCurrentSlide(0);
  }, [featuredCreators]);

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
  }, [featuredCreators]);

  const settings = {
    className: "slider variable-width",
    dots: false,
    infinite: featuredCreators?.length > 4,
    centerMode: false,
    slidesToShow: 1,
    slidesToScroll: 1,
    swipe: false,
    variableWidth: true,
    swipeToSlide: false,
    cssEase: "linear",
    prevArrow: <CustomArrow direction="prev" disabled={currentSlide === 0} />,
    nextArrow: <CustomArrow direction="next" disabled={currentSlide >= slideCount - 4} />, // Assuming 4 visible items
    beforeChange: (current, next) => setCurrentSlide(next),
    afterChange: current => setCurrentSlide(current),
    onInit: () => setSlideCount(featuredCreators?.length),
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

  const routeToProfilePage = (id, username) =>
    history.push(createResourceLocatorString('ProfilePage', routeConfiguration, { id, username }, {}));

  if (!featuredCreators?.length) {
    return null;
  }

  return (
    <section className={css.creatorSpotlight}>
      <div className={css.creatorSpotlightContainer}>
        <div className={css.content}>
          <h2 className={css.tagline}>{sectionTitle}</h2>
          <h1 className={css.title}>{sectionName}</h1>
          <p className={css.description}>{description}</p>
          <Button className={css.button}>
            <span>Button</span>
          </Button>
        </div>

        <div className={css.sliderContainer} ref={firstParentRef}>
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
            {featuredCreators.map(creator => (
              <SwiperSlide style={{ width: screenWidth < 768 ? 294 : 340 }} key={creator?.id}>
                <div
                  key={creator?.id}
                  className={css.creatorCard}
                  onClick={() => routeToProfilePage(creator?.id, creator?.realUserName)}
                  style={{ width: screenWidth < 768 ? 294 : 340 }}
                >
                  <div className={css.creatorCardContent}>
                    <div className={css.creatorInfo}>
                      <ResponsiveImage
                        alt={creator.name}
                        className={css.creatorImage}
                        variants={['default']}
                        gumletImage={{
                          sourceUrl: process.env.REACT_APP_GUMLET_SOURCE_URL,
                          key: creator.image,
                        }}
                        transformWidth={500}
                      />
                      <div className={css.creatorInfoContent}>
                        <p className={css.usernameDesktop}>{creator.username}</p>
                        <h3 className={css.creatorName}>{creator.name}</h3>
                      </div>
                    </div>
                    <div className={css.bookGridContainer}>
                      <div className={classNames(css.bookGrid, creator.marketingPosters?.length > 2 && css.bookGridThree)}>
                        {creator.marketingPosters?.length > 0
                          ? creator.marketingPosters
                            .slice(-3) // Get last 3 elements
                            .reverse() // Reverse the sliced array
                            .map((el, index) => (
                              <ResponsiveImage
                                key={index}
                                url={el}
                                alt={creator.username}
                                className={css.bookCover}
                              />
                            ))
                          : <div className={css.smallImgPlaceholder}>
                            <IconCollection icon="coming-soon-media" />
                            <p>Content Coming Soon</p>
                          </div>}
                      </div>
                    </div>
                  </div>
                  <p className={css.usernameMobile}>{creator.username}</p>
                </div>

              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default CreatorSpotlight;