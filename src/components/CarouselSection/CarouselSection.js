import React, { useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import { useRouteConfiguration } from '../../context/routeConfigurationContext';
import { createResourceLocatorString } from '../../util/routes';
import { createSlug } from '../../util/urlHelpers';
import Slider from 'react-slick';
import css from './CarouselSection.module.css';
import ResponsiveImage from '../ResponsiveImage/ResponsiveImage';
import StarRatings from 'react-star-ratings';
import CustomArrow from '../CustomArrow/CustomArrow';
import { FILM_LABEL, FILM_PRODUCTS, SERIES_LABEL } from '../../util/types';
import { formatCardDuration, formatLabel } from '../../util/dataExtractor';
import ListingCard from '../ListingCard/ListingCard';
import { getCurrentDeviceWidth } from '../CurrentViewPort/CurrentViewPort';
import IconCollection from '../IconCollection/IconCollection';
import { TRENDING_CREATORS } from '../../constants';
import classNames from 'classnames';
import CreatorCard from "../CreatorCard/CreatorCard";
import EmptyCard from '../EmptyCard/EmptyCard';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation,  Mousewheel, Keyboard } from 'swiper/modules';

const deviceWidth = getCurrentDeviceWidth();

const getCreatorData = (creator) => {
  const {
    attributes: { profile },
  } = creator || { profile: {} };
  const { firstName = '', lastName = '', publicData } = profile;
  const { marketingBannerUrls = [], userProfileImage, displayName = '', userName, marketingPosters, } = publicData || {};

  return {
    id: creator?.id?.uuid,
    name: displayName || `${firstName} ${lastName}`,
    username: userName,
    image: userProfileImage?.key,
    marketingPosters,
    realUserName: userName,
  };
};

const renderListingItem = ({ item, index, showTopRightButton, handleTopRightButton }) => {
  const { listingType, primary_genre, series_primary_genre } = item?.attributes?.publicData || {};
  const id = item?.id?.uuid;
  const genre = primary_genre.length ? primary_genre : series_primary_genre;

  return (
    <div key={`${item.id}-${index}`} style={{ width: deviceWidth > 767 ? 320 : 272 }} className={css.creatorCard}>
      {showTopRightButton ? (
        <div className={css.removeButton}>
          <span
            className={css.removeIcon}
            onClick={() => handleTopRightButton(id, listingType, genre)}
          >
            {' '}
            <IconCollection icon="minus-icon-circle" />
          </span>
        </div>
      ) : null}
      <ListingCard listing={item} showAuthorInfo={false} showDetails={true} />
    </div>
  );
};

const renderCreatorItem = ({ item, index, routeConfiguration, history }) => {
  const creatorsData = getCreatorData(item);
  return (
    <div key={`${item.id}-${index}`} style={{ width: deviceWidth > 767 ? 320 : 272 }} className={css.creatorCard}>
      <CreatorCard creator={creatorsData} routeConfiguration={routeConfiguration} history={history} />
    </div>
  );
};

const renderItem = ({ item, index, showTopRightButton, handleTopRightButton, routeConfiguration, history }) => {
  if (!item) return null;
  if (item?.type == 'listing') return renderListingItem({ item, index, showTopRightButton, handleTopRightButton, routeConfiguration });
  if (item?.type === 'user') return renderCreatorItem({ item, index, routeConfiguration, history });
};

const prepareItemData = item => {
  const isListing = !!item?.state;

  if (isListing) {
    const { objectID, title, publicData, state } = item || {};
    const {
      listingType: category,
      primary_genre = [],
      marketingPoster,
      ratingAvg,
      episodeCount,
      listingType,
      series_primary_genre,
      episodes = [],
      listingRating,
      filmDuration,
    } = publicData || {};

    const primaryGenreMaybe = series_primary_genre?.length ? (
      <span>{series_primary_genre.map(g => formatLabel(g)).join(', ')}</span>
    ) : primary_genre?.length ? (
      <span>{primary_genre.map(g => formatLabel(g)).join(', ')}</span>
    ) : (
      ''
    );

    const duration = filmDuration ? (
      <span>{formatCardDuration(filmDuration)} </span>
    ) : episodeCount || episodes?.length ? (
      <span>{episodeCount || episodes?.length} Episodes</span>
    ) : null;

    return {
      objectID,
      name: title,
      url: marketingPoster?.sourceUrl,
      key: marketingPoster?.key,
      rating: ratingAvg,
      primaryGenreMaybe,
      duration,
      listingType,
      isListing,
      listingRating,
    };
  } else {
    const {
      objectID,
      firstName,
      lastName,
      displayName,
      username,
      totalFilms,
      totalSeries,
      userProfileImage,
      marketingPosters,
    } = item || {};

    return {
      objectID,
      name: displayName || `${firstName} ${lastName}`,
      username,
      key: userProfileImage?.key,
      totalFilms,
      totalSeries,
      isListing,
      marketingPosters,
      displayName,
    };
  }
};

const algoliaRenderItem = (item, index, history, routeConfiguration, isCreatorSection) => {
  const {
    objectID,
    name,
    key,
    rating,
    totalFilms,
    totalSeries,
    username,
    primaryGenreMaybe,
    duration,
    listingType,
    isListing,
    listingRating,
    displayName,
    marketingPosters
  } = prepareItemData(item) || {};

  const films = `${totalFilms} Films`;
  const series = `${totalSeries} Series`;

  const handleClick = () => {
    history.push(
      createResourceLocatorString(
        isListing ? 'ListingPage' : 'ProfilePage',
        routeConfiguration,
        { id: objectID, ...(isListing ? { slug: createSlug(name) } : { username: username || name }) },
        {}
      )
    );
  };

  const details = isListing ? (
    <p>
      {listingType == FILM_PRODUCTS ? FILM_LABEL : SERIES_LABEL}&nbsp;|&nbsp;{primaryGenreMaybe}
      &nbsp;|&nbsp;
      {duration}
    </p>
  ) : (
    <p>
      {films} | {series}
    </p>
  );

  const isValid = key && name && objectID;
  const deviceWidth = getCurrentDeviceWidth();

  if (!isValid) {
    return null;
  }

  return (
    <div key={`${item.id}-${index}`} style={{ width: deviceWidth > 767 ? 320 : 272 }}>
      <div onClick={handleClick} className={classNames(css.card, !isListing && css.creatorsWithSeriesCard)}>
        <div className={isCreatorSection ? classNames(css.imageContainer, css.creatorImageContainer) : css.imageContainer}>
          <ResponsiveImage
            alt={name}
            className={isCreatorSection ? classNames(css.cardImage, css.creatorImage) : css.cardImage}
            variants={['default']}
            gumletImage={{
              sourceUrl: process.env.REACT_APP_GUMLET_SOURCE_URL,
              key: key,
            }}
          // transformWidth={500}
          />
          {isCreatorSection
            ? (totalFilms > 0 || totalSeries > 0) ? (
              <div className={css.smallImg}>
                {marketingPosters?.length > 0
                  ? marketingPosters
                    .slice(-3) // Get last 3 elements
                    .reverse() // Reverse the sliced array
                    .map((el, index) => <ResponsiveImage key={index} url={el} alt={username} />)
                  : null}
              </div>
            ) : <div className={css.smallImgPlaceholder}>
              <IconCollection icon="coming-soon-media" />
              <p>Content Coming Soon</p>
            </div>
            : null}
        </div>
        <div className={css.cardBody}>
          {rating ? (
            <div className={css.rating}>
              <StarRatings rating={rating} starDimension="25px" starSpacing="2px" />
            </div>
          ) : username ? (
            <div className={css.username}>{username}</div>
          ) : null}
          {isListing ? (
            <div className={css.ratings}>
              <StarRatings
                svgIconViewBox="0 0 40 37"
                svgIconPath="M20 0L26.113 11.5862L39.0211 13.8197L29.891 23.2138L31.7557 36.1803L20 30.4L8.2443 36.1803L10.109 23.2138L0.97887 13.8197L13.887 11.5862L20 0Z"
                starRatedColor="#ffb802"
                // starEmptyColor="#ffffff"
                rating={listingRating ? listingRating : 0}
                starDimension="25px"
                starSpacing="2px"
              />
            </div>
          ) : null}
          <h3 className={css.cardTitle}>{name}</h3>
          <div className={css.cardDetails}>{details}</div>
        </div>
      </div>
    </div>
  );
};

const CarouselSection = ({
  name,
  description,
  items,
  handleAction = () => { },
  algolia = false,
  fetchNext = () => { },
  isWishlistPage = false,
  showTopRightButton,
  handleTopRightButton,
  emptyCardData
}) => {
  const history = useHistory();
  const routeConfiguration = useRouteConfiguration();
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [slideCount, setSlideCount] = React.useState(0);
  const isCreatorSection = name == TRENDING_CREATORS;

  const firstSliderRef = useRef();

  const sliderRefs = [firstSliderRef]; // Add more refs as needed

  // Create separate parent refs for each slider
  const firstParentRef = useRef(null);
  const parentRefs = [firstParentRef];

  useEffect(() => {
    const count = items.length + (emptyCardData ? 1 : 0);
    setSlideCount(count); // Ensure slide count updates when items change

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


  const handleBeforeChange = (current, next) => {
    setCurrentSlide(next);
  };

  const handleAfterChange = (current, next) => {
    setCurrentSlide(current);

    if (next == undefined) {
      fetchNext();
    }
  };

  const settings = {
    className: 'slider variable-width',
    dots: false,
    infinite: false,
    centerMode: false,
    slidesToShow: 1,
    swipe: false,
    slidesToScroll: 1,
    variableWidth: true,
    swipeToSlide: false,
    speed: 500,
    cssEase: "linear",
    prevArrow: <CustomArrow direction="prev" disabled={currentSlide === 0} />,
    nextArrow: <CustomArrow direction="next" disabled={currentSlide >= slideCount - 4} />, // Assuming 4 visible items
    beforeChange: (current, next) => handleBeforeChange(current, next),
    afterChange: (current, next) => handleAfterChange(current, next),
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


  return (
    <div className={`${css.carouselSection} ${isWishlistPage ? css.wishlistCarousel : ''}`}>
      {name || description ? (
        <div className={css.header}>
          {name ? <div className={css.title}>{name}</div> : null}
          {description ? (
            <div onClick={handleAction} className={css.viewAll}>
              {description}
            </div>
          ) : null}
        </div>
      ) : null}
      <div className={classNames(css.hitsContainer, emptyCardData && Object.keys(emptyCardData || {}).length && css.WithemptyCard)}>
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
          {emptyCardData && Object.keys(emptyCardData || {}).length ? (
            <SwiperSlide key={0} style={{ width: deviceWidth > 767 ? 320 : 272 }} className={css.emptyCard}>

              <div>
                <EmptyCard {...emptyCardData} />
              </div>
            </SwiperSlide>
          ) : null}
          {items.map((item, index) => <SwiperSlide key={index}>
            {algolia
              ? algoliaRenderItem(item, index, history, routeConfiguration, isCreatorSection)
              : renderItem({ item, index, showTopRightButton, handleTopRightButton, routeConfiguration, history })}
          </SwiperSlide>
          )}
        </Swiper>
      </div>
    </div>
  );
};

export default CarouselSection;
