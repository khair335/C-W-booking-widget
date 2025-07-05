import React, { useState, useRef, useEffect } from 'react';
import { connect } from 'react-redux';
import Slider from 'react-slick';
import { compose } from 'redux';
import {
  ButtonTabNavHorizontal,
  H3,
  Heading,
  LayoutSingleColumn,
  NamedLink,
  Page,
  ResponsiveImage,
  UserDisplayName,
} from '../../components';
import FooterContainer from '../../containers/FooterContainer/FooterContainer';
import TopbarContainer from '../../containers/TopbarContainer/TopbarContainer';
import { isScrollingDisabled, manageDisableScrolling } from '../../ducks/ui.duck';
import { FormattedMessage, injectIntl } from '../../util/reactIntl';

// import { updateProfile, uploadImage } from './FavoritesPage.duck';
import classNames from 'classnames';
import { useHistory, useLocation } from 'react-router-dom/cjs/react-router-dom.min';
import StarRatings from 'react-star-ratings';
import Spinner from '../../components/IconSpinner/IconSpinner';
import { useConfiguration } from '../../context/configurationContext';
import { getMarketplaceEntities } from '../../ducks/marketplaceData.duck';
import { getProcess, resolveLatestProcessName } from '../../transactions/transaction';
import { transitions } from '../../transactions/transactionProcessPurchase';
import { formatCardDuration, formatLabel } from '../../util/dataExtractor';
import { func } from 'prop-types';
import {
  FILM_LABEL,
  FILM_PRODUCTS,
  PURCHASES_TAB,
  SERIES_LABEL,
  SERIES_PRODUCTS,
  WISHLIST_TAB,
} from '../../util/types';
import ReviewModal from '../TransactionPage/ReviewModal/ReviewModal';
import { sendReview } from '../TransactionPage/TransactionPage.duck';
import WishlistPage from '../WishlistPage/WishlistPage';
import css from './MyLibraryPage.module.css';
import { withRouter } from 'react-router-dom';
import { createResourceLocatorString } from '../../util/routes';
import { useRouteConfiguration } from '../../context/routeConfigurationContext';
import { getCurrentDeviceWidth } from '../../components/CurrentViewPort/CurrentViewPort';
import Skeleton from '../../components/Skeleton/Skeleton';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Mousewheel, Keyboard } from 'swiper/modules';


const sourceUrl = process.env.REACT_APP_GUMLET_SOURCE_URL;

const TransactionCard = props => {
  const history = useHistory();
  const routes = useRouteConfiguration();
  const [isReviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const { transaction, onSendReview, intl, sendReviewInProgress, sendReviewError, config } = props;

  const { collectionData, metadata } = transaction.attributes || {};
  const { title: listingTile, publicData } = transaction?.listing?.attributes || {};
  const { listingData } = (collectionData && collectionData[0]) || {};
  const {
    title,
    listingType,
    series_primary_genre,
    primary_genre,
    filmVideo,
    episodes,
    episodeCount,
    marketingPoster,
    listingRating,
  } = listingData || publicData || {};

  const primaryGenreMaybe = series_primary_genre?.length ? (
    <span>{series_primary_genre.map(g => formatLabel(g)).join(', ')}</span>
  ) : primary_genre?.length ? (
    <span>{primary_genre.map(g => formatLabel(g)).join(', ')}</span>
  ) : (
    ''
  );

  const duration = filmVideo ? (
    <span>{formatCardDuration(filmVideo?.duration)} </span>
  ) : episodeCount || episodes?.length ? (
    <span>{episodeCount || episodes?.length} Episodes</span>
  ) : null;

  // Open review modal
  // This is called from ActivityFeed and from action buttons
  const onOpenReviewModal = () => {
    setReviewModalOpen(true);
  };

  const processName = resolveLatestProcessName(transaction?.attributes?.processName);
  let process = null;
  try {
    process = processName ? getProcess(processName) : null;
  } catch (error) {
    // Process was not recognized!
  }

  // Submit review and close the review modal
  const onSubmitReview = values => {
    const { reviewRating, reviewContent } = values;
    const rating = Number.parseInt(reviewRating, 10);
    const { states, transitions } = process;
    const transitionOptions = {
      reviewAsFirst: transitions.REVIEW_1_BY_CUSTOMER,
      reviewAsSecond: transitions.REVIEW_2_BY_CUSTOMER,
      hasOtherPartyReviewedFirst: process
        .getTransitionsToStates([states.REVIEWED_BY_PROVIDER])
        .includes(transaction.attributes.lastTransition),
    };

    const params = { reviewRating: rating, reviewContent };

    onSendReview(transaction, transitionOptions, params, config)
      .then(r => {
        setReviewModalOpen(false);
        setReviewSubmitted(true);
      })
      .catch(e => {
        // Do nothing.
      });
  };

  return (
    <>
      <NamedLink className={classNames} name="VideoViewerPage" params={{ id: transaction.id.uuid }}>
        <div className={css.imageContainer}>
          <ResponsiveImage
            alt={title || listingTile}
            className={css.cardImage}
            gumletImage={{
              sourceUrl,
              key: marketingPoster?.key,
            }}
          />
          {metadata?.completeWatched ? <div>
            <span onClick={(e) => {
              e.preventDefault()
              history.push(createResourceLocatorString(
                'OrderDetailsPage',
                routes,
                { id: transaction?.id?.uuid },
                {}
              ))
            }
            }
              className={css.reviewButton}
            >
              <FormattedMessage id="MyLibraryPage.review" />
            </span>

          </div> : null}
        </div>
        <div className={css.info}>
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
          <div className={css.mainInfo}>
            <h6 className={css.title}>
              {(title || listingTile)
                ?.split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ')}
            </h6>
            <p className={css.category}>
              {listingType == FILM_PRODUCTS ? FILM_LABEL : SERIES_LABEL}&nbsp;|&nbsp;
              {primaryGenreMaybe}&nbsp;|&nbsp;
              {duration}
            </p>
          </div>

        </div>
      </NamedLink>

      <ReviewModal
        id="ReviewOrderModal"
        isOpen={isReviewModalOpen}
        onCloseModal={() => setReviewModalOpen(false)}
        onManageDisableScrolling={() => { }}
        onSubmitReview={onSubmitReview}
        revieweeName={<UserDisplayName user={transaction?.provider} intl={intl} />}
        reviewSent={reviewSubmitted}
        sendReviewInProgress={sendReviewInProgress}
        sendReviewError={sendReviewError}
        marketplaceName={config.marketplaceName}
      />
    </>
  );
};

export const MyLibraryPageComponent = props => {
  const {
    scrollingDisabled,
    intl,
    transactions,
    onSendReview,
    sendReviewInProgress,
    sendReviewError,
    fetchInProgress,
    onManageDisableScrolling,
    params,
    history,
    fetchNext = () => { }
  } = props || {};

  const { tab } = params || {};
  const routeConfiguration = useRouteConfiguration();
  // const [currentSlide, setCurrentSlide] = React.useState(0);
  // const [slideCount, setSlideCount] = React.useState(0);
  // const [currentSlide2, setCurrentSlide2] = React.useState(0);
  // const [slideCount2, setSlideCount2] = React.useState(0);
  // const handleBeforeChange = (current, next) => {
  //   setCurrentSlide(next);
  // }

  // const handleAfterChange = (current, next) => {
  //   setCurrentSlide(current);

  //   if (next == undefined) {
  //     fetchNext();
  //   }
  // }

  // const handleBeforeChange2 = (current, next) => {
  //   setCurrentSlide2(next);
  // }

  // const handleAfterChange2 = (current, next) => {
  //   setCurrentSlide2(current);

  //   if (next == undefined) {
  //     fetchNext();
  //   }
  // }

  const config = useConfiguration();

  const title = intl.formatMessage({ id: 'MyLibraryPage.title' });

  const isPurchaseTabSelected = tab === PURCHASES_TAB;
  const isWishlistTabSelected = tab === WISHLIST_TAB;

  const desktopTabs = [
    {
      text: (
        <Heading as="h3" rootClassName={css.desktopReviewsTitle}>
          <FormattedMessage id="MyLibraryPage.allPurchaseTabTitle" />
        </Heading>
      ),
      selected: isPurchaseTabSelected,
      onClick: () =>
        history.push(
          createResourceLocatorString('MyLibraryPage', routeConfiguration, { tab: PURCHASES_TAB }, {})
        ),
    },
    {
      text: (
        <Heading as="h3" rootClassName={css.desktopReviewsTitle}>
          <FormattedMessage id="MyLibraryPage.wishlistTabTitle" />
        </Heading>
      ),
      selected: isWishlistTabSelected,
      onClick: () =>
        history.push(
          createResourceLocatorString('MyLibraryPage', routeConfiguration, { tab: WISHLIST_TAB })
        ),
    },
  ];

  const filmTransactions =
    transactions.filter(
      e =>
        e.attributes.collectionData[0]?.listingData.listingType == FILM_PRODUCTS ||
        e?.listing?.attributes?.publicData?.listingType == FILM_PRODUCTS
    ) || [];
  const seriesTransactions =
    transactions.filter(
      e =>
        e.attributes.collectionData[0]?.listingData.listingType == SERIES_PRODUCTS ||
        e?.listing?.attributes?.publicData?.listingType == SERIES_PRODUCTS
    ) || [];

  // const CustomArrow = ({ direction, onClick, disabled }) => (
  //   <button disabled={disabled} onClick={onClick} className={css[`${direction}Arrow`]}>
  //     <svg
  //       xmlns="http://www.w3.org/2000/svg"
  //       width="61"
  //       height="61"
  //       viewBox="0 0 61 61"
  //       fill="none"
  //     >
  //       <g clipPath="url(#clip0_2253_5879)">
  //         <path
  //           d="M0.22398 8.16448L0.224077 8.16458C0.671583 7.73798 1.26612 7.5 1.88439 7.5C2.50266 7.5 3.0972 7.73798 3.5447 8.16458L24.7917 28.4089C25.0275 28.6336 25.2153 28.9039 25.3436 29.2033C25.4719 29.5028 25.5381 29.8252 25.5381 30.151C25.5381 30.4768 25.4719 30.7992 25.3436 31.0986C25.2153 31.3981 25.0275 31.6684 24.7917 31.8931L3.5447 52.1374C3.09719 52.564 2.50265 52.802 1.88439 52.802C1.26612 52.802 0.671581 52.564 0.224075 52.1374L0.215422 52.1291L0.215523 52.129L0.196924 52.1104C-0.0224037 51.9008 -0.197168 51.6491 -0.316874 51.3702C-0.437468 51.0893 -0.499655 50.7868 -0.499655 50.4811C-0.499655 50.1755 -0.437467 49.873 -0.316873 49.5921C-0.196279 49.3112 -0.0198039 49.0577 0.201822 48.8472L19.8293 30.1547L0.201828 11.4548L0.22398 8.16448ZM0.22398 8.16448L0.215538 8.17292M0.22398 8.16448L0.215538 8.17292M0.215538 8.17292L0.196897 8.19156M0.215538 8.17292L0.196897 8.19156M0.196897 8.19156C-0.022419 8.40118 -0.197174 8.65293 -0.316872 8.93174C-0.437466 9.21264 -0.499653 9.51514 -0.499653 9.82083C-0.499653 10.1265 -0.437466 10.429 -0.316872 10.7099C-0.196373 10.9906 -0.0200769 11.2439 0.201305 11.4543L0.196897 8.19156Z"
  //           fill="white"
  //           stroke="white"
  //         />
  //       </g>
  //       <defs>
  //         <clipPath id="clip0_2253_5879">
  //           <rect width="61" height="61" fill="white" transform="translate(61) rotate(90)" />
  //         </clipPath>
  //       </defs>
  //     </svg>
  //   </button>
  // );

  // const firstSliderRef = useRef();
  // const secondSliderRef = useRef();

  // const sliderRefs = [firstSliderRef, secondSliderRef]; // Add more refs as needed

  // // Create separate parent refs for each slider
  // const firstParentRef = useRef(null);
  // const secondParentRef = useRef(null);
  // const parentRefs = [firstParentRef, secondParentRef];

  // useEffect(() => {
  //   // Set up scroll handlers for each parent container
  //   parentRefs.forEach((parentRef, index) => {
  //     if (!parentRef.current) return;

  //     const handleScroll = e => {
  //       // Only handle horizontal scrolling gestures
  //       if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
  //         e.preventDefault(); // Prevent default scroll behavior

  //         // Get the element that triggered the event
  //         const target = e.target;

  //         // Get corresponding slider ref for this parent
  //         const sliderRef = sliderRefs[index];

  //         if (sliderRef?.current && sliderRef.current.innerSlider.list.contains(target)) {
  //           if (e.deltaX > 0) {
  //             sliderRef.current?.slickNext();
  //           } else if (e.deltaX < 0) {
  //             sliderRef.current?.slickPrev();
  //           }
  //         }
  //       }
  //     };

  //     const element = parentRef.current;
  //     element.addEventListener("wheel", handleScroll, { passive: false });

  //     return () => {
  //       element.removeEventListener("wheel", handleScroll);
  //     };
  //   });
  // }, [seriesTransactions, filmTransactions]);


  // const settings = {
  //   className: 'slider variable-width',
  //   dots: false,
  //   infinite: false,
  //   centerMode: false,
  //   slidesToShow: 1,
  //   slidesToScroll: 1,
  //   variableWidth: true,
  //   swipe: false,
  //   cssEase: "linear",
  //   prevArrow: <CustomArrow direction="prev" disabled={currentSlide === 0} />,
  //   nextArrow: <CustomArrow direction="next" disabled={currentSlide >= slideCount - 4} />, // Assuming 4 visible items
  //   beforeChange: (current, next) => handleBeforeChange(current, next),
  //   afterChange: (current, next) => handleAfterChange(current, next),
  //   onInit: () => setSlideCount(seriesTransactions.length),
  //   responsive: [
  //     {
  //       breakpoint: 767,
  //       settings: {
  //         slidesToShow: 1,
  //         arrows: false,
  //         infinite: false,
  //         swipe: true,
  //       },
  //     },
  //   ],
  // };

  // const settings2 = {
  //   className: 'slider variable-width',
  //   dots: false,
  //   infinite: false,
  //   centerMode: false,
  //   slidesToShow: 1,
  //   slidesToScroll: 1,
  //   variableWidth: true,
  //   swipe: false,
  //   cssEase: "linear",
  //   prevArrow: <CustomArrow direction="prev" disabled={currentSlide2 === 0} />,
  //   nextArrow: <CustomArrow direction="next" disabled={currentSlide2 >= slideCount2 - 4} />, // Assuming 4 visible items
  //   beforeChange: (current, next) => handleBeforeChange2(current, next),
  //   afterChange: (current, next) => handleAfterChange2(current, next),
  //   onInit: () => setSlideCount2(filmTransactions.length),
  //   responsive: [
  //     {
  //       breakpoint: 767,
  //       settings: {
  //         slidesToShow: 1,
  //         arrows: false,
  //         infinite: false,
  //         swipe: true,
  //       },
  //     },
  //   ],
  // };

  const deviceWidth = getCurrentDeviceWidth();

  return (
    <Page className={css.root} title={title} scrollingDisabled={scrollingDisabled}>
      <LayoutSingleColumn
        topbar={
          <>
            <TopbarContainer currentPage="MyLibraryPage" />
          </>
        }
        footer={<FooterContainer />}
      >
        <div className={css.content}>
          <div className={css.headingContainer}>
            <H3 as="h1" className={css.heading}>
              <FormattedMessage
                id={isPurchaseTabSelected ? 'MyLibraryPage.heading' : 'WishlistPage.title'}
              />
            </H3>
            <div className={css.desktopReviewsTabNav}>
              <ButtonTabNavHorizontal tabs={desktopTabs} isListingPage={false} />
            </div>

            {isPurchaseTabSelected ? (
              <>
                {seriesTransactions?.length > 0 ? (
                  <div className={css.seriesContainer}>
                    <h4 className={css.seriesHeading}>
                      <FormattedMessage
                        id="MyLibraryPage.seriesHeading"
                        values={{ count: seriesTransactions?.length || 0 }}
                      />
                    </h4>

                    <div className={css.listingCards} >
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
                        {seriesTransactions?.map((l, id) => (
                          <SwiperSlide style={{ width: deviceWidth > 767 ? 295 : 265 }} key={l.id.uuid}>
                            <div style={{ width: deviceWidth > 767 ? 295 : 265 }} key={l.id.uuid}>
                              <TransactionCard
                                transaction={l}
                                onSendReview={onSendReview}
                                intl={intl}
                                sendReviewInProgress={sendReviewInProgress}
                                sendReviewError={sendReviewError}
                                config={config}
                              />
                            </div>
                          </SwiperSlide>
                        ))}
                      </Swiper>
                    </div>
                  </div>
                ) : null}

                {filmTransactions?.length > 0 ? (
                  <div className={css.filmContainer}>
                    <h4 className={css.filmHeading}>
                      <FormattedMessage id="MyLibraryPage.filmHeading" values={{ count: filmTransactions?.length || 0 }} />
                    </h4>
                    <div className={css.listingCards}>
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
                        {filmTransactions?.map(l => (
                          <SwiperSlide style={{ width: deviceWidth > 767 ? 295 : 265 }} key={l.id.uuid}>
                            <div style={{ width: deviceWidth > 767 ? 295 : 265 }} key={l.id.uuid}>
                              <TransactionCard
                                onManageDisableScrolling={onManageDisableScrolling}
                                transaction={l} onSendReview={onSendReview} intl={intl} sendReviewInProgress={sendReviewInProgress}
                                sendReviewError={sendReviewError} config={config} />
                            </div>
                          </SwiperSlide>
                        ))}
                      </Swiper>
                    </div>
                  </div>
                ) : null}

                {(fetchInProgress && (filmTransactions.length == 0 || seriesTransactions.length == 0)) ? <div className={css.spinnerContainer}>
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
                </div> : null}
              </>
            ) : (
              <WishlistPage />
            )}
          </div>
        </div>
      </LayoutSingleColumn>
    </Page>
  );
};

MyLibraryPageComponent.propTypes = {
  onManageDisableScrolling: func.isRequired,
}

const mapStateToProps = state => {
  const { currentUser } = state.user;
  const {
    image,
    uploadImageError,
    uploadInProgress,
    updateInProgress,
    updateProfileError,
    fetchInProgress,
    transactionRefs,
  } = state.MyLibraryPage;

  const { sendReviewInProgress, sendReviewError } = state.TransactionPage;

  const transactions = getMarketplaceEntities(state, transactionRefs);
  return {
    currentUser,
    image,
    scrollingDisabled: isScrollingDisabled(state),
    updateInProgress,
    updateProfileError,
    uploadImageError,
    uploadInProgress,
    fetchInProgress,
    transactions,
    sendReviewInProgress,
    sendReviewError,
  };
};



const mapDispatchToProps = dispatch => ({
  onSendReview: (tx, transitionOptions, params, config) =>
    dispatch(sendReview(tx, transitionOptions, params, config)),
  onManageDisableScrolling: (componentId, disableScrolling) =>
    dispatch(manageDisableScrolling(componentId, disableScrolling)),
});

const MyLibraryPage = withRouter(compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  ),
  injectIntl
)(MyLibraryPageComponent));

export default MyLibraryPage;
