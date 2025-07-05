import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { withRouter } from 'react-router-dom';
import classNames from 'classnames';

import { useConfiguration } from '../../../context/configurationContext';
import { useRouteConfiguration } from '../../../context/routeConfigurationContext';
import { FormattedMessage, intlShape, injectIntl } from '../../../util/reactIntl';
import { displayPrice } from '../../../util/configHelpers';
import {
  LISTING_STATE_PENDING_APPROVAL,
  LISTING_STATE_CLOSED,
  LISTING_STATE_DRAFT,
  propTypes,
  STOCK_MULTIPLE_ITEMS,
  SERIES_PRODUCTS,
  LISTING_STATE_PUBLISHED,
} from '../../../util/types';
import { formatMoney } from '../../../util/currency';
import { ensureOwnListing } from '../../../util/data';
import {
  LISTING_PAGE_PENDING_APPROVAL_VARIANT,
  LISTING_PAGE_DRAFT_VARIANT,
  LISTING_PAGE_PARAM_TYPE_DRAFT,
  LISTING_PAGE_PARAM_TYPE_EDIT,
  createSlug,
} from '../../../util/urlHelpers';
import { createResourceLocatorString, findRouteByRouteName } from '../../../util/routes';
import { isBookingProcessAlias, isPurchaseProcessAlias } from '../../../transactions/transaction';

import {
  AspectRatioWrapper,
  InlineTextButton,
  Menu,
  MenuLabel,
  MenuContent,
  MenuItem,
  NamedLink,
  IconSpinner,
  PrimaryButtonInline,
  ResponsiveImage,
  Modal,
  Button,
} from '../../../components';

import MenuIcon from './MenuIcon';
import Overlay from './Overlay';
import css from './ManageListingCard.module.css';
import StarRatings from 'react-star-ratings';
import IconCollection from '../../../components/IconCollection/IconCollection';
import { formatLabel, formatCardDuration } from '../../../util/dataExtractor';

// Menu content needs the same padding
const MENU_CONTENT_OFFSET = -12;
const MAX_LENGTH_FOR_WORDS_IN_TITLE = 7;

const sourceUrl = process.env.REACT_APP_GUMLET_SOURCE_URL;

const calculateAverage = reviews => {
  if (reviews?.length === 0) {
    return 0;
  }
  const sum =
    reviews &&
    reviews?.reduce((accumulator, currentValue) => accumulator + currentValue.attributes.rating, 0);
  const average = sum / reviews?.length;
  return average;
};

const priceData = (price, currency, intl) => {
  if (price?.currency === currency) {
    const formattedPrice = formatMoney(intl, price);
    return { formattedPrice, priceTitle: formattedPrice };
  } else if (price) {
    return {
      formattedPrice: intl.formatMessage(
        { id: 'ManageListingCard.unsupportedPrice' },
        { currency: price.currency }
      ),
      priceTitle: intl.formatMessage(
        { id: 'ManageListingCard.unsupportedPriceTitle' },
        { currency: price.currency }
      ),
    };
  }
  return {};
};

const createListingURL = (routes, listing) => {
  const id = listing.id.uuid;
  const slug = createSlug(listing.attributes.title);
  const isPendingApproval = listing.attributes.state === LISTING_STATE_PENDING_APPROVAL;
  const isDraft = listing.attributes.state === LISTING_STATE_DRAFT;
  const variant = isDraft
    ? LISTING_PAGE_DRAFT_VARIANT
    : isPendingApproval
      ? LISTING_PAGE_PENDING_APPROVAL_VARIANT
      : null;

  const linkProps =
    isPendingApproval || isDraft
      ? {
        name: 'ListingPageVariant',
        params: {
          id,
          slug,
          variant,
        },
      }
      : {
        name: 'ListingPage',
        params: { id, slug },
      };

  return createResourceLocatorString(linkProps.name, routes, linkProps.params, {});
};

// Cards are not fixed sizes - So, long words in title make flexboxed items to grow too big.
// 1. We split title to an array of words and spaces.
//    "foo bar".split(/([^\s]+)/gi) => ["", "foo", " ", "bar", ""]
// 2. Then we break long words by adding a '<span>' with word-break: 'break-all';
const formatTitle = (title, maxLength) => {
  const nonWhiteSpaceSequence = /([^\s]+)/gi;

  // Helper function to capitalize the first letter of a word
  const capitalizeFirstLetter = (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();

  return title.split(nonWhiteSpaceSequence).map((word, index) => {
    const capitalizedWord = capitalizeFirstLetter(word);

    return capitalizedWord.length > maxLength ? (
      <span key={index} style={{ wordBreak: 'break-all' }}>
        {capitalizedWord}
      </span>
    ) : (
      capitalizedWord
    );
  });
};


const ShowFinishDraftOverlayMaybe = props => {
  const { isDraft, title, id, slug, hasImage, intl, listingType } = props;

  return isDraft ? (
    <React.Fragment>
      <div className={classNames({ [css.draftNoImage]: !hasImage })} />
      {/* <Overlay
        message={intl.formatMessage(
          { id: 'ManageListingCard.draftOverlayText' },
          { listingTitle: title }
        )}
      > */}
      {/* <NamedLink
          className={css.finishListingDraftLink}
          name="EditListingPage"
          params={{ id, slug, type: LISTING_PAGE_PARAM_TYPE_DRAFT, tab: 'photos', listingType }}
        > */}
      {/* <FormattedMessage id="ManageListingCard.finishListingDraft" /> */}
      {/* </NamedLink> */}
      {/* </Overlay> */}
    </React.Fragment>
  ) : null;
};

const ShowClosedOverlayMaybe = props => {
  const {
    isClosed,
    title,
    actionsInProgressListingId,
    currentListingId,
    onOpenListing,
    intl,
  } = props;

  return isClosed ? (
    <Overlay
      message={intl.formatMessage(
        { id: 'ManageListingCard.closedListing' },
        { listingTitle: title }
      )}
    >
      <PrimaryButtonInline
        className={css.openListingButton}
        disabled={!!actionsInProgressListingId}
        onClick={event => {
          event.preventDefault();
          event.stopPropagation();
          if (!actionsInProgressListingId) {
            onOpenListing(currentListingId);
          }
        }}
      >
        <FormattedMessage id="ManageListingCard.openListing" />
      </PrimaryButtonInline>
    </Overlay>
  ) : null;
};

const ShowPendingApprovalOverlayMaybe = props => {
  const { isPendingApproval, title, intl } = props;

  return isPendingApproval ? (
    <Overlay
      message={intl.formatMessage(
        { id: 'ManageListingCard.pendingApproval' },
        { listingTitle: title }
      )}
    />
  ) : null;
};

const ShowOutOfStockOverlayMaybe = props => {
  const {
    showOutOfStockOverlay,
    title,
    id,
    slug,
    actionsInProgressListingId,
    currentListingId,
    hasStockManagementInUse,
    onCloseListing,
    intl,
    listingType,
  } = props;

  return showOutOfStockOverlay ? (
    <Overlay
      message={intl.formatMessage(
        { id: 'ManageListingCard.outOfStockOverlayText' },
        { listingTitle: title }
      )}
    >
      {hasStockManagementInUse ? (
        <>
          <NamedLink
            className={css.finishListingDraftLink}
            name="EditListingPage"
            params={{ id, slug, type: LISTING_PAGE_PARAM_TYPE_EDIT, tab: 'pricing-and-stock', listingType }}
          >
            <FormattedMessage id="ManageListingCard.setPriceAndStock" />
          </NamedLink>

          <div className={css.closeListingText}>
            {intl.formatMessage(
              { id: 'ManageListingCard.closeListingTextOr' },
              {
                closeListingLink: (
                  <InlineTextButton
                    key="closeListingLink"
                    className={css.closeListingText}
                    disabled={!!actionsInProgressListingId}
                    onClick={() => {
                      if (!actionsInProgressListingId) {
                        onCloseListing(currentListingId);
                      }
                    }}
                  >
                    <FormattedMessage id="ManageListingCard.closeListingText" />
                  </InlineTextButton>
                ),
              }
            )}
          </div>
        </>
      ) : (
        <div className={css.closeListingText}>
          <InlineTextButton
            key="closeListingLink"
            className={css.closeListingText}
            disabled={!!actionsInProgressListingId}
            onClick={() => {
              if (!actionsInProgressListingId) {
                onCloseListing(currentListingId);
              }
            }}
          >
            <FormattedMessage id="ManageListingCard.closeListingText" />
          </InlineTextButton>
        </div>
      )}
    </Overlay>
  ) : null;
};

const LinkToStockOrAvailabilityTab = props => {
  const {
    id,
    slug,
    editListingLinkType,
    isBookable,
    hasListingType,
    hasStockManagementInUse,
    currentStock,
    intl,
    listingType,
  } = props;

  if (!hasListingType || !(isBookable || hasStockManagementInUse)) {
    return null;
  }

  return (
    <>
      <span className={css.manageLinksSeparator}>{' • '}</span>

      {isBookable ? (
        <NamedLink
          className={css.manageLink}
          name="EditListingPage"
          params={{ id, slug, type: editListingLinkType, tab: 'availability', listingType }}
        >
          <FormattedMessage id="ManageListingCard.manageAvailability" />
        </NamedLink>
      ) : (
        <NamedLink
          className={css.manageLink}
          name="EditListingPage"
          params={{ id, slug, type: editListingLinkType, tab: 'pricing-and-stock', listingType }}
        >
          {currentStock == null
            ? intl.formatMessage({ id: 'ManageListingCard.setPriceAndStock' })
            : intl.formatMessage({ id: 'ManageListingCard.manageStock' }, { currentStock })}
        </NamedLink>
      )}
    </>
  );
};

const PriceMaybe = props => {
  const { price, publicData, config, intl } = props;
  const { listingType } = publicData || {};
  const validListingTypes = config.listing.listingTypes;
  const foundListingTypeConfig = validListingTypes.find(conf => conf.listingType === listingType);

  const showPrice = displayPrice(foundListingTypeConfig);
  if (showPrice && !price) {
    return (
      <div className={css.noPrice}>
        <FormattedMessage id="ManageListingCard.priceNotSet" />
      </div>
    );
  } else if (!showPrice) {
    return null;
  }

  const isBookable = isBookingProcessAlias(publicData?.transactionProcessAlias);
  const { formattedPrice, priceTitle } = priceData(price, config.currency, intl);
  return (
    <div className={css.price}>
      <div className={css.priceValue} title={priceTitle}>
        {formattedPrice}
      </div>
      {isBookable ? (
        <div className={css.perUnit}>
          <FormattedMessage
            id="ManageListingCard.perUnit"
            values={{ unitType: publicData?.unitType }}
          />
        </div>
      ) : null}
    </div>
  );
};

export const ManageListingCardComponent = props => {
  const config = useConfiguration();
  const routeConfiguration = useRouteConfiguration();
  const {
    className,
    rootClassName,
    hasClosingError,
    hasOpeningError,
    history,
    intl,
    isMenuOpen,
    actionsInProgressListingId,
    listing,
    onCloseListing,
    onOpenListing,
    onToggleMenu,
    renderSizes,
    onDeleteDraftListing,
    onMarkAsDraft,
    isPublished,
    onManageDisableScrolling
  } = props;

  const reviews = [];
  const classes = classNames(rootClassName || css.root, className);
  const currentListing = ensureOwnListing(listing);
  const id = currentListing.id.uuid;
  const { title = '', price, state, publicData } = currentListing.attributes;
  const slug = createSlug(title);
  const isPendingApproval = state === LISTING_STATE_PENDING_APPROVAL;
  const isClosed = state === LISTING_STATE_CLOSED;
  const isDraft = state === LISTING_STATE_DRAFT;

  const [openModal, setOpenModal] = useState(false);

  const { listingType, transactionProcessAlias, primary_genre, episodeCount, filmVideo, markAsDraft, episodes = [], hasTransaction, marketingPoster, listingRating } = publicData || {};
  const isBookable = isBookingProcessAlias(transactionProcessAlias);
  const isProductOrder = isPurchaseProcessAlias(transactionProcessAlias);
  const hasListingType = !!listingType;
  const validListingTypes = config.listing.listingTypes;
  const foundListingTypeConfig = validListingTypes.find(conf => conf.listingType === listingType);

  const currentStock = currentListing.currentStock?.attributes?.quantity;
  const isOutOfStock = currentStock === 0;
  const showOutOfStockOverlay =
    !isBookable && isOutOfStock && !isPendingApproval && !isClosed && !isDraft;
  const hasStockManagementInUse =
    isProductOrder && foundListingTypeConfig?.stockType === STOCK_MULTIPLE_ITEMS;

  // just for testing purpose boz image flow is pending when its done it will remove
  const dummyImage = {
    "id": {
      "_sdkType": "UUID",
      "uuid": "67164f89-3725-48bf-b15a-5405ec01cbb8"
    },
    "type": "image",
    "attributes": {
      "variants": {
        "listing-card": {
          "height": 300,
          "width": 400,
          "url": "https://sharetribe.imgix.net/6195a91e-7045-4c42-a94f-300506ee0705/67164f89-3725-48bf-b15a-5405ec01cbb8?auto=format&crop=edges&fit=crop&h=300&w=400&s=68468bad0a1fdf7350b2051791e8e34b",
          "name": "listing-card"
        },
        "listing-card-2x": {
          "height": 600,
          "width": 800,
          "url": "https://sharetribe.imgix.net/6195a91e-7045-4c42-a94f-300506ee0705/67164f89-3725-48bf-b15a-5405ec01cbb8?auto=format&crop=edges&fit=crop&h=600&w=800&s=31b900a7aa9b59969d5e037297c582cf",
          "name": "listing-card-2x"
        }
      }
    }
  };

  const firstImage =
    currentListing.images && currentListing.images.length > 0 ? currentListing.images[0] : publicData?.marketingPoster ? dummyImage : null;


  const menuItemClasses = classNames(css.menuItem, {
    [css.menuItemDisabled]: !!actionsInProgressListingId,
  });

  const hasError = hasOpeningError || hasClosingError;
  const thisListingInProgress =
    actionsInProgressListingId && actionsInProgressListingId.uuid === id;

  const onOverListingLink = () => {
    // Enforce preloading of ListingPage (loadable component)
    const { component: Page } = isPublished
      ? findRouteByRouteName('ListingPage', routeConfiguration)
      : findRouteByRouteName('EditListingPage', routeConfiguration);
    
    // Loadable Component has a "preload" function.
    if (Page.preload) {
      Page.preload();
    }
  };

  const handleCardClick = listing => {
    if(isMenuOpen) return;
    const params = isPublished
      ? { id: listing.id.uuid, slug: createSlug(title) }
      : { id: listing.id.uuid, slug: createSlug(title), type: LISTING_STATE_DRAFT, tab: 'details', listingType };
    if (isPublished) {
      history.push(createResourceLocatorString('ListingPage', routeConfiguration, params, {}));
    } else {
      history.push(createResourceLocatorString('EditListingPage', routeConfiguration, params, {}));
    }
  };

  const titleClasses = classNames(css.title, {
    [css.titlePending]: isPendingApproval,
    [css.titleDraft]: isDraft,
  });

  const editListingLinkType = isDraft
    ? LISTING_PAGE_PARAM_TYPE_DRAFT
    : LISTING_PAGE_PARAM_TYPE_EDIT;

  const {
    aspectWidth = 1,
    aspectHeight = 1,
    variantPrefix = 'listing-card',
  } = config.layout.listingImage;
  const variants = firstImage
    ? Object.keys(firstImage?.attributes?.variants).filter(k => k.startsWith(variantPrefix))
    : [];

  const toggleListingStatus = (listing, markAsDraft = true) => {
    const listingParams = {
      id: listing.id,
      publicData: { markAsDraft, },
    };
    onMarkAsDraft(listingParams);
  };

  return (
    <div className={classes}>
      <div
        className={css.clickWrapper}
        tabIndex={0}
        onMouseOver={onOverListingLink}
        onTouchStart={onOverListingLink}
        onClick={() => handleCardClick(listing)}
      >
        <AspectRatioWrapper width={aspectWidth} height={aspectHeight} className={css.imageWrapper}>
          <ResponsiveImage
            alt={title}
            className={css.cardImage}
            gumletImage={{
              sourceUrl,
              key: marketingPoster?.key,
            }}
          />
        </AspectRatioWrapper>
        {(state == LISTING_PAGE_DRAFT_VARIANT || markAsDraft) && (
          <div className={classNames(css.draftOverlay, !firstImage && css.draftOverlayNoBg)}>
            {firstImage ? (
              <IconCollection icon="icon-draft-overlay" />
            ) : (
              <IconCollection icon="icon-draft-overlay-2" />
            )}
          </div>
        )}

        <div className={classNames(css.menuOverlayWrapper)}>
          <div className={classNames(css.menuOverlay, { [css.menuOverlayOpen]: isMenuOpen })} />
        </div>
        <div className={css.menubarWrapper}>
          <div className={css.menubarGradient} />
          <div className={css.menubar}>
            <Menu
              className={classNames(css.menu, { [css.cardIsOpen]: !isClosed })}
              contentPlacementOffset={MENU_CONTENT_OFFSET}
              contentPosition="left"
              useArrow={false}
              onToggleActive={isOpen => {
                const listingOpen = isOpen ? currentListing : null;
                onToggleMenu(listingOpen);
              }}
              isOpen={isMenuOpen}
            >
              <MenuLabel className={css.menuLabel} isOpenClassName={css.listingMenuIsOpen}>
                <div className={css.iconWrapper}>
                  <MenuIcon className={css.menuIcon} isActive={isMenuOpen} />
                </div>
              </MenuLabel>
              {state == LISTING_STATE_PUBLISHED && !hasTransaction ? (
                <MenuContent className={css.linkMenuContent}>
                  <MenuItem key="view-listing">
                    <InlineTextButton
                      rootClassName={titleClasses}
                      type="button"
                      onClick={event => {
                        event.preventDefault();
                        event.stopPropagation();
                        history.push(createListingURL(routeConfiguration, listing));
                      }}
                      className={css.menuLink}
                    >
                      <FormattedMessage id="ManageListingCard.viewListing" />
                    </InlineTextButton>
                  </MenuItem>
                  <MenuItem key="edit-listing">
                    <div onClick={(e) => e.stopPropagation()}>
                      <NamedLink
                        className={css.menuLink}
                        name="EditListingPage"
                        params={{ id, slug, type: editListingLinkType, tab: 'details', listingType }}
                      >
                        <FormattedMessage id="ManageListingCard.editListing" />
                      </NamedLink>
                    </div>
                  </MenuItem>
                  <MenuItem key="mark-as-draft-listing">
                    <InlineTextButton
                      rootClassName={menuItemClasses}
                      onClick={event => {
                        event.preventDefault();
                        event.stopPropagation();
                        if (!actionsInProgressListingId) {
                          onToggleMenu(null);
                          const shouldMarkAsDraftListing = !markAsDraft;
                          toggleListingStatus(currentListing, shouldMarkAsDraftListing);
                        }
                      }}
                      className={css.menuLink}
                    >
                      {markAsDraft ? (
                        <FormattedMessage id="ManageListingCard.publish" />
                      ) : (
                        <FormattedMessage id="ManageListingCard.markAsDraft" />
                      )}
                    </InlineTextButton>
                  </MenuItem>
                  <MenuItem key="close-listing">
                    <InlineTextButton
                      rootClassName={menuItemClasses}
                      onClick={event => {
                        event.preventDefault();
                        event.stopPropagation();
                        if (!actionsInProgressListingId) {
                          onToggleMenu(null);
                          setOpenModal(true);
                        }
                      }}
                      className={css.menuLink}
                    >
                      <FormattedMessage id="ManageListingCard.closeListing" />
                    </InlineTextButton>
                  </MenuItem>
                </MenuContent>
              ) : hasTransaction && state == LISTING_STATE_PUBLISHED ? (
                <MenuContent className={css.linkMenuContent}>
                  <MenuItem key="view-listing">
                    <InlineTextButton
                      rootClassName={titleClasses}
                      onClick={event => {
                        event.preventDefault();
                        event.stopPropagation();
                        history.push(createListingURL(routeConfiguration, listing));
                      }}
                      className={css.menuLink}
                    >
                      <FormattedMessage id="ManageListingCard.viewListing" />
                    </InlineTextButton>
                  </MenuItem>
                  <MenuItem key="edit-listing">
                    <NamedLink
                      className={css.menuLink}
                      name="EditListingPage"
                      params={{ id, slug, type: editListingLinkType, tab: 'details', listingType }}
                    >
                      <FormattedMessage id="ManageListingCard.editListing" />
                    </NamedLink>
                  </MenuItem>
                  <MenuItem key="mark-as-draft-listing">
                    <InlineTextButton
                      rootClassName={menuItemClasses}
                      onClick={event => {
                        event.preventDefault();
                        event.stopPropagation();
                        if (!actionsInProgressListingId) {
                          onToggleMenu(null);
                          const shouldMarkAsDraftListing = !markAsDraft;
                          toggleListingStatus(currentListing, shouldMarkAsDraftListing);
                        }
                      }}
                      className={css.menuLink}
                    >
                      {markAsDraft ? (
                        <FormattedMessage id="ManageListingCard.publish" />
                      ) : (
                        <FormattedMessage id="ManageListingCard.markAsDraft" />
                      )}
                    </InlineTextButton>
                  </MenuItem>
                </MenuContent>
              ) : (
                <MenuContent className={css.linkMenuContent}>
                  <MenuItem key="view-listing">
                    <InlineTextButton
                      rootClassName={titleClasses}
                      onClick={event => {
                        event.preventDefault();
                        event.stopPropagation();
                        history.push(createListingURL(routeConfiguration, listing));
                      }}
                      className={css.menuLink}
                    >
                      <FormattedMessage id="ManageListingCard.viewListing" />
                    </InlineTextButton>
                  </MenuItem>
                  <MenuItem key="edit-listing">
                    <NamedLink
                      className={css.menuLink}
                      name="EditListingPage"
                      params={{ id, slug, type: editListingLinkType, tab: 'details', listingType }}
                    >
                      <FormattedMessage id="ManageListingCard.editListing" />
                    </NamedLink>
                  </MenuItem>

                  <MenuItem key="close-listing">
                    <InlineTextButton
                      rootClassName={menuItemClasses}
                      onClick={event => {
                        event.preventDefault();
                        event.stopPropagation();
                        if (!actionsInProgressListingId) {
                          onToggleMenu(null);
                          setOpenModal(true);
                        }
                      }}
                      className={css.menuLink}
                    >
                      <FormattedMessage id="ManageListingCard.closeListing" />
                    </InlineTextButton>
                  </MenuItem>
                </MenuContent>
              )}
            </Menu>
          </div>
        </div>

        <ShowFinishDraftOverlayMaybe
          isDraft={isDraft}
          title={title}
          id={id}
          slug={slug}
          hasImage={!!firstImage}
          intl={intl}
          listingType={listingType}
        />

        <ShowClosedOverlayMaybe
          isClosed={isClosed}
          title={title}
          actionsInProgressListingId={actionsInProgressListingId}
          currentListingId={currentListing.id}
          onOpenListing={onOpenListing}
          intl={intl}
        />

        <ShowPendingApprovalOverlayMaybe
          isPendingApproval={isPendingApproval}
          title={title}
          intl={intl}
        />

        <ShowOutOfStockOverlayMaybe
          showOutOfStockOverlay={showOutOfStockOverlay}
          title={title}
          id={id}
          slug={slug}
          actionsInProgressListingId={actionsInProgressListingId}
          currentListingId={currentListing.id}
          onCloseListing={onCloseListing}
          hasStockManagementInUse={hasStockManagementInUse}
          intl={intl}
          listingType={listingType}
        />

        {thisListingInProgress ? (
          <Overlay>
            <IconSpinner />
          </Overlay>
        ) : hasError ? (
          <Overlay errorMessage={intl.formatMessage({ id: 'ManageListingCard.actionFailed' })} />
        ) : null}
      </div>

      <div className={css.info}>
        {state == LISTING_PAGE_DRAFT_VARIANT || markAsDraft ? (
          <span className={css.draftText}>
            <FormattedMessage id="ManageListingsCard.thisDraft" />
          </span>
        ) : (
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
        )}

        <div className={css.mainInfo}>
          <div className={css.titleWrapper}>
            <InlineTextButton
              rootClassName={titleClasses}
              onClick={event => {
                event.preventDefault();
                event.stopPropagation();
                history.push(createListingURL(routeConfiguration, listing));
              }}
            >
              {formatTitle(title, MAX_LENGTH_FOR_WORDS_IN_TITLE)}
            </InlineTextButton>
          </div>
        </div>
        <div>
          <div className={css.manageLinks}>
            {listingType === SERIES_PRODUCTS
              ? `Series  | ${state === LISTING_PAGE_DRAFT_VARIANT
                ? '?'
                : formatLabel(primary_genre && primary_genre[0])
              } | ${episodeCount || episodes.length} ${state === LISTING_PAGE_DRAFT_VARIANT ? 'Eps' : 'Episodes'
              }`
              : `Film  | ${state === LISTING_PAGE_DRAFT_VARIANT
                ? '?'
                : formatLabel(primary_genre && primary_genre[0])
              }  |  ${state === LISTING_PAGE_DRAFT_VARIANT
                ? '?'
                : `${formatCardDuration(filmVideo?.duration)}`
              }`}
          </div>

          <div>
            <NamedLink
              className={css.manageLink}
              name="EditListingPage"
              params={{ id, slug, type: editListingLinkType, tab: 'details', listingType }}
            >
              {listingType === SERIES_PRODUCTS ? (
                <FormattedMessage
                  id={
                    state === LISTING_PAGE_DRAFT_VARIANT
                      ? 'ManageListingCard.finishSeries'
                      : 'ManageListingCard.editSeries'
                  }
                />
              ) : (
                <FormattedMessage
                  id={
                    state === LISTING_PAGE_DRAFT_VARIANT
                      ? 'ManageListingCard.finishFilm'
                      : 'ManageListingCard.editFilm'
                  }
                />
              )}
            </NamedLink>
          </div>
        </div>
      </div>

      <Modal
          id="ManageListingPage"
          isOpen={openModal}
          onClose={() => setOpenModal(false)}
          usePortal
          onManageDisableScrolling={onManageDisableScrolling}
          className={css.paymentCompletedModal}
        >
          <div className={css.paymentCompletedModal}>
            <h4 className={css.paymentCompletedHeading}>Delete!</h4>
            <div>
              <p className={css.paymentCompletedSubHeading}>
                <FormattedMessage id="ManageListingCard.deleteConfirmation" />
              </p>

              <div>
                <Button
                  key={`delete-${id}`}
                  onClick={() => {
                    if (state === LISTING_PAGE_DRAFT_VARIANT) {
                      onDeleteDraftListing(currentListing.id);
                    } else {
                      onCloseListing(currentListing.id);
                    }
                    setOpenModal(false);
                  }}
                  className={css.paymentCompletedStartWatching}
                >
                  <span>
                    Delete
                  </span>
                </Button>
              </div>
              <Button key={`cancel-${id}`} onClick={() => setOpenModal(false)} className={css.paymentCompletedMoreContent}>
                <span>Cancel</span>
              </Button>
            </div>
          </div>
        </Modal>
    </div>
  );
};

ManageListingCardComponent.defaultProps = {
  className: null,
  rootClassName: null,
  actionsInProgressListingId: null,
  renderSizes: null,
};

const { bool, func, shape, string } = PropTypes;

ManageListingCardComponent.propTypes = {
  className: string,
  rootClassName: string,
  hasClosingError: bool.isRequired,
  hasOpeningError: bool.isRequired,
  intl: intlShape.isRequired,
  listing: propTypes.ownListing.isRequired,
  isMenuOpen: bool.isRequired,
  actionsInProgressListingId: shape({ uuid: string.isRequired }),
  onCloseListing: func.isRequired,
  onOpenListing: func.isRequired,
  onToggleMenu: func.isRequired,

  // Responsive image sizes hint
  renderSizes: string,

  // from withRouter
  history: shape({
    push: func.isRequired,
  }).isRequired,
};

export default compose(
  withRouter,
  injectIntl
)(ManageListingCardComponent);
