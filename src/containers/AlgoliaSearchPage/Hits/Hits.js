import React, { useEffect, useRef, useState } from 'react';
import { useHits, useInstantSearch } from 'react-instantsearch';
import ListingHit from './ListingHit';
import CreatorHit from './CreatorHit';
import Slider from "react-slick";
import css from './Hits.module.css';
import { Button, CustomArrow } from '../../../components';
import { hitsViewed } from '../../../util/searchInsight';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Mousewheel, Keyboard } from 'swiper/modules';


const listingIndex = process.env.REACT_APP_ALGOLIA_LISTINGS_INDEX;
const creatorIndex = process.env.REACT_APP_ALGOLIA_USERS_INDEX;

function CustomHits(props) {
  const {
    routeConfiguration,
    history,
    indexName,
    intl,
    isLandingPage,
    currentUser,
    setNbHits = () => { },
    searchId = null
  } = props;

  const { items, results, sendEvent } = useHits(props);
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [slideCount, setSlideCount] = React.useState(0);
  const [screenWidth, setScreenWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);
  const { results: countResults } = useInstantSearch();
  const { nbHits = 0 } = countResults;

  useEffect(() => {
    setNbHits(nbHits);
  }, [nbHits > 0]);

  const queryID = results && results.queryID;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setScreenWidth(window.innerWidth);

    };

    window.addEventListener('resize', handleResize);

    // Initial log
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const itemsLength = items.length;
  useEffect(() => {
    setSlideCount(itemsLength);
    setCurrentSlide(0);

  }, [itemsLength]);

  const itemIds = items.map(hit => hit.objectID);
  const currentUserId = currentUser?.id?.uuid;
  useEffect(() => {
    // Send view event
    if (itemIds && itemIds.length) {
      hitsViewed({
        userToken: currentUserId,
        indexName,
        eventName: 'Hits Viewed',
        objectIDs: itemIds
      });
    }
  }, [itemIds, currentUserId, indexName]);


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
  }, [items]);



  const settings = {
    className: "slider variable-width",
    dots: false,
    infinite: false,
    centerMode: false,
    slidesToShow: 1,
    slidesToScroll: 1,
    variableWidth: true,
    swipeToSlide: false,
    swipe: false,
    cssEase: "linear",
    prevArrow: <CustomArrow direction="prev" disabled={currentSlide === 0} />,
    nextArrow: <CustomArrow direction="next" disabled={currentSlide >= slideCount - 4} />, // Assuming 4 visible items
    beforeChange: (current, next) => setCurrentSlide(next),
    afterChange: current => setCurrentSlide(current),
    onInit: () => setSlideCount(items.length),
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

  const getWidth = () => {
    return screenWidth <= 767 ? 263 : 295;
  };

  return (
    <>
      {isLandingPage ? (
        <div className={css.hitsContainer} ref={firstParentRef}>
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
            {items.map(hit => (
              <SwiperSlide key={hit.objectID} style={{ width: getWidth() }}>
                <div
                  style={{ width: getWidth() }}
                  key={hit.objectID}
                  onClick={() => sendEvent('click', hit, 'Hit Clicked', { userToken: currentUser?.id?.uuid })}
                >
                  <div style={{ wordBreak: 'break-all' }}>
                    {indexName === listingIndex || indexName === `${listingIndex}_timestamp_desc` ? (
                      <ListingHit
                        hit={hit}
                        routeConfiguration={routeConfiguration}
                        history={history}
                        intl={intl}
                        queryID={queryID}
                      />
                    ) : indexName === creatorIndex ? (
                      <CreatorHit
                        hit={hit}
                        routeConfiguration={routeConfiguration}
                        history={history}
                        intl={intl}
                        queryID={queryID}
                      />
                    ) : null}
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      ) : (
        <ul className={css.hits}>
          {items.map(hit => (
            <li
              key={hit.objectID}
              onClick={() => sendEvent('click', hit, 'Hit Clicked', { userToken: currentUser?.id?.uuid })}
            >
              <div style={{ wordBreak: 'break-all' }}>
                {indexName === listingIndex ? (
                  <ListingHit
                    hit={hit}
                    routeConfiguration={routeConfiguration}
                    history={history}
                    intl={intl}
                    queryID={queryID}
                  />
                ) : indexName === creatorIndex ? (
                  <CreatorHit
                    hit={hit}
                    routeConfiguration={routeConfiguration}
                    history={history}
                    intl={intl}
                    queryID={queryID}
                  />
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default CustomHits;