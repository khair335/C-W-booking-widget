import React, { useEffect, useState, useRef } from 'react';
import { bool, arrayOf, oneOfType } from 'prop-types';
import { compose } from 'redux';
import { connect, useDispatch } from 'react-redux';
import classNames from 'classnames';
import Slider from "react-slick";

import { useConfiguration } from '../../context/configurationContext';
import { FormattedMessage, useIntl } from '../../util/reactIntl';
import {
  REVIEW_TYPE_OF_PROVIDER,
  REVIEW_TYPE_OF_CUSTOMER,
  SCHEMA_TYPE_MULTI_ENUM,
  SCHEMA_TYPE_TEXT,
  propTypes,
  LIVE_EVENT_PRODUCTS,
  FILM_PRODUCTS,
  SERIES_PRODUCTS,
  FEATURED,
  RECENTLY_ADDED,
  FILM,
  SERIES,
  LIVE_EVENTS,
  CREATOR_USER_TYPE,
} from '../../util/types';
import {
  NO_ACCESS_PAGE_USER_PENDING_APPROVAL,
  PROFILE_PAGE_PENDING_APPROVAL_VARIANT,
} from '../../util/urlHelpers';
import { isErrorUserPendingApproval, isForbiddenError, isNotFoundError } from '../../util/errors';
import { pickCustomFieldProps } from '../../util/fieldHelpers';
import { isUserAuthorized } from '../../util/userHelpers';
import { richText } from '../../util/richText';

import { isScrollingDisabled } from '../../ducks/ui.duck';
import { getMarketplaceEntities } from '../../ducks/marketplaceData.duck';
import {
  Heading,
  H2,
  H4,
  Page,
  AvatarLarge,
  NamedLink,
  ListingCard,
  Reviews,
  ButtonTabNavHorizontal,
  NamedRedirect,
  LayoutSingleColumn,
  H5,
  ResponsiveImage,
  Menu,
  MenuLabel,
  Button,
  MenuContent,
  MenuItem,
} from '../../components';

import TopbarContainer from '../../containers/TopbarContainer/TopbarContainer';
import FooterContainer from '../../containers/FooterContainer/FooterContainer';
import NotFoundPage from '../../containers/NotFoundPage/NotFoundPage';

import css from './ProfilePage.module.css';
import SectionDetailsMaybe from './SectionDetailsMaybe';
import SectionTextMaybe from './SectionTextMaybe';
import SectionMultiEnumMaybe from './SectionMultiEnumMaybe';
import IconCollection from '../../components/IconCollection/IconCollection';
import { formatLabel } from '../../util/dataExtractor';
import ContentSection from './ContentSection';
import { LinkComponent } from '../TopbarContainer/Topbar/TopbarDesktop/CustomLinksMenu/LinksMenu';
import { useRouteConfiguration } from '../../context/routeConfigurationContext';
import { getResolvedCustomLinks, sortCustomLinks, useQuery } from '../../util/data';
import SocialShare from '../../components/SocialShare/SocialShare';
import { useLocation } from 'react-router-dom';
import { updateWishlist } from '../MyLibraryPage/MyLibraryPage.duck';
import { getCurrentDeviceWidth } from '../../components/CurrentViewPort/CurrentViewPort';
import { CREATOR_SEARCH_ID } from '../../constants';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Mousewheel, Keyboard } from 'swiper/modules';



const draftId = '00000000-0000-0000-0000-000000000000';
const draftSlug = 'draft';

const sourceUrl = process.env.REACT_APP_GUMLET_SOURCE_URL;

const MAX_MOBILE_SCREEN_WIDTH = 768;
const MIN_LENGTH_FOR_LONG_WORDS = 20;

const FEATURED_SECTION = 'featuredSection';
const FILM_SECTION = 'filmSection';
const SERIES_SECTION = 'seriesSection';
const LIVE_EVENT_SECTION = 'liveEventSection';

export const AsideContent = props => {
  const { user, displayName, showLinkToProfileSettingsPage } = props;
  return (
    <div className={css.asideContent}>
      <div className={css.bannerContainer}>
        <AvatarLarge className={css.avatar} user={user} disableProfileLink profileBanner={true} />
      </div>
      <div className={css.avatarInfoContainer}>
        <AvatarLarge className={css.avatar} user={user} disableProfileLink />
        <H2 as="h1" className={css.mobileHeading}>
          {displayName ? (
            <FormattedMessage id="ProfilePage.mobileHeading" values={{ name: displayName }} />
          ) : null}
        </H2>
        {showLinkToProfileSettingsPage ? (
          <>
            <NamedLink className={css.editLinkMobile} name="ProfileSettingsPage">
              <FormattedMessage id="ProfilePage.editProfileLinkMobile" />
            </NamedLink>
            <NamedLink className={css.editLinkDesktop} name="ProfileSettingsPage">
              <FormattedMessage id="ProfilePage.editProfileLinkDesktop" />
            </NamedLink>
          </>
        ) : null}
      </div>
    </div>
  );
};

export const ReviewsErrorMaybe = props => {
  const { queryReviewsError } = props;
  return queryReviewsError ? (
    <p className={css.error}>
      <FormattedMessage id="ProfilePage.loadingReviewsFailed" />
    </p>
  ) : null;
};

export const MobileReviews = props => {
  const { reviews, queryReviewsError } = props;
  const reviewsOfProvider = reviews.filter(r => r.attributes.type === REVIEW_TYPE_OF_PROVIDER);
  const reviewsOfCustomer = reviews.filter(r => r.attributes.type === REVIEW_TYPE_OF_CUSTOMER);
  return (
    <div className={css.mobileReviews}>
      <H4 as="h2" className={css.mobileReviewsTitle}>
        <FormattedMessage
          id="ProfilePage.reviewsFromMyCustomersTitle"
          values={{ count: reviewsOfProvider.length }}
        />
      </H4>
      <ReviewsErrorMaybe queryReviewsError={queryReviewsError} />
      <Reviews reviews={reviewsOfProvider} />
      <H4 as="h2" className={css.mobileReviewsTitle}>
        <FormattedMessage
          id="ProfilePage.reviewsAsACustomerTitle"
          values={{ count: reviewsOfCustomer.length }}
        />
      </H4>
      <ReviewsErrorMaybe queryReviewsError={queryReviewsError} />
      <Reviews reviews={reviewsOfCustomer} />
    </div>
  );
};

export const DesktopReviews = props => {
  const [showReviewsType, setShowReviewsType] = useState(REVIEW_TYPE_OF_PROVIDER);
  const { reviews, queryReviewsError } = props;
  const reviewsOfProvider = reviews.filter(r => r.attributes.type === REVIEW_TYPE_OF_PROVIDER);
  const reviewsOfCustomer = reviews.filter(r => r.attributes.type === REVIEW_TYPE_OF_CUSTOMER);
  const isReviewTypeProviderSelected = showReviewsType === REVIEW_TYPE_OF_PROVIDER;
  const isReviewTypeCustomerSelected = showReviewsType === REVIEW_TYPE_OF_CUSTOMER;
  const desktopReviewTabs = [
    {
      text: (
        <Heading as="h3" rootClassName={css.desktopReviewsTitle}>
          <FormattedMessage
            id="ProfilePage.reviewsFromMyCustomersTitle"
            values={{ count: reviewsOfProvider.length }}
          />
        </Heading>
      ),
      selected: isReviewTypeProviderSelected,
      onClick: () => setShowReviewsType(REVIEW_TYPE_OF_PROVIDER),
    },
    {
      text: (
        <Heading as="h3" rootClassName={css.desktopReviewsTitle}>
          <FormattedMessage
            id="ProfilePage.reviewsAsACustomerTitle"
            values={{ count: reviewsOfCustomer.length }}
          />
        </Heading>
      ),
      selected: isReviewTypeCustomerSelected,
      onClick: () => setShowReviewsType(REVIEW_TYPE_OF_CUSTOMER),
    },
  ];

  return (
    <div className={css.desktopReviews}>
      <div className={css.desktopReviewsWrapper}>
        <ButtonTabNavHorizontal className={css.desktopReviewsTabNav} tabs={desktopReviewTabs} />

        <ReviewsErrorMaybe queryReviewsError={queryReviewsError} />

        {isReviewTypeProviderSelected ? (
          <Reviews reviews={reviewsOfProvider} />
        ) : (
          <Reviews reviews={reviewsOfCustomer} />
        )}
      </div>
    </div>
  );
};

export const CustomUserFields = props => {
  const { publicData, metadata, userFieldConfig } = props;

  const shouldPickUserField = fieldConfig => fieldConfig?.showConfig?.displayInProfile !== false;
  const propsForCustomFields =
    pickCustomFieldProps(publicData, metadata, userFieldConfig, 'userType', shouldPickUserField) ||
    [];

  return (
    <>
      <SectionDetailsMaybe {...props} />
      {propsForCustomFields.map(customFieldProps => {
        const { schemaType, ...fieldProps } = customFieldProps;
        return schemaType === SCHEMA_TYPE_MULTI_ENUM ? (
          <SectionMultiEnumMaybe {...fieldProps} />
        ) : schemaType === SCHEMA_TYPE_TEXT ? (
          <SectionTextMaybe {...fieldProps} />
        ) : null;
      })}
    </>
  );
};


export const MainContent = props => {
  const config = useConfiguration();
  const routeConfiguration = useRouteConfiguration();
  const location = useLocation();
  const pageUrl = `${process.env.REACT_APP_MARKETPLACE_ROOT_URL}${location.pathname}`;
  const [showListingType, setShowListingType] = useState(FEATURED);
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [slideCount, setSlideCount] = React.useState(0);
  const [currentSlide2, setCurrentSlide2] = React.useState(0);
  const [slideCount2, setSlideCount2] = React.useState(0);
  const [copied, setCopied] = useState(false)
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



  const {
    userShowError,
    bio,
    displayName,
    listings = [],
    queryListingsError,
    publicData,
    showLinkToProfileSettingsPage,
    user,
    currentUser,
    intl,
    onManageWishList,
    queryID,
    fetchNext = () => { }
  } = props;

  const sortedCustomLinks = sortCustomLinks(config.topbar?.customLinks);
  const customLinks = getResolvedCustomLinks(sortedCustomLinks, routeConfiguration);

  const { userProfileBanner, userProfileImage, userName } = publicData || {};
  const creatorId = user?.id?.uuid || null;
  const filmListings = (listings?.filter((e) => e.attributes.publicData.listingType == FILM_PRODUCTS)) || [];
  const seriesListings = (listings?.filter((e) => e.attributes.publicData.listingType == SERIES_PRODUCTS)) || [];
  const eventsListings = (listings?.filter((e) => e.attributes.publicData.listingType == LIVE_EVENT_PRODUCTS)) || [];

  const hasListings = listings.length > 0;
  const hasMatchMedia = typeof window !== 'undefined' && window?.matchMedia;
  const isMobileLayout = hasMatchMedia
    ? window.matchMedia(`(max-width: ${MAX_MOBILE_SCREEN_WIDTH}px)`)?.matches
    : true;

  const hasBio = !!bio;
  const bioWithLinks = richText(bio, {
    linkify: true,
    longWordMinLength: MIN_LENGTH_FOR_LONG_WORDS,
    longWordClass: css.longWord,
  });

  const listingsContainerClasses = classNames(css.listingsContainer, {
    [css.withBioMissingAbove]: !hasBio,
  });

  if (userShowError || queryListingsError) {
    return (
      <p className={css.error}>
        <FormattedMessage id="ProfilePage.loadingDataFailed" />
      </p>
    );
  }

  const isFeaturedSelected = showListingType === FEATURED;
  const isRecentAddedSelected = showListingType === RECENTLY_ADDED;
  const isFilmSelected = showListingType === FILM;
  const isSeriesSelected = showListingType === SERIES;
  const isLiveEventsSelected = showListingType === LIVE_EVENTS;


  const filteredListings = listings || [];

  const handleListingTabClick = (type, id) => {
    setShowListingType(type);
    typeof window !== undefined &&
      window.document
        .getElementById(id)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
  };

  const showListingTabs = [
    {
      id: FEATURED_SECTION,
      text: (
        <Heading as="p" rootClassName={css.desktopReviewsTitle}>
          <FormattedMessage
            id="ProfilePage.featuredTitle"
          />
        </Heading>
      ),
      selected: isFeaturedSelected,
      onClick: () => handleListingTabClick(FEATURED, FEATURED_SECTION),
    },
    {
      id: FILM_SECTION,
      text: (
        <Heading as="p" rootClassName={css.desktopReviewsTitle}>
          <FormattedMessage
            id="ProfilePage.filmTitle"
            values={{ count: filmListings.length }}
          />
        </Heading>
      ),
      selected: isFilmSelected,
      onClick: () => handleListingTabClick(FILM, FILM_SECTION),
    },
    {
      id: SERIES_SECTION,
      text: (
        <Heading as="p" rootClassName={css.desktopReviewsTitle}>
          <FormattedMessage
            id="ProfilePage.seriesTitle"
            values={{ count: seriesListings.length }}
          />
        </Heading>
      ),
      selected: isSeriesSelected,
      onClick: () => handleListingTabClick(SERIES, SERIES_SECTION),
    }
  ];

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

  const firstSliderRef = useRef();
  const secondSliderRef = useRef();

  const sliderRefs = [firstSliderRef, secondSliderRef]; // Add more refs as needed

  // Create separate parent refs for each slider
  const firstParentRef = useRef(null);
  const secondParentRef = useRef(null);
  const parentRefs = [firstParentRef, secondParentRef];

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
  }, [showLinkToProfileSettingsPage, hasListings]);

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
    onInit: () => setSlideCount2(filteredListings.length),
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
  const bannerUrl = `${sourceUrl}/${userProfileBanner?.key}`;

  // Inline style for dynamic background image
  const backgroundStyle = {
    backgroundImage: `linear-gradient(211deg, rgba(0, 0, 0, 0) 17.23%, #000 80.53%), url(${bannerUrl})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  };

  //
  const wishlistData = currentUser?.attributes.profile.publicData.wishlistData || {};

  const addToWishListButtonText =
    (Object.keys(wishlistData).length > 0 &&
      wishlistData?.creatorIds?.includes(creatorId)) ?
      <><IconCollection icon="icon-wishlist-active" /> &nbsp; {intl.formatMessage({ id: "ListingDetails.addedToCreatorsButtonText" })} </>
      : <>
        <IconCollection icon="plus-icon" /> &nbsp;{intl.formatMessage({ id: 'ListingDetails.addToCreatorsButtonText' })}</>
  const handleWishList = () => {
    // Get previous wishlist data and mutate it with updated data
    const prevData = Array.isArray(wishlistData?.creatorIds) ? wishlistData.creatorIds : [];

    const isAdding = !prevData?.includes(creatorId);

    // Check if listingId exists in prevData and remove it if it does, else add it
    const newIds = isAdding
      ? prevData?.length > 0
        ? [...prevData, creatorId]
        : [creatorId] // Add creatorId if it doesn't exist
      : prevData.filter(id => id !== creatorId); // Remove creatorId if it exists

    let payload = {
      publicData: {
        wishlistData: {
          ...wishlistData,
          creatorIds: newIds,
        },
      },
    };

    onManageWishList(payload, isAdding, CREATOR_USER_TYPE, { queryID, user });
  };
  const creatorViewContentSection = [
    {
      id: FILM_SECTION,
      formattedMessage: <FormattedMessage id={'ProfilePage.uploadedFilm'} />,
      title: (
        <FormattedMessage
          id={'ProfilePage.filmSection'}
          values={{ count: filmListings.length }}
        />
      ),
      listingType: FILM_PRODUCTS,
      content: filmListings,
    },
    {
      id: SERIES_SECTION,
      formattedMessage: <FormattedMessage id={'ProfilePage.uploadedSeries'} />,
      title: (
        <FormattedMessage
          id={'ProfilePage.seriesSection'}
          values={{ count: seriesListings.length }}
        />
      ),
      listingType: SERIES_PRODUCTS,
      content: seriesListings,
    },

  ];

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(pageUrl)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 3000); // Reset copied state after 2 seconds
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  };

  const deviceWidth = getCurrentDeviceWidth();

  return (
    <div className={css.profilePageContainer}>
      {showLinkToProfileSettingsPage ? (
        <div>
          <div className={css.asideContent} style={backgroundStyle}>
            <div className={css.bannerContainer}></div>
            <div className={css.avatarContainerWrapper}>
              <div className={css.avatarInfoContainer}>
                <div className={css.avatarInfoContainerWrapper}>
                  <ResponsiveImage
                    gumletImage={{ sourceUrl, key: userProfileImage?.key }}
                    transformWidth={500}
                    alt="Profile Image"
                    className={css.avatar}
                  />
                  <div className={css.avatarInfoWrapper}>
                    <H2 as="h1" className={css.mobileHeading}>
                      {displayName ? (
                        <FormattedMessage
                          id="ProfilePage.mobileHeading"
                          values={{ name: displayName }}
                        />
                      ) : null}
                    </H2>
                    <H5 as="h5" className={css.desktopHeading}>
                      {userName}
                    </H5>
                    <h2 className={css.labelName}>
                      {displayName}
                    </h2>

                    <div className={css.editProfileContainer}>
                      <div className={css.shareButtonWrapper}>
                        {/* <Menu>
                          <MenuLabel
                            className={css.linkMenuLabel}
                            isOpenClassName={css.linkMenuIsOpen}
                          >
                            <div className={css.topbarLink}>
                              <Button className={css.uploadContentButton}>
                                <span>
                                  <FormattedMessage id="ManageListingsPage.uploadContent" />
                                </span>
                              </Button>
                            </div>
                          </MenuLabel>
                          <MenuContent className={css.linkMenuContent}>
                            {customLinks.map(linkConfig => {
                              return (
                                <MenuItem key={linkConfig.text} className={css.menuItem}>
                                  <LinkComponent
                                    linkConfig={linkConfig}
                                    currentPage={'ManageListingsPage'}
                                  />
                                </MenuItem>
                              );
                            })}
                          </MenuContent>
                        </Menu> */}
                        <div className={css.topbarLink}>
                          <NamedLink name="NewListingPage" >
                            <Button className={css.uploadContentButton}>
                              <span>
                                <FormattedMessage id="ManageListingsPage.uploadContent" />
                              </span>
                            </Button>
                          </NamedLink>
                        </div>
                        <NamedLink name="ProfileSettingsPage" className={css.editProfileLink}>
                          <IconCollection icon="edit-pencil-icon" />
                          <FormattedMessage id="ProfilePage.editProfile" />
                        </NamedLink>
                        <span onClick={copyToClipboard} className={css.shareButton}>
                          <IconCollection icon="icon-share" />
                          {copied ? (
                            <FormattedMessage id="ProfilePage.copiedToClipboard" />
                          ) : (
                            <FormattedMessage id="ProfilePage.share" />
                          )}
                        </span>
                      </div>

                      <div className={css.socialShareWrapper}>
                        <SocialShare currentUser={currentUser} pointer={css.pointer} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className={css.bioContainer}>
                  <div>{hasBio ? <p className={css.bio}>{bioWithLinks}</p> : null}</div>
                  <div className={css.bioCountContainer}>
                    <p className={css.bioCount}>
                      <FormattedMessage
                        id="ProfilePage.filmCount"
                        values={{ count: <b>{filmListings.length} </b> }}
                      />
                    </p>
                    <p className={css.bioCount}>
                      <FormattedMessage
                        id="ProfilePage.seriesCount"
                        values={{ count: <b>{seriesListings.length}</b> }}
                      />
                    </p>
                    <p className={css.eventsListings}>
                      <FormattedMessage
                        id="ProfilePage.eventsCount"
                        values={{ count: <b>{eventsListings.length}</b> }}
                      />
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {hasListings ? (
            <div className={css.featuresContainer}>
              <ButtonTabNavHorizontal className={css.desktopReviewsTabNav} tabs={showListingTabs} />
              <div id={FEATURED_SECTION} className={css.featuresContainer}>
                <H4 as="h4" className={css.featuresTitle}>
                  <FormattedMessage
                    id="ProfilePage.featuredSection"
                    values={{ count: listings.length }}
                  />
                </H4>
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
                    {listings.map(l => (
                      <SwiperSlide style={{ width: deviceWidth > 767 ? 295 : 265 }} key={l.id.uuid}>

                        <div style={{ width: deviceWidth > 767 ? 295 : 265 }} key={l.id.uuid}>
                          <ListingCard listing={l} showAuthorInfo={false} showDetails={true} />
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
                {creatorViewContentSection.map(section => (
                  <ContentSection {...section} secondParentRef={secondParentRef} secondSliderRef={secondSliderRef} />
                ))}
              </div>
            </div>
          ) : (
            <div id={FEATURED_SECTION} className={css.featuresContainer}>
              <h4 className={css.featuresTitle}>
                <FormattedMessage
                  id="ProfilePage.featuredSection"
                  values={{ count: listings.length }}
                />
              </h4>
              <div className={css.uploadContainer}>
                <NamedLink
                  name="EditListingPage"
                  params={{
                    id: draftId,
                    slug: draftSlug,
                    type: 'new',
                    tab: 'details',
                    listingType: FILM_PRODUCTS,
                  }}
                >
                  <span>
                    <FormattedMessage id="ProfilePage.uploadFilm" />
                  </span>
                  <IconCollection icon="icon-plus" />
                </NamedLink>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className={css.asideContent}>
            <div className={css.bannerContainer}>
              <AvatarLarge
                className={css.avatar}
                user={user}
                disableProfileLink
                profileBanner={true}
              />
            </div>
            <div className={css.avatarContainerWrapper}>
              <div className={css.avatarInfoContainer}>
                <div className={css.avatarInfoContainerWrapper}>
                  <ResponsiveImage
                    gumletImage={{ sourceUrl, key: userProfileImage?.key }}
                    transformWidth={500}
                    alt="Profile Image"
                    className={css.avatar}
                  />
                  <div className={css.avatarInfoWrapper}>
                    <H2 as="h1" className={css.mobileHeading}>

                      {displayName ? (
                        <FormattedMessage
                          id="ProfilePage.mobileHeading"
                          values={{ name: displayName }}
                        />
                      ) : null}
                    </H2>

                    <H5 as="h5" className={css.desktopHeading}>
                      {publicData?.userName}
                    </H5>
                    <h2 className={css.labelName}>
                      {displayName}
                    </h2>
                    <div className={css.editProfileContainer}>
                      <div className={css.shareButtonWrapper}>
                        <Button
                          className={css.uploadContentButton}
                          onClick={() => handleWishList()}
                        >
                          <span>{addToWishListButtonText}</span>
                        </Button>
                        <span onClick={copyToClipboard} className={css.shareButton}>
                          <IconCollection icon="icon-share" />
                          {copied ? (
                            <FormattedMessage id="ProfilePage.copiedToClipboard" />
                          ) : (
                            <FormattedMessage id="ProfilePage.share" />
                          )}
                        </span>
                      </div>
                      <div className={css.socialShareWrapper}>
                        <SocialShare currentUser={user} pointer={css.pointer} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className={css.bioContainer}>
                  <div>{hasBio ? <p className={css.bio}>{bioWithLinks}</p> : null}</div>
                  <div className={css.bioCountContainer}>
                    <p className={css.bioCount}>
                      <FormattedMessage
                        id="ProfilePage.filmCount"
                        values={{ count: <b>{filmListings.length}</b> }}
                      />
                    </p>
                    <p className={css.bioCount}>
                      <FormattedMessage
                        id="ProfilePage.seriesCount"
                        values={{ count: <b>{seriesListings.length}</b> }}
                      />
                    </p>
                    <p className={css.eventsListings}>
                      <FormattedMessage
                        id="ProfilePage.eventsCount"
                        values={{ count: <b>{eventsListings.length}</b> }}
                      />
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {hasListings ? (
            <div className={css.featuresContainer}>
              <ButtonTabNavHorizontal className={css.desktopReviewsTabNav} tabs={showListingTabs} />
              <div id={FEATURED_SECTION} className={listingsContainerClasses}>
                <H4 as="h4" className={css.featuresTitle}>
                  <FormattedMessage
                    id="ProfilePage.OtherslistingsTitle"
                    values={{ name: displayName, count: listings.length }}
                  />
                </H4>
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
                    {filteredListings.map(l => (
                      <SwiperSlide style={{ width: deviceWidth > 767 ? 295 : 265 }} key={l.id.uuid}>
                        <div style={{ width: deviceWidth > 767 ? 295 : 265 }} key={l.id.uuid}>
                          <ListingCard listing={l} showAuthorInfo={false} showDetails={true} />
                        </div>
                      </SwiperSlide>
                    ))}

                  </Swiper>
                </div>
              </div>
              {creatorViewContentSection.map(section => (
                <ContentSection {...section} showExtraTile={false} secondParentRef={secondParentRef} secondSliderRef={secondSliderRef} />
              ))}
            </div>
          ) : (
            <div className={css.featuresContainer}>
              <p className={css.noContentText}>
                <FormattedMessage id="ProfilePage.noContentText" />
              </p>
              <NamedLink
                name="SearchPage"
                params={{ searchId: CREATOR_SEARCH_ID }}
                className={css.dicoverOtherBtn}
              >
                <span>
                  <FormattedMessage id="ProfilePage.dicoverOther" />
                </span>
              </NamedLink>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const ProfilePageComponent = props => {
  const config = useConfiguration();
  const intl = useIntl();
  const [mounted, setMounted] = useState(false);

  const queryID = useQuery(props.location.search).get('queryID');

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    scrollingDisabled,
    params: pathParams,
    currentUser,
    useCurrentUser,
    userShowError,
    user,
    ...rest
  } = props;
  const isVariant = pathParams.variant?.length > 0;
  const isPreview = isVariant && pathParams.variant === PROFILE_PAGE_PENDING_APPROVAL_VARIANT;

  // Stripe's onboarding needs a business URL for each seller, but the profile page can be
  // too empty for the provider at the time they are creating their first listing.
  // To remedy the situation, we redirect Stripe's crawler to the landing page of the marketplace.
  // TODO: When there's more content on the profile page, we should consider by-passing this redirection.
  const searchParams = rest?.location?.search;
  const isStorefront = searchParams
    ? new URLSearchParams(searchParams)?.get('mode') === 'storefront'
    : false;
  if (isStorefront) {
    return <NamedRedirect name="LandingPage" />;
  }

  const isDataLoaded = isPreview
    ? currentUser != null || userShowError != null
    : user != null || userShowError != null;
  const isCurrentUser = currentUser?.id && currentUser?.id?.uuid === pathParams.id;
  const profileUser = useCurrentUser ? currentUser : user;
  const { bio, publicData, metadata } = profileUser?.attributes?.profile || {};
  const { displayName } = publicData || {};
  const { userFields } = config.user;
  const isPrivateMarketplace = config.accessControl.marketplace.private === true;
  const isUnauthorizedUser = currentUser && !isUserAuthorized(currentUser);
  const isUnauthorizedOnPrivateMarketplace = isPrivateMarketplace && isUnauthorizedUser;
  const hasUserPendingApprovalError = isErrorUserPendingApproval(userShowError);

  const schemaTitleVars = { name: displayName, marketplaceName: config.marketplaceName };
  const schemaTitle = intl.formatMessage({ id: 'ProfilePage.schemaTitle' }, schemaTitleVars);

  if (!isDataLoaded) {
    return null;
  } else if (!isPreview && isNotFoundError(userShowError)) {
    return <NotFoundPage staticContext={props.staticContext} />;
  } else if (!isPreview && isForbiddenError(userShowError)) {
    // This can happen if private marketplace mode is active, but it's not reflected through asset yet.
    return (
      <NamedRedirect
        name="SignupPage"
        state={{ from: `${location.pathname}${location.search}${location.hash}` }}
      />
    );
  } else if (!isPreview && (isUnauthorizedOnPrivateMarketplace || hasUserPendingApprovalError)) {
    return (
      <NamedRedirect
        name="NoAccessPage"
        params={{ missingAccessRight: NO_ACCESS_PAGE_USER_PENDING_APPROVAL }}
      />
    );
  } else if (isPreview && mounted && !isCurrentUser) {
    // Someone is manipulating the URL, redirect to current user's profile page.
    return isCurrentUser === false ? (
      <NamedRedirect name="LandingPage" />
    ) : null;
  } else if ((isPreview || isPrivateMarketplace) && !mounted) {
    // This preview of the profile page is not rendered on server-side
    // and the first pass on client-side should render the same UI.
    return null;
  }
  // This is rendering normal profile page (not preview for pending-approval)
  return (
    <Page
      scrollingDisabled={scrollingDisabled}
      title={schemaTitle}
      schema={{
        '@context': 'http://schema.org',
        '@type': 'ProfilePage',
        name: schemaTitle,
      }}
    >
      <LayoutSingleColumn
        sideNavClassName={css.aside}
        topbar={<TopbarContainer className={css.topbar} />}
        // sideNav={
        //   <AsideContent
        //     user={profileUser}
        //     showLinkToProfileSettingsPage={mounted && isCurrentUser}
        //     displayName={displayName}
        //   />
        // }
        footer={<FooterContainer />}
      >
        <div>
          {/* <AsideContent
            showLinkToProfileSettingsPage={mounted && isCurrentUser}
            displayName={displayName}
            /> */}
          <MainContent
            user={profileUser}
            bio={bio}
            displayName={displayName}
            userShowError={userShowError}
            publicData={publicData}
            metadata={metadata}
            userFieldConfig={userFields}
            intl={intl}
            showLinkToProfileSettingsPage={mounted && isCurrentUser}
            currentUser={currentUser}
            queryID={queryID}
            {...rest}
          />
        </div>
      </LayoutSingleColumn>
    </Page>
  );
};

ProfilePageComponent.defaultProps = {
  currentUser: null,
  user: null,
  userShowError: null,
  queryListingsError: null,
  reviews: [],
  queryReviewsError: null,
};

ProfilePageComponent.propTypes = {
  scrollingDisabled: bool.isRequired,
  currentUser: propTypes.currentUser,
  useCurrentUser: bool.isRequired,
  user: oneOfType([propTypes.user, propTypes.currentUser]),
  userShowError: propTypes.error,
  queryListingsError: propTypes.error,
  listings: arrayOf(propTypes.listing).isRequired,
  reviews: arrayOf(propTypes.review),
  queryReviewsError: propTypes.error,
};

const mapStateToProps = state => {
  const { currentUser } = state.user;
  const {
    userId,
    userShowError,
    queryListingsError,
    userListingRefs,
    reviews,
    queryReviewsError,
  } = state.ProfilePage;
  const userMatches = getMarketplaceEntities(state, [{ type: 'user', id: userId }]);
  const user = userMatches.length === 1 ? userMatches[0] : null;

  // Show currentUser's data if it's not approved yet
  const isCurrentUser = userId?.uuid === currentUser?.id?.uuid;
  const useCurrentUser = isCurrentUser && !isUserAuthorized(currentUser);

  return {
    scrollingDisabled: isScrollingDisabled(state),
    currentUser,
    useCurrentUser,
    user,
    userShowError,
    queryListingsError,
    listings: getMarketplaceEntities(state, userListingRefs),
    reviews,
    queryReviewsError,
  };
};

const mapDispatchToProps = dispatch => ({
  onManageWishList: (payload, isAdding, listingType, listing) =>
    dispatch(updateWishlist(payload, isAdding, listingType, listing)),
});

const ProfilePage = compose(connect(mapStateToProps, mapDispatchToProps))(ProfilePageComponent);

export default ProfilePage;
