import { arrayOf, bool, func, object, shape, string } from 'prop-types';
import React, { useRef, useEffect } from 'react';
import { connect } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import { compose } from 'redux';
import Slider from 'react-slick';
import { useConfiguration } from '../../context/configurationContext';
import { useRouteConfiguration } from '../../context/routeConfigurationContext';

import { FormattedMessage, intlShape, useIntl } from '../../util/reactIntl';

import { propTypes } from '../../util/types';

import { isScrollingDisabled, manageDisableScrolling } from '../../ducks/ui.duck';

import { Creator } from './Creator';

import { Button, CarouselSection, CustomArrow } from '../../components';
import Spinner from '../../components/IconSpinner/IconSpinner';
import { getListingsById } from '../../ducks/marketplaceData.duck';
import { types as sdkTypes } from '../../util/sdkLoader';
import css from './WishlistPage.module.css';
import { listingPreferencesSelector, wishlistSelector } from '../../ducks/user.duck';
import { updateProfile } from '../ProfileSettingsPage/ProfileSettingsPage.duck';
import { loadData } from '../MyLibraryPage/MyLibraryPage.duck';
import IconCollection from '../../components/IconCollection/IconCollection';
import Skeleton from '../../components/Skeleton/Skeleton';
import { getCurrentDeviceWidth } from '../../components/CurrentViewPort/CurrentViewPort';
import { preparePreferenceConfig } from '../../util/data';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation,  Mousewheel, Keyboard } from 'swiper/modules';



const { UUID } = sdkTypes;

export const WishlistPageComponent = props => {
  const {
    routeConfiguration,
    history,
    films: filmArr = [],
    series: seriesArr = [],
    creators = [],
    wishlistFilmsLoading,
    wishlistSeriesLoading,
    wishlistCreatorsLoading,
    fetchNext = () => { },
    wishlistData,
    listing_preferences,
    onUpdateProfile,
    onLoadData
  } = props;
  const config = useConfiguration();
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [slideCount, setSlideCount] = React.useState(0);

  const handleBeforeChange = (current, next) => {
    setCurrentSlide(next);
  }

  const handleAfterChange = (current, next) => {
    setCurrentSlide(current);

    if (next == undefined) {
      fetchNext();
    }
  }

  const removeFromWishlist = (id, type, genre) => {
    const updatedIds = wishlistData[type].filter(itm => itm !== id);
    const preferencePayload = preparePreferenceConfig(listing_preferences, type, genre, false);

    const payload = {
      publicData: {
        ...(preferencePayload.publicData || {}),
        wishlistData: {
          ...wishlistData,
          [type]: updatedIds,
        },
      },
    };

    onUpdateProfile(payload).then(() => {
      onLoadData(null, "", config);
    });
  };
  const deviceWidth = getCurrentDeviceWidth();

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
  }, [creators]);

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
    cssEase: "linear",
    prevArrow: <CustomArrow direction="prev" disabled={currentSlide === 0} />,
    nextArrow: <CustomArrow direction="next" disabled={currentSlide >= slideCount - 4} />, // Assuming 4 visible items
    beforeChange: (current, next) => handleBeforeChange(current, next),
    afterChange: (current, next) => handleAfterChange(current, next),
    onInit: () => setSlideCount(creators.length),
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


  return wishlistSeriesLoading || wishlistFilmsLoading || wishlistCreatorsLoading ? (
    <div className={css.spinnerContainer}>
      <Skeleton width={'10%'} height={20} rounded={0} />
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
        <SwiperSlide style={{ width: deviceWidth > 767 ? 295 : 265 }}>
          <div style={{ width: deviceWidth > 767 ? 295 : 265 }}>
            <Skeleton width={'90%'} height={397} rounded={8} />
            <Skeleton width={'30%'} height={10} rounded={8} /> <br />
            <Skeleton width={'40%'} height={10} rounded={8} />
          </div>

        </SwiperSlide>
        <SwiperSlide style={{ width: deviceWidth > 767 ? 295 : 265 }}>

          <div style={{ width: deviceWidth > 767 ? 295 : 265 }}>
            <Skeleton width={'90%'} height={397} rounded={8} />
            <Skeleton width={'30%'} height={10} rounded={8} /> <br />
            <Skeleton width={'40%'} height={10} rounded={8} />
          </div>
        </SwiperSlide>
        <SwiperSlide style={{ width: deviceWidth > 767 ? 295 : 265 }}>

          <div style={{ width: deviceWidth > 767 ? 295 : 265 }}>
            <Skeleton width={'90%'} height={397} rounded={8} />
            <Skeleton width={'30%'} height={10} rounded={8} /> <br />
            <Skeleton width={'40%'} height={10} rounded={8} />
          </div>
        </SwiperSlide>
      </Swiper>
    </div>
  ) : (
    <div className={css.layoutWrapperContainer}>
      <div className={css.searchResultContainer}>
        <ul className={css.hits}>
          <li>
            {/* series */}
            {seriesArr?.length > 0 ? (
              <div style={{ wordBreak: 'break-all' }}>
                <h4 className={css.seriesHeading}>
                  <FormattedMessage id="WishlistPage.seriesTitle" /> ({seriesArr?.length})
                </h4>
                {/* loop */}

                <CarouselSection
                  isWishlistPage={true}
                  items={seriesArr}
                  fetchNext={() => { }}
                  showTopRightButton
                  handleTopRightButton={removeFromWishlist}
                />
              </div>
            ) : null}
            {/* end */}

            {/* Films*/}
            {filmArr?.length > 0 ? (
              <div style={{ wordBreak: 'break-all' }}>
                <h4 className={css.seriesHeading}>
                  <FormattedMessage id="WishlistPage.filmTitle" /> ({filmArr?.length})
                </h4>

                <CarouselSection
                  isWishlistPage={true}
                  items={filmArr}
                  fetchNext={() => { }}
                  showTopRightButton
                  handleTopRightButton={removeFromWishlist}
                />
              </div>
            ) : null}
            {/* end */}

            {/* Creators*/}
            {creators?.length > 0 ? (
              <div style={{ wordBreak: 'break-all' }}>
                <h4 className={css.seriesHeading}>
                  <FormattedMessage id="WishlistPage.cretatorTitle" /> ({creators?.length})
                </h4>

                {/* loop */}

                <div className={`${css.carouselSection} ${css.wishlistCarousel}`}>
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
                      {creators?.map((el, index) => (
                        <SwiperSlide key={index} style={{ width: deviceWidth > 767 ? 320 : 272 }}>

                          <div key={index} style={{ width: deviceWidth > 767 ? 320 : 272 }} className={css.creatorCard}>
                            <Creator
                              list={el}
                              FormattedMessage={FormattedMessage}
                              history={history}
                              routeConfiguration={routeConfiguration}
                            />
                            <div
                              className={css.removeButton}
                              onClick={() => removeFromWishlist(el.id.uuid, 'creatorIds', [])}
                            >
                              <IconCollection icon="minus-icon-circle" />
                              <span className={css.removeIcon}></span>
                            </div>
                          </div>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </div>
                </div>

                {/* end */}
              </div>
            ) : null}
          </li>
        </ul>
      </div>
    </div>
  );
};

WishlistPageComponent.defaultProps = {};

WishlistPageComponent.propTypes = {
  onManageDisableScrolling: func.isRequired,
  scrollingDisabled: bool.isRequired,
  searchParams: object,
  // from useHistory
  history: shape({
    push: func.isRequired,
  }).isRequired,
  // from useLocation
  location: shape({
    search: string.isRequired,
  }).isRequired,
  // from useIntl
  intl: intlShape.isRequired,
  // from useConfiguration
  config: object.isRequired,
  // from useRouteConfiguration
  routeConfiguration: arrayOf(propTypes.route).isRequired,
  onManageDisableScrolling: func.isRequired,
};

const EnhancedWishlistPage = props => {
  const config = useConfiguration();
  const routeConfiguration = useRouteConfiguration();
  const intl = useIntl();
  const history = useHistory();
  const location = useLocation();

  const { currentUser, ...restOfProps } = props;

  return (
    <WishlistPageComponent
      config={config}
      routeConfiguration={routeConfiguration}
      intl={intl}
      history={history}
      location={location}
      {...restOfProps}
    />
  );
};

const mapStateToProps = state => {
  const { currentUser } = state.user;
  const { MyLibraryPage } = state || {};
  const {
    wishlistFilmIds,
    wishlistFilmsLoading,
    wishlistFilmsError,
    wishlistSeriesIds,
    wishlistSeriesLoading,
    wishlistSeriesError,
    wishlistCreators,
    wishlistCreatorsLoading,
    wishlistCreatorsError,
  } = state.MyLibraryPage;

  const films = wishlistFilmIds?.length
    ? getListingsById(state, wishlistFilmIds.map(elm => new UUID(elm)))
    : [];
  const series = wishlistSeriesIds?.length
    ? getListingsById(state, wishlistSeriesIds.map(elm => new UUID(elm)))
    : [];

  return {
    currentUser,
    scrollingDisabled: isScrollingDisabled(state),
    films,
    series,
    wishlistFilmsLoading,
    wishlistFilmsError,
    wishlistSeriesLoading,
    wishlistSeriesError,
    creators: wishlistCreators,
    wishlistCreatorsLoading,
    wishlistCreatorsError,
    wishlistData: wishlistSelector(state),
    listing_preferences: listingPreferencesSelector(state)
  };
};

const mapDispatchToProps = dispatch => ({
  onManageDisableScrolling: (componentId, disableScrolling) =>
    dispatch(manageDisableScrolling(componentId, disableScrolling)),
  onUpdateProfile: (params) => dispatch(updateProfile(params)),
  onLoadData: (params, search, config) => dispatch(loadData(params, search, config))
});

// Note: it is important that the withRouter HOC is **outside** the
// connect HOC, otherwise React Router won't rerender any Route
// components since connect implements a shouldComponentUpdate
// lifecycle hook.
//
// See: https://github.com/ReactTraining/react-router/issues/4671
const WishlistPage = compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(EnhancedWishlistPage);

export default WishlistPage;
