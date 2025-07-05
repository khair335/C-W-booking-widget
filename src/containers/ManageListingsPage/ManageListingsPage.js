import React, { useEffect, useState } from 'react';
import { arrayOf, bool, func, object, shape, string } from 'prop-types';
import { useHistory } from 'react-router-dom';
import { compose } from 'redux';
import { connect } from 'react-redux';

import { useRouteConfiguration } from '../../context/routeConfigurationContext';
import { FormattedMessage, useIntl } from '../../util/reactIntl';
import { pathByRouteName } from '../../util/routes';
import { hasPermissionToPostListings } from '../../util/userHelpers';
import { LISTING_PAGE_DRAFT_VARIANT, NO_ACCESS_PAGE_POST_LISTINGS } from '../../util/urlHelpers';
import { FILM_PRODUCTS, SERIES_PRODUCTS, propTypes } from '../../util/types';
import { isErrorNoPermissionToPostListings } from '../../util/errors';
import { isScrollingDisabled, manageDisableScrolling } from '../../ducks/ui.duck';

import {
  H3,
  Page,
  PaginationLinks,
  UserNav,
  LayoutSingleColumn,
  NamedLink,
  LayoutSideNavigation,
  Menu,
  MenuLabel,
  MenuContent,
  MenuItem,
  Button,
  H4,
  H5,
} from '../../components';

import TopbarContainer from '../../containers/TopbarContainer/TopbarContainer';
import FooterContainer from '../../containers/FooterContainer/FooterContainer';

import ManageListingCard from './ManageListingCard/ManageListingCard';

import { closeListing, openListing, getOwnListingsById, deleteDraftListing, markAsDraft } from './ManageListingsPage.duck';
import css from './ManageListingsPage.module.css';

import { LinkComponent } from '../TopbarContainer/Topbar/TopbarDesktop/CustomLinksMenu/LinksMenu';
import { useConfiguration } from '../../context/configurationContext';
import { getResolvedCustomLinks, sortCustomLinks } from '../../util/data';
import Skeleton from '../../components/Skeleton/Skeleton';

const Heading = props => {
  const { listingsAreLoaded, pagination } = props;
  const hasResults = listingsAreLoaded && pagination.totalItems > 0;
  const hasNoResults = listingsAreLoaded && pagination.totalItems === 0;

  return hasResults ? (
    <H5 as="h5" className={css.heading}>
      <FormattedMessage
        id="ManageListingsPage.youHaveListings"
        values={{ count: pagination.totalItems }}
      />
    </H5>
  ) : hasNoResults ? (
    <div className={css.noResultsContainer}>
      <H5 as="h5" className={css.headingNoListings}>
        <FormattedMessage id="ManageListingsPage.noResults" />
      </H5>
      {/* <p className={css.createListingParagraph}>
        <NamedLink className={css.createListingLink} name="NewListingPage">
          <FormattedMessage id="ManageListingsPage.createListing" />
        </NamedLink>
      </p> */}
    </div>
  ) : null;
};

const PaginationLinksMaybe = props => {
  const { listingsAreLoaded, pagination, page } = props;
  return listingsAreLoaded && pagination && pagination.totalPages > 1 ? (
    <PaginationLinks
      className={css.pagination}
      pageName="ManageListingsPage"
      pageSearchParams={{ page }}
      pagination={pagination}
    />
  ) : null;
};

export const ManageListingsPageComponent = props => {
  const [listingMenuOpen, setListingMenuOpen] = useState(null);
  const history = useHistory();
  const routeConfiguration = useRouteConfiguration();
  const config = useConfiguration();
  const intl = useIntl();

  const {
    currentUser,
    closingListing,
    closingListingError,
    listings,
    onCloseListing,
    onOpenListing,
    openingListing,
    openingListingError,
    pagination,
    queryInProgress,
    queryListingsError,
    queryParams,
    scrollingDisabled,
    onDeleteDraftListing,
    onMarkAsDraft,
    onManageDisableScrolling
  } = props;

  useEffect(() => {
    if (isErrorNoPermissionToPostListings(openingListingError?.error)) {
      const noAccessPagePath = pathByRouteName('NoAccessPage', routeConfiguration, {
        missingAccessRight: NO_ACCESS_PAGE_POST_LISTINGS,
      });
      history.push(noAccessPagePath);
    }
  }, [openingListingError]);

  const onToggleMenu = listing => {
    setListingMenuOpen(listing);
  };

  const handleOpenListing = listingId => {
    const hasPostingRights = hasPermissionToPostListings(currentUser);

    if (!hasPostingRights) {
      const noAccessPagePath = pathByRouteName('NoAccessPage', routeConfiguration, {
        missingAccessRight: NO_ACCESS_PAGE_POST_LISTINGS,
      });
      history.push(noAccessPagePath);
    } else {
      onOpenListing(listingId);
    }
  };

  const hasPaginationInfo = !!pagination && pagination.totalItems != null;
  const listingsAreLoaded = !queryInProgress && hasPaginationInfo;

  const loadingResults = (
    <div className={css.messagePanel}>
      <H3 as="h2" className={css.heading}>
        <FormattedMessage id="ManageListingsPage.loadingOwnListings" />
      </H3>
    </div>
  );

  const queryError = (
    <div className={css.messagePanel}>
      <H3 as="h2" className={css.heading}>
        <FormattedMessage id="ManageListingsPage.queryError" />
      </H3>
    </div>
  );

  const closingErrorListingId = !!closingListingError && closingListingError.listingId;
  const openingErrorListingId = !!openingListingError && openingListingError.listingId;

  const panelWidth = 62.5;
  // Render hints for responsive image
  const renderSizes = [
    `(max-width: 767px) 100vw`,
    `(max-width: 1920px) ${panelWidth / 2}vw`,
    `${panelWidth / 3}vw`,
  ].join(', ');

  const sortedCustomLinks = sortCustomLinks(config.topbar?.customLinks);
  const customLinks = getResolvedCustomLinks(sortedCustomLinks, routeConfiguration);

  const isDraft = (listing) =>
  (listing.attributes.state === LISTING_PAGE_DRAFT_VARIANT ||
    listing.attributes?.publicData?.markAsDraft);

  const isNotDeleted = (listing) =>
    !listing.attributes?.publicData?.deletedListing;

  const draftListings = listings && listings.length
    ? listings.filter(listing => (isDraft(listing) && isNotDeleted(listing)))
    : [];


  return (
    <Page
      title={intl.formatMessage({ id: 'ManageListingsPage.title' })}
      scrollingDisabled={scrollingDisabled}
    >
      <LayoutSideNavigation
        topbar={
          <>
            <TopbarContainer />
          </>
        }
        sideNav={null}
        useAccountSettingsNav
        currentPage="ManageListingsPage"
        footer={<FooterContainer />}
        className={css.layoutSideNavigation}
        mainColumnClassName={css.mainColumn}
      >

        {queryListingsError ? queryError : null}

        <div className={css.listingPanel}>
          <div className={css.headingContainer}>
            <div className={css.descriptionContainer}>
              <Heading listingsAreLoaded={listingsAreLoaded} pagination={pagination} />
              <p className={css.subTitle}><FormattedMessage id="ManageListingsPage.subTitle" /></p>
            </div>
            <div>
              <Menu>
                <MenuLabel className={css.linkMenuLabel} isOpenClassName={css.linkMenuIsOpen}>
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
                        <LinkComponent linkConfig={linkConfig} currentPage={"ManageListingsPage"} />
                      </MenuItem>
                    );
                  })}
                </MenuContent>
              </Menu>
              {/* <div className={css.topbarLink}>
                <NamedLink name="NewListingPage">
                  <Button className={css.uploadContentButton}>
                    <span>
                      <FormattedMessage id="ManageListingsPage.uploadContent" />
                    </span>
                  </Button>

                </NamedLink>
              </div> */}
            </div>
          </div>
          {queryInProgress ? <div className={css.loadingResults}>
            <Skeleton width="10%" height={'20px'} rounded={0} />
            <div className={css.listingCards}>
              <div className={css.listingCard}>
                <Skeleton width="100%" height={'399px'} rounded={8} bottom={4} /><br />
                <Skeleton width="50%" height={'10px'} rounded={0} bottom={4} /><br />
                <Skeleton width="30%" height={'8px'} rounded={0} bottom={4} /><br />
                <Skeleton width="80%" height={'33px'} rounded={30} bottom={4} />
              </div>
              <div className={css.listingCard}>
                <Skeleton width="100%" height={'399px'} rounded={8} bottom={4} /><br />
                <Skeleton width="50%" height={'10px'} rounded={0} bottom={4} /><br />
                <Skeleton width="30%" height={'8px'} rounded={0} bottom={4} /><br />
                <Skeleton width="80%" height={'33px'} rounded={30} bottom={4} />
              </div>
              <div className={css.listingCard}>
                <Skeleton width="100%" height={'399px'} rounded={8} bottom={4} /><br />
                <Skeleton width="50%" height={'10px'} rounded={0} bottom={4} /><br />
                <Skeleton width="30%" height={'8px'} rounded={0} bottom={4} /><br />
                <Skeleton width="80%" height={'33px'} rounded={30} bottom={4} />
              </div>
              <div className={css.listingCard}>
                <Skeleton width="100%" height={'399px'} rounded={8} bottom={4} /><br />
                <Skeleton width="50%" height={'10px'} rounded={0} bottom={4} /><br />
                <Skeleton width="30%" height={'8px'} rounded={0} bottom={4} /><br />
                <Skeleton width="80%" height={'33px'} rounded={30} bottom={4} />
              </div>
              <div className={css.listingCard}>
                <Skeleton width="100%" height={'399px'} rounded={8} bottom={4} /><br />
                <Skeleton width="50%" height={'10px'} rounded={0} bottom={4} /><br />
                <Skeleton width="30%" height={'8px'} rounded={0} bottom={4} /><br />
                <Skeleton width="80%" height={'33px'} rounded={30} bottom={4} />
              </div>
            </div>
          </div> : null}
          <div>
            {/* Draft Listings */}
            {draftListings.length > 0 && (
              <div>
                <h6 className={css.draftsHeading}>
                  <FormattedMessage id="ManageListingsPage.myDrafts" values={{ count: draftListings.length }} />
                </h6>
                <div className={css.listingCards}>
                  {draftListings
                    .map(l => (
                      <ManageListingCard
                        className={css.listingCard}
                        key={l.id.uuid}
                        listing={l}
                        isMenuOpen={!!listingMenuOpen && listingMenuOpen.id.uuid === l.id.uuid}
                        actionsInProgressListingId={openingListing || closingListing}
                        onToggleMenu={onToggleMenu}
                        onCloseListing={onCloseListing}
                        onOpenListing={handleOpenListing}
                        hasOpeningError={openingErrorListingId.uuid === l.id.uuid}
                        hasClosingError={closingErrorListingId.uuid === l?.id?.uuid}
                        renderSizes={renderSizes}
                        onDeleteDraftListing={onDeleteDraftListing}
                        onMarkAsDraft={onMarkAsDraft}
                        onManageDisableScrolling={onManageDisableScrolling}
                      />
                    ))}
                </div>
              </div>
            )}

            {/* Helper function to render a specific listing type */}
            {[SERIES_PRODUCTS, FILM_PRODUCTS].map(type => {
              const isPublished = (listing) =>
              (listing.attributes.state !== LISTING_PAGE_DRAFT_VARIANT &&
                !listing.attributes.publicData?.markAsDraft);

              const matchesListingType = (listing) =>
                listing.attributes.publicData?.listingType === type;

              const isNotDeleted = (listing) =>
                !listing.attributes.publicData?.deletedListing;

              const filteredListings = listings.filter(listing =>
                (isPublished(listing) && matchesListingType(listing) && isNotDeleted(listing))
              );


              if (filteredListings.length > 0) {
                return (
                  <div key={type}>
                    <h6 className={css.draftsHeading}>
                      <FormattedMessage id={`ManageListingsPage.my${type === SERIES_PRODUCTS ? 'Series' : 'Films'}`} values={{ count: filteredListings.length }} />
                    </h6>
                    <div className={css.listingCards}>
                      {filteredListings.map(l => (
                        <ManageListingCard
                          className={css.listingCard}
                          key={l.id.uuid}
                          listing={l}
                          isMenuOpen={!!listingMenuOpen && listingMenuOpen.id.uuid === l.id.uuid}
                          actionsInProgressListingId={openingListing || closingListing}
                          onToggleMenu={onToggleMenu}
                          onCloseListing={onCloseListing}
                          onOpenListing={handleOpenListing}
                          hasOpeningError={openingErrorListingId.uuid === l.id.uuid}
                          hasClosingError={closingErrorListingId.uuid === l.id.uuid}
                          renderSizes={renderSizes}
                          onMarkAsDraft={onMarkAsDraft}
                          isPublished={isPublished(l)}
                          onManageDisableScrolling={onManageDisableScrolling}
                        />
                      ))}
                    </div>
                  </div>
                );
              }
              return null;
            })}
          </div>


          <PaginationLinksMaybe
            listingsAreLoaded={listingsAreLoaded}
            pagination={pagination}
            page={queryParams ? queryParams.page : 1}
          />
        </div>
      </LayoutSideNavigation>
    </Page>
  );
};

ManageListingsPageComponent.defaultProps = {
  currentUser: null,
  listings: [],
  pagination: null,
  queryListingsError: null,
  queryParams: null,
  closingListing: null,
  closingListingError: null,
  openingListing: null,
  openingListingError: null,
};

ManageListingsPageComponent.propTypes = {
  currentUser: propTypes.currentUser,
  closingListing: shape({ uuid: string.isRequired }),
  closingListingError: shape({
    listingId: propTypes.uuid.isRequired,
    error: propTypes.error.isRequired,
  }),
  listings: arrayOf(propTypes.ownListing),
  onCloseListing: func.isRequired,
  onOpenListing: func.isRequired,
  openingListing: shape({ uuid: string.isRequired }),
  openingListingError: shape({
    listingId: propTypes.uuid.isRequired,
    error: propTypes.error.isRequired,
  }),
  pagination: propTypes.pagination,
  queryInProgress: bool.isRequired,
  queryListingsError: propTypes.error,
  queryParams: object,
  scrollingDisabled: bool.isRequired,
  onManageDisableScrolling: func.isRequired,
};

const mapStateToProps = state => {
  const { currentUser } = state.user;
  const {
    currentPageResultIds,
    pagination,
    queryInProgress,
    queryListingsError,
    queryParams,
    openingListing,
    openingListingError,
    closingListing,
    closingListingError,
  } = state.ManageListingsPage;
  const listings = getOwnListingsById(state, currentPageResultIds);
  return {
    currentUser,
    currentPageResultIds,
    listings,
    pagination,
    queryInProgress,
    queryListingsError,
    queryParams,
    scrollingDisabled: isScrollingDisabled(state),
    openingListing,
    openingListingError,
    closingListing,
    closingListingError,
  };
};

const mapDispatchToProps = dispatch => ({
  onCloseListing: listingId => dispatch(closeListing(listingId)),
  onOpenListing: listingId => dispatch(openListing(listingId)),
  onDeleteDraftListing: listingId => dispatch(deleteDraftListing(listingId)),
  onMarkAsDraft: params => dispatch(markAsDraft(params)),
  onManageDisableScrolling: (componentId, disableScrolling) =>
    dispatch(manageDisableScrolling(componentId, disableScrolling)),
});

const ManageListingsPage = compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(ManageListingsPageComponent);

export default ManageListingsPage;
