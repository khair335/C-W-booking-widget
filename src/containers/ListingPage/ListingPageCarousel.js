import React, { useEffect, useState, useRef } from 'react';
import { array, arrayOf, bool, func, shape, string, oneOf, object } from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import Slider from "react-slick";
// Contexts
import { useConfiguration } from '../../context/configurationContext';
import { useRouteConfiguration } from '../../context/routeConfigurationContext';
// Utils
import { FormattedMessage, intlShape, useIntl } from '../../util/reactIntl';
import { LISTING_STATE_PENDING_APPROVAL, LISTING_STATE_CLOSED, propTypes, FILM_TAB, CAST_CREW, FILM_PRODUCTS, AUDIENCE_USER_TYPE, WISHLIST_TAB } from '../../util/types';
import { types as sdkTypes } from '../../util/sdkLoader';
import {
  LISTING_PAGE_DRAFT_VARIANT,
  LISTING_PAGE_PENDING_APPROVAL_VARIANT,
  LISTING_PAGE_PARAM_TYPE_DRAFT,
  LISTING_PAGE_PARAM_TYPE_EDIT,
  createSlug,
  NO_ACCESS_PAGE_USER_PENDING_APPROVAL,
} from '../../util/urlHelpers';
import { isErrorUserPendingApproval, isForbiddenError } from '../../util/errors.js';
import { isUserAuthorized } from '../../util/userHelpers.js';
import {
  ensureListing,
  ensureOwnListing,
  ensureUser,
  isListingAssetsReady,
  preparePreferenceConfig,
  truncateEpisodeDescription,
  useQuery,
  userDisplayNameAsString,
} from '../../util/data';
import { richText } from '../../util/richText';
import {
  isBookingProcess,
  isPurchaseProcess,
  resolveLatestProcessName,
} from '../../transactions/transaction';

// Global ducks (for Redux actions and thunks)
import { getMarketplaceEntities } from '../../ducks/marketplaceData.duck';
import { manageDisableScrolling, isScrollingDisabled } from '../../ducks/ui.duck';
import { initializeCardPaymentData } from '../../ducks/stripe.duck.js';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Mousewheel, Keyboard } from 'swiper/modules';


// Shared components
import {
  H4,
  Page,
  NamedLink,
  NamedRedirect,
  OrderPanel,
  LayoutSingleColumn,
  Heading,
  ButtonTabNavHorizontal,
  Button,
  ListingCard,
  ResponsiveImage,
} from '../../components';

// Related components and modules
import TopbarContainer from '../TopbarContainer/TopbarContainer';
import FooterContainer from '../FooterContainer/FooterContainer';
import NotFoundPage from '../NotFoundPage/NotFoundPage';

import {
  sendInquiry,
  setInitialValues,
  fetchTimeSlots,
  fetchTransactionLineItems,
  userStartedWatchingPaidContent,
} from './ListingPage.duck';

import {
  LoadingPage,
  ErrorPage,
  priceData,
  listingImages,
  handleContactUser,
  handleSubmitInquiry,
  handleSubmit,
  priceForSchemaMaybe,
} from './ListingPage.shared';
import SectionReviews from './SectionReviews';
import SectionAuthorMaybe from './SectionAuthorMaybe';

import ListingBannerDetails from './ListingBannerDetails/ListingBannerDetails';
import classNames from 'classnames';
import { LISTING_SEARCH_ID } from '../../constants.js';
import css from './ListingPage.module.css';
import { updateWishlist } from '../MyLibraryPage/MyLibraryPage.duck';
import VideoViewerPanel from './VideoViewerPanel/VideoViewerPanel';
import { createResourceLocatorString } from '../../util/routes';
import { getCurrentDeviceWidth } from '../../components/CurrentViewPort/CurrentViewPort.js';
import { updateProfile } from '../ProfileSettingsPage/ProfileSettingsPage.duck';
import IconCollection from '../../components/IconCollection/IconCollection.js';
import { formatCardDuration } from '../../util/dataExtractor';

const MIN_LENGTH_FOR_LONG_WORDS_IN_TITLE = 16;

const { UUID } = sdkTypes;

const EpisodesList = ({ episodes, freeEpisode, showCount, setShowCount, setShowFreeVideo, isAuthenticated }) => {

  // Handle "load more" functionality
  const handleLoadMore = () => {
    setShowCount(prevCount => prevCount + 6);
  };

  // Render early if no episodes are available
  if (!episodes || episodes.length === 0) {
    return <p>No episodes available</p>;
  }

  return (
    <div>
      <h4 className={css.sectionHeadingWithExtraMargin}>Episodes ({episodes.length})</h4>
      <div className={css.episodesGrid}>
        {episodes.slice(0, 6 + showCount).map((epis, id) => (
          <div key={epis.id} className={css.episodeCard} onClick={() => {
            if (freeEpisode && id === 0 && typeof window !== 'undefined' && isAuthenticated) {
              setShowFreeVideo(true);
              window.scrollTo(0, 0); // Scroll to top
            } else {
              setShowFreeVideo(false);
            }
          }}>
            <ResponsiveImage
              className={css.episodeThumbnail}
              url={epis?.thumbnailFile?.url}
              alt={epis.title}
            />
            <div className={css.episodeDetails}>
              <p > <span className={css.episodeDuration}>Episode #{epis.sequenceNumber} &nbsp;|&nbsp;  </span> <span>{formatCardDuration((epis?.videoFile?.duration))}</span></p>

              <h3 className={css.episodeTitle}>{epis.title}</h3>
              <p className={css.episodeDescription}>{truncateEpisodeDescription(epis.description)}</p>
            </div>
            {freeEpisode && id === 0 && (
              <button className={classNames(css.playButton, !isAuthenticated && css.disabled)}>
                <IconCollection icon="free-play-video" />
                Play for Free</button>
            )}
          </div>
        ))}
      </div>
      {episodes.length > 6 + showCount && (
        <div onClick={handleLoadMore} style={{ cursor: 'pointer' }}>
          <span>
            <FormattedMessage
              id="ListingPage.loadMore"
              values={{ count: episodes.length - (6 + showCount) }}
            />
          </span>
        </div>
      )}
    </div>
  );
};


const formatString = (value) => {
  return value
    .toLowerCase()            // Convert all characters to lowercase
    .split('_')               // Split the string by underscores
    .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
    .join(' ');               // Join the words with spaces
};

export const ListingPageComponent = props => {
  const {
    isAuthenticated,
    currentUser,
    getListing,
    getOwnListing,
    intl,
    onManageDisableScrolling,
    params: rawParams,
    location,
    scrollingDisabled,
    showListingError,
    reviews,
    fetchReviewsError,
    sendInquiryInProgress,
    sendInquiryError,
    monthlyTimeSlots,
    onFetchTimeSlots,
    onFetchTransactionLineItems,
    onManageWishList,
    onUpdateProfile,
    lineItems,
    fetchLineItemsInProgress,
    fetchLineItemsError,
    history,
    callSetInitialValues,
    onSendInquiry,
    onInitializeCardPaymentData,
    config,
    routeConfiguration,
    listings,
    moreLikeListings,
    queryID,
    orderLength,
    onUserWatchingPaidContent,
    fetchNext = () => { },
    fetchInProgress
  } = props;

  const [inquiryModalOpen, setInquiryModalOpen] = useState(
    props.inquiryModalOpenForListingId === props.params.id
  );
  const [showTabType, setShowTabType] = useState(FILM_TAB);
  const [showCount, setShowCount] = useState(0);
  const [showFreeVideo, setShowFreeVideo] = useState(false);
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [slideCount, setSlideCount] = React.useState(0);
  const [currentSlide2, setCurrentSlide2] = React.useState(0);
  const [slideCount2, setSlideCount2] = React.useState(0);

  const firstSliderRef = useRef();
  const secondSliderRef = useRef();
  const sliderRefs = [firstSliderRef, secondSliderRef]; // Add more refs as needed

  // Create separate parent refs for each slider
  const firstParentRef = useRef(null);
  const secondParentRef = useRef(null);
  const parentRefs = [firstParentRef, secondParentRef];


  const startTrailer = location.search.includes('trailer=show');
  const { wishlistData = {}, listing_preferences } =
    currentUser?.attributes?.profile?.publicData || {};

  const listingConfig = config.listing;
  const listingId = new UUID(rawParams.id);
  const isPendingApprovalVariant = rawParams.variant === LISTING_PAGE_PENDING_APPROVAL_VARIANT;
  const isDraftVariant = rawParams.variant === LISTING_PAGE_DRAFT_VARIANT;
  const currentListing =
    isPendingApprovalVariant || isDraftVariant
      ? ensureOwnListing(getOwnListing(listingId))
      : ensureListing(getListing(listingId));

  const listingSlug = rawParams.slug || createSlug(currentListing.attributes.title || '');
  const params = { slug: listingSlug, ...rawParams };
  const isApproved =
    currentListing.id && currentListing.attributes.state !== LISTING_STATE_PENDING_APPROVAL;

  const pendingIsApproved = isPendingApprovalVariant && isApproved;
  const commonParams = { params, history, routes: routeConfiguration };
  const isAssetsReady = isListingAssetsReady({ listing: currentListing })?.isReady === true;

  useEffect(() => {
    if (location.state?.to?.includes('wishlist')) {
      // user is re-rerouted after authentication
      handleWishList(true).then(() => {
        history.push(
          createResourceLocatorString('MyLibraryPage', routeConfiguration, { tab: WISHLIST_TAB })
        );
      });
    } else if (location.state?.to?.includes('checkout') && !fetchInProgress && orderLength === 0) {
      // listing is not bought already and user is re-rerouted after authentication
      handleSubmit({
        ...commonParams,
        currentUser,
        callSetInitialValues,
        getListing,
        onInitializeCardPaymentData,
      })({});
    }
  }, [orderLength, fetchInProgress]);

  useEffect(() => {
    const parentRefs = [firstParentRef, secondParentRef];
    const sliderRefs = [firstSliderRef, secondSliderRef];

    parentRefs.forEach((parentRef, index) => {
      if (!parentRef.current) return;

      const handleScroll = e => {
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
          e.preventDefault();
          const target = e.target;
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
  }, [listings, moreLikeListings]);

  const handleWishList = (onlyAdd = false) => {
    if (!currentUser) {
      const state = { from: `${location.pathname}${location.search}`, to: 'wishlist' };

      // signup and return back to listingPage.
      return history.push(
        createResourceLocatorString('SignupPage', routeConfiguration, {}, {}),
        state
      );
    }

    // Get previous wishlist data and mutate it with updated data
    const prevData = Array.isArray(wishlistData?.[listingType]) ? wishlistData[listingType] : [];

    const ListingUuid = listingId?.uuid;
    const isAdding = !prevData?.includes(ListingUuid);

    // in the case we only want to listing to add. If listing is already added to wishlist then do nothing.
    if (onlyAdd && !isAdding) {
      return new Promise((resolve) => { resolve() });
    }

    // Check if listingId exists in prevData and remove it if it does, else add it
    const newIds = isAdding
      ? prevData?.length > 0
        ? [...prevData, ListingUuid]
        : [ListingUuid]
      : prevData.filter(id => id !== ListingUuid); // Remove listingId if it exists

    const preferencePayload = preparePreferenceConfig(
      listing_preferences,
      listingType,
      primary_genre.length ? primary_genre : series_primary_genre,
      isAdding
    );

    const payload = {
      publicData: {
        ...(preferencePayload?.publicData ?? {}),
        wishlistData: {
          ...wishlistData,
          [listingType]: newIds,
        },
      },
    };

    return onManageWishList(payload, isAdding, listingType, { queryID, listing: currentListing });
  };

  // If a /pending-approval URL is shared, the UI requires
  // authentication and attempts to fetch the listing from own
  // listings. This will fail with 403 Forbidden if the author is
  // another user. We use this information to try to fetch the
  // public listing.
  const pendingOtherUsersListing =
    (isPendingApprovalVariant || isDraftVariant) &&
    showListingError &&
    showListingError.status === 403;
  const shouldShowPublicListingPage = pendingIsApproved || pendingOtherUsersListing;

  if (shouldShowPublicListingPage) {
    return <NamedRedirect name="ListingPage" params={params} search={location.search} />;
  }

  const topbar = <TopbarContainer />;

  const handleBeforeChange = (current, next) => {
    setCurrentSlide(next);
  }


  const handleAfterChange = (current, next) => {
    setCurrentSlide(current);

    if (next == undefined) {
      fetchNext();
    }
  }

  const handleBeforeChange2 = (current, next) => {
    setCurrentSlide2(next);
  }

  const handleAfterChange2 = (current, next) => {
    setCurrentSlide2(current);

    if (next == undefined) {
      fetchNext();
    }
  }

  if (showListingError && showListingError.status === 404) {
    // 404 listing not found
    return <NotFoundPage staticContext={props.staticContext} />;
  } else if (showListingError) {
    // Other error in fetching listing
    return <ErrorPage topbar={topbar} scrollingDisabled={scrollingDisabled} intl={intl} />;
  } else if (!currentListing.id) {
    // Still loading the listing
    return <LoadingPage topbar={topbar} scrollingDisabled={scrollingDisabled} intl={intl} />;
  }

  const {
    description = '',
    geolocation = null,
    price = null,
    title = '',
    publicData = {},
    metadata = {},
  } = currentListing.attributes;

  const {
    castAndCrews = [],
    episodes = [],
    freeEpisode,
    listingType,
    primary_genre,
    series_primary_genre,
    transactionProcessAlias,
    unitType,
  } = publicData || {};

  const richTitle = (
    <span>
      {richText(title, {
        longWordMinLength: MIN_LENGTH_FOR_LONG_WORDS_IN_TITLE,
        longWordClass: css.longWord,
      })}
    </span>
  );

  const authorAvailable = currentListing && currentListing.author;
  const userAndListingAuthorAvailable = !!(currentUser && authorAvailable);
  const isOwnListing =
    userAndListingAuthorAvailable && currentListing.author.id.uuid === currentUser.id.uuid;

  if (!(listingType && transactionProcessAlias && unitType)) {
    // Listing should always contain listingType, transactionProcessAlias and unitType)
    return (
      <ErrorPage topbar={topbar} scrollingDisabled={scrollingDisabled} intl={intl} invalidListing />
    );
  }
  const processName = resolveLatestProcessName(transactionProcessAlias.split('/')[0]);
  const isBooking = isBookingProcess(processName);
  const isPurchase = isPurchaseProcess(processName);
  const processType = isBooking ? 'booking' : isPurchase ? 'purchase' : 'inquiry';

  const currentAuthor = authorAvailable ? currentListing.author : null;
  const ensuredAuthor = ensureUser(currentAuthor);
  const noPayoutDetailsSetWithOwnListing =
    isOwnListing && (processType !== 'inquiry' && !currentUser?.attributes?.stripeConnected);
  const payoutDetailsWarning = noPayoutDetailsSetWithOwnListing ? (
    <span className={css.payoutDetailsWarning}>
      <FormattedMessage id="ListingPage.payoutDetailsWarning" values={{ processType }} />
      <NamedLink name="StripePayoutPage">
        <FormattedMessage id="ListingPage.payoutDetailsWarningLink" />
      </NamedLink>
    </span>
  ) : null;

  // When user is banned or deleted the listing is also deleted.
  // Because listing can be never showed with banned or deleted user we don't have to provide
  // banned or deleted display names for the function
  const authorDisplayName = userDisplayNameAsString(ensuredAuthor, '');

  const { formattedPrice } = priceData(price, config.currency, intl);

  const onContactUser = handleContactUser({
    ...commonParams,
    currentUser,
    callSetInitialValues,
    location,
    setInitialValues,
    setInquiryModalOpen,
  });
  // Note: this is for inquiry state in booking and purchase processes. Inquiry process is handled through handleSubmit.
  const onSubmitInquiry = handleSubmitInquiry({
    ...commonParams,
    getListing,
    onSendInquiry,
    setInquiryModalOpen,
  });
  const onSubmit = handleSubmit({
    ...commonParams,
    currentUser,
    callSetInitialValues,
    getListing,
    onInitializeCardPaymentData,
  });

  const handleOrderSubmit = values => {
    const isCurrentlyClosed = currentListing.attributes.state === LISTING_STATE_CLOSED;
    if ((isOwnListing || isCurrentlyClosed) && typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    } else {
      onSubmit(values);
    }
  };

  const facebookImages = listingImages(currentListing, 'facebook');
  const twitterImages = listingImages(currentListing, 'twitter');
  const schemaImages = listingImages(
    currentListing,
    `${config.layout.listingImage.variantPrefix}-2x`
  ).map(img => img.url);
  const marketplaceName = config.marketplaceName;
  const schemaTitle = intl.formatMessage(
    { id: 'ListingPage.schemaTitle' },
    { title, price: formattedPrice, marketplaceName }
  );
  // You could add reviews, sku, etc. into page schema
  // Read more about product schema
  // https://developers.google.com/search/docs/advanced/structured-data/product
  const productURL = `${config.marketplaceRootURL}${location.pathname}${location.search}${location.hash}`;
  const currentStock = currentListing.currentStock?.attributes?.quantity || 0;
  const schemaAvailability = !currentListing.currentStock
    ? null
    : currentStock > 0
      ? 'https://schema.org/InStock'
      : 'https://schema.org/OutOfStock';

  const availabilityMaybe = schemaAvailability ? { availability: schemaAvailability } : {};

  const isFilmTabSelected = showTabType === FILM_TAB;
  const isCastCrewTabSelected = showTabType === CAST_CREW;

  const desktopTabs = [
    {
      text: (
        <Heading as="h3" rootClassName={css.desktopReviewsTitle}>
          <FormattedMessage
            id={listingType == FILM_PRODUCTS ? "ListingPage.filmTabTitle" : "ListingPage.seriesTabTitle"}
          />
        </Heading>
      ),
      selected: isFilmTabSelected,
      onClick: () => setShowTabType(FILM_TAB),
    },
    {
      text: (
        <Heading as="h3" rootClassName={css.desktopReviewsTitle}>
          <FormattedMessage
            id="ListingPage.castCewTabTitle"
          />
        </Heading>
      ),
      selected: isCastCrewTabSelected,
      onClick: () => setShowTabType(CAST_CREW),
    },
  ];

  // Group the castAndCrews by mainRole
  const groupedByMainRole = castAndCrews && castAndCrews.length && castAndCrews.reduce((acc, cast) => {
    const mainRole = formatString(cast.roles.mainRole);
    if (!acc[mainRole]) {
      acc[mainRole] = [];
    }
    acc[mainRole].push({
      subRole: formatString(cast.roles.subRole),
      name: cast.name,
    });
    return acc;
  }, {});


  const CustomArrow = ({ direction, onClick, disabled }) => (
    <button disabled={disabled} onClick={onClick} className={css[`${direction}Arrow`]}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="61"
        height="61"
        viewBox="0 0 61 61"
        fill="none"
      >
        <g clipPath="url(#clip0_2253_5879)">
          <path
            d="M0.22398 8.16448L0.224077 8.16458C0.671583 7.73798 1.26612 7.5 1.88439 7.5C2.50266 7.5 3.0972 7.73798 3.5447 8.16458L24.7917 28.4089C25.0275 28.6336 25.2153 28.9039 25.3436 29.2033C25.4719 29.5028 25.5381 29.8252 25.5381 30.151C25.5381 30.4768 25.4719 30.7992 25.3436 31.0986C25.2153 31.3981 25.0275 31.6684 24.7917 31.8931L3.5447 52.1374C3.09719 52.564 2.50265 52.802 1.88439 52.802C1.26612 52.802 0.671581 52.564 0.224075 52.1374L0.215422 52.1291L0.215523 52.129L0.196924 52.1104C-0.0224037 51.9008 -0.197168 51.6491 -0.316874 51.3702C-0.437468 51.0893 -0.499655 50.7868 -0.499655 50.4811C-0.499655 50.1755 -0.437467 49.873 -0.316873 49.5921C-0.196279 49.3112 -0.0198039 49.0577 0.201822 48.8472L19.8293 30.1547L0.201828 11.4548L0.22398 8.16448ZM0.22398 8.16448L0.215538 8.17292M0.22398 8.16448L0.215538 8.17292M0.215538 8.17292L0.196897 8.19156M0.215538 8.17292L0.196897 8.19156M0.196897 8.19156C-0.022419 8.40118 -0.197174 8.65293 -0.316872 8.93174C-0.437466 9.21264 -0.499653 9.51514 -0.499653 9.82083C-0.499653 10.1265 -0.437466 10.429 -0.316872 10.7099C-0.196373 10.9906 -0.0200769 11.2439 0.201305 11.4543L0.196897 8.19156Z"
            fill="white"
            stroke="white"
          />
        </g>
        <defs>
          <clipPath id="clip0_2253_5879">
            <rect width="61" height="61" fill="white" transform="translate(61) rotate(90)" />
          </clipPath>
        </defs>
      </svg>
    </button>
  );






  const settings = {
    className: 'slider variable-width',
    dots: false,
    infinite: false,
    centerMode: false,
    slidesToShow: 1,
    slidesToScroll: 1,
    variableWidth: true,
    swipe: false,
    cssEase: "linear",
    prevArrow: <CustomArrow direction="prev" disabled={currentSlide === 0} />,
    nextArrow: <CustomArrow direction="next" disabled={currentSlide >= slideCount - 4} />, // Assuming 4 visible items
    beforeChange: (current, next) => handleBeforeChange(current, next),
    afterChange: (current, next) => handleAfterChange(current, next),
    onInit: () => setSlideCount(listings.length),
    responsive: [
      {
        breakpoint: 767,
        settings: {
          slidesToShow: 1,
          arrows: false,
          infinite: false,
          swipe: true,
        },
      },
    ],
  };

  const settings2 = {
    className: 'slider variable-width',
    dots: false,
    infinite: false,
    centerMode: false,
    slidesToShow: 1,
    slidesToScroll: 1,
    variableWidth: true,
    swipe: false,
    cssEase: "linear",
    prevArrow: <CustomArrow direction="prev" disabled={currentSlide2 === 0} />,
    nextArrow: <CustomArrow direction="next" disabled={currentSlide2 >= slideCount2 - 4} />, // Assuming 4 visible items
    beforeChange: (current, next) => handleBeforeChange2(current, next),
    afterChange: (current, next) => handleAfterChange2(current, next),
    onInit: () => setSlideCount2(moreLikeListings.length),
    responsive: [
      {
        breakpoint: 767,
        settings: {
          slidesToShow: 1,
          arrows: false,
          infinite: false,
          swipe: true,
        },
      },
    ],
  };

  const deviceWidth = getCurrentDeviceWidth();

  const detailsClassName = classNames(css.tabContent, css.tabContentVisible);

  return (
    <Page
      title={schemaTitle}
      scrollingDisabled={scrollingDisabled}
      author={authorDisplayName}
      description={description}
      facebookImages={facebookImages}
      twitterImages={twitterImages}
      schema={{
        '@context': 'http://schema.org',
        '@type': 'Product',
        description: description,
        name: schemaTitle,
        image: schemaImages,
        offers: {
          '@type': 'Offer',
          url: productURL,
          ...priceForSchemaMaybe(price, intl),
          ...availabilityMaybe,
        },
      }}
      className={css.listingPage}
    >
      <LayoutSingleColumn className={css.pageRoot} topbar={topbar} footer={<FooterContainer />}>
        <div className={css.contentWrapperForProductLayout}>
          {showFreeVideo ? <VideoViewerPanel
            className={detailsClassName}
            currentListing={currentListing}
            onUserWatchingPaidContent={onUserWatchingPaidContent}
            onManageDisableScrolling={onManageDisableScrolling}
            setShowFreeVideo={setShowFreeVideo}
            handleWishList={handleWishList}
            currentUser={currentUser}
            intl={intl}
            handleOrderSubmit={handleOrderSubmit}
          />
            : (<div className={css.mainColumnForProductLayout}>
              <div className={css.previewContainer}>
                <ListingBannerDetails
                  listing={currentListing}
                  intl={intl}
                  handleOrderSubmit={handleOrderSubmit}
                  reviews={reviews}
                  startTrailer={startTrailer}
                  handleWishList={handleWishList}
                  currentUser={currentUser}
                  queryID={queryID}
                  orderLength={orderLength}
                  onManageDisableScrolling={onManageDisableScrolling}
                  isAssetsReady={isAssetsReady}
                />
              </div>
              <div className={css.desktopReviewsTabNav}> <ButtonTabNavHorizontal tabs={castAndCrews.length > 0 ? desktopTabs : desktopTabs.splice(0, 1)} isListingPage={true} /> </div>
              <div className={css.listingDetails}>
                {isFilmTabSelected ?
                  <div className={css.authorSection}>
                    <SectionAuthorMaybe
                      title={title}
                      listing={currentListing}
                      authorDisplayName={authorDisplayName}
                      onContactUser={onContactUser}
                      isInquiryModalOpen={isAuthenticated && inquiryModalOpen}
                      onCloseInquiryModal={() => setInquiryModalOpen(false)}
                      sendInquiryError={sendInquiryError}
                      sendInquiryInProgress={sendInquiryInProgress}
                      onSubmitInquiry={onSubmitInquiry}
                      currentUser={currentUser}
                      onManageDisableScrolling={onManageDisableScrolling}
                      history={history}
                      routeConfiguration={routeConfiguration}
                    />
                    {castAndCrews.length > 0 ? <div className={css.castSection}>
                      <div className={css.castItem}>
                        <span className={css.castCrewTitle}>
                          <FormattedMessage id="ListingPage.castCrew" />
                        </span>

                        <span className={css.viewAllBtn} onClick={() => setShowTabType(CAST_CREW)}>
                          <FormattedMessage id="ListingPage.viewAll" />
                        </span>
                      </div>
                      <div className={css.castItemsWrapper}>
                        {castAndCrews.slice(0, 3).map((cast) => {
                          return (
                            <div className={css.castItem}>
                              <span>{formatString(cast.roles.subRole)}</span>   <span>{cast.name}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div> : null}
                  </div>
                  : isCastCrewTabSelected ?
                    <div className={css.castSection2}>
                      <div>
                        {Object.entries(groupedByMainRole).map(([mainRole, subRoles]) => {
                          return (
                            <div key={mainRole} className={css.castSectionItem}>
                              <h4 className={css.sectionHeadingWithExtraMargin}>{mainRole.split(' ')[0]}</h4>
                              <div className={classNames(css.castItemsWrapper, css.castItemsWrapper2)}>

                                {subRoles.map((cast, index) => (
                                  <div key={index} className={css.castItem}>
                                    <span>{cast.subRole}</span> <span>{cast.name}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div> : null}

                {episodes && episodes.length > 0 ?
                  <div className={css.sliderContent}>
                    <div>
                      {EpisodesList({ episodes, freeEpisode, showCount, setShowCount, setShowFreeVideo, isAuthenticated })}
                    </div>
                  </div>
                  : null}

                {isFilmTabSelected ? <div>
                  {listings && listings?.filter((e) => e.id.uuid != listingId.uuid)?.length > 0 && (
                    <div className={css.sliderContent}>
                      <div className={css.sliderInnerbox}>
                        <div className={css.titleWithBtn}>
                          <h4 className={css.sectionHeadingWithExtraMargin}>
                            <FormattedMessage
                              id="ListingPage.moreListings"
                              values={{ displayName: authorDisplayName }}
                            />
                          </h4>
                          <NamedLink name="SearchPage" params={{ searchId: LISTING_SEARCH_ID }}>
                            <span className={css.viewAllBtn}><FormattedMessage id="ListingPage.viewAll" /></span>
                          </NamedLink>
                        </div>

                        <div className={css.listingCardsScroll} ref={firstParentRef}>
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
                            {listings && listings?.filter((e) => e.id.uuid != listingId.uuid).map(l => (
                              <SwiperSlide style={{ width: deviceWidth < 767 ? 273 : 295 }} className={css.listing} key={l.id.uuid}>
                                <ListingCard listing={l} showDetails={true} reviews={reviews} />
                              </SwiperSlide>
                            ))}
                          </Swiper>
                        </div>
                      </div>
                    </div>
                  )}
                </div> : null}


                <div>
                  {(moreLikeListings && moreLikeListings)?.filter((e) => e.id.uuid != listingId.uuid)?.length > 0 ? (
                    <div className={css.sliderContent}>
                      <div className={css.sliderInnerbox}>
                        <div className={css.titleWithBtn}>
                          <h4 className={css.sliderTitle}>
                            <FormattedMessage
                              id="ListingPage.moreLikeThis"
                            />
                          </h4>
                          <NamedLink name="SearchPage" params={{ searchId: LISTING_SEARCH_ID }}>
                            <span className={css.viewAllBtn}><FormattedMessage id="ListingPage.viewAll" /></span>
                          </NamedLink>
                        </div>
                        <div className={css.listingCardsScroll} ref={secondParentRef}>
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
                            {(moreLikeListings && moreLikeListings?.filter((e) => e.id.uuid != listingId.uuid)).map(l => (
                              <SwiperSlide style={{ width: deviceWidth < 767 ? 273 : 295 }} key={l.id.uuid}>
                                <div style={{ width: deviceWidth < 767 ? 273 : 295 }} className={css.listing} key={l.id.uuid}>
                                  <ListingCard listing={l} showDetails={true} reviews={reviews} />
                                </div>
                              </SwiperSlide>
                            ))}
                          </Swiper>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
                {(isFilmTabSelected && reviews.length > 0) ? <SectionReviews reviews={reviews} fetchReviewsError={fetchReviewsError} publicData={publicData} /> : null}

              </div>
            </div>)
          }
          <div>
          </div>
        </div>
      </LayoutSingleColumn>
    </Page>
  );
};

ListingPageComponent.defaultProps = {
  currentUser: null,
  inquiryModalOpenForListingId: null,
  showListingError: null,
  reviews: [],
  fetchReviewsError: null,
  monthlyTimeSlots: null,
  sendInquiryError: null,
  lineItems: null,
  fetchLineItemsError: null,
};

ListingPageComponent.propTypes = {
  // from useHistory
  history: shape({
    push: func.isRequired,
  }).isRequired,
  // from useLocation
  location: shape({
    search: string,
  }).isRequired,

  // from useIntl
  intl: intlShape.isRequired,

  // from useConfiguration
  config: object.isRequired,
  // from useRouteConfiguration
  routeConfiguration: arrayOf(propTypes.route).isRequired,

  params: shape({
    id: string.isRequired,
    slug: string,
    variant: oneOf([LISTING_PAGE_DRAFT_VARIANT, LISTING_PAGE_PENDING_APPROVAL_VARIANT]),
  }).isRequired,

  isAuthenticated: bool.isRequired,
  currentUser: propTypes.currentUser,
  getListing: func.isRequired,
  getOwnListing: func.isRequired,
  onManageDisableScrolling: func.isRequired,
  scrollingDisabled: bool.isRequired,
  inquiryModalOpenForListingId: string,
  showListingError: propTypes.error,
  callSetInitialValues: func.isRequired,
  reviews: arrayOf(propTypes.review),
  fetchReviewsError: propTypes.error,
  monthlyTimeSlots: object,
  // monthlyTimeSlots could be something like:
  // monthlyTimeSlots: {
  //   '2019-11': {
  //     timeSlots: [],
  //     fetchTimeSlotsInProgress: false,
  //     fetchTimeSlotsError: null,
  //   }
  // }
  sendInquiryInProgress: bool.isRequired,
  sendInquiryError: propTypes.error,
  onSendInquiry: func.isRequired,
  onInitializeCardPaymentData: func.isRequired,
  onFetchTransactionLineItems: func.isRequired,
  lineItems: array,
  fetchLineItemsInProgress: bool.isRequired,
  fetchLineItemsError: propTypes.error,
};

const EnhancedListingPage = props => {
  const config = useConfiguration();
  const routeConfiguration = useRouteConfiguration();
  const intl = useIntl();
  const history = useHistory();
  const location = useLocation();
  const queryID = useQuery(location.search).get('queryID');

  const showListingError = props.showListingError;
  const isVariant = props.params?.variant?.length > 0;
  if (isForbiddenError(showListingError) && !isVariant) {
    // This can happen if private marketplace mode is active
    return (
      <NamedRedirect
        name="SignupForUserTypePage"
        params={{ userType: AUDIENCE_USER_TYPE }}
        state={{ from: `${location.pathname}${location.search}${location.hash}` }}
      />
    );
  }

  const currentUser = props.currentUser;
  const isPrivateMarketplace = config.accessControl.marketplace.private === true;
  const isUnauthorizedUser = currentUser && !isUserAuthorized(currentUser);
  const hasUserPendingApprovalError = isErrorUserPendingApproval(showListingError);
  if ((isPrivateMarketplace && isUnauthorizedUser) || hasUserPendingApprovalError) {
    return (
      <NamedRedirect
        name="NoAccessPage"
        params={{ missingAccessRight: NO_ACCESS_PAGE_USER_PENDING_APPROVAL }}
      />
    );
  }

  return (
    <ListingPageComponent
      config={config}
      routeConfiguration={routeConfiguration}
      intl={intl}
      history={history}
      location={location}
      queryID={queryID}
      {...props}
    />
  );
};

const mapStateToProps = state => {
  const { isAuthenticated } = state.auth;
  const {
    showListingError,
    reviews,
    fetchReviewsError,
    monthlyTimeSlots,
    sendInquiryInProgress,
    sendInquiryError,
    lineItems,
    fetchLineItemsInProgress,
    fetchLineItemsError,
    inquiryModalOpenForListingId,
    moreLikeListingRef,
  } = state.ListingPage;
  const { currentUser } = state.user;
  const { orderLength, fetchInProgress } = state.InboxPage;

  const { userListingRefs } = state.ProfilePage;

  const getListing = id => {
    const ref = { id, type: 'listing' };
    const listings = getMarketplaceEntities(state, [ref]);
    return listings.length === 1 ? listings[0] : null;
  };

  const getOwnListing = id => {
    const ref = { id, type: 'ownListing' };
    const listings = getMarketplaceEntities(state, [ref]);
    return listings.length === 1 ? listings[0] : null;
  };

  return {
    isAuthenticated,
    currentUser,
    getListing,
    getOwnListing,
    scrollingDisabled: isScrollingDisabled(state),
    inquiryModalOpenForListingId,
    showListingError,
    reviews,
    fetchReviewsError,
    monthlyTimeSlots,
    lineItems,
    fetchLineItemsInProgress,
    fetchLineItemsError,
    sendInquiryInProgress,
    sendInquiryError,
    moreLikeListings: (moreLikeListingRef && moreLikeListingRef.length > 0) ? getMarketplaceEntities(state, moreLikeListingRef) : [],
    listings: getMarketplaceEntities(state, userListingRefs),
    orderLength,
    fetchInProgress,
  };
};

const mapDispatchToProps = dispatch => ({
  onManageDisableScrolling: (componentId, disableScrolling) =>
    dispatch(manageDisableScrolling(componentId, disableScrolling)),
  callSetInitialValues: (setInitialValues, values, saveToSessionStorage) =>
    dispatch(setInitialValues(values, saveToSessionStorage)),
  onFetchTransactionLineItems: params => dispatch(fetchTransactionLineItems(params)),
  onSendInquiry: (listing, message) => dispatch(sendInquiry(listing, message)),
  onInitializeCardPaymentData: () => dispatch(initializeCardPaymentData()),
  onFetchTimeSlots: (listingId, start, end, timeZone) =>
    dispatch(fetchTimeSlots(listingId, start, end, timeZone)),
  onManageWishList: (payload, isAdding, listingType, data) =>
    dispatch(updateWishlist(payload, isAdding, listingType, data)),
  onUserWatchingPaidContent: (params) => dispatch(userStartedWatchingPaidContent(params)),
  onUpdateProfile: (payload) => dispatch(updateProfile(payload))
});

// Note: it is important that the withRouter HOC is **outside** the
// connect HOC, otherwise React Router won't rerender any Route
// components since connect implements a shouldComponentUpdate
// lifecycle hook.
//
// See: https://github.com/ReactTraining/react-router/issues/4671
const ListingPage = compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(EnhancedListingPage);

export default ListingPage;
