import React, { useState } from 'react';
import { bool, func, object, shape, string, arrayOf } from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { useHistory, useLocation } from 'react-router-dom';

import { useConfiguration } from '../../context/configurationContext';
import { useRouteConfiguration } from '../../context/routeConfigurationContext';

import { useIntl, intlShape, FormattedMessage } from '../../util/reactIntl';

import { propTypes } from '../../util/types';

import { manageDisableScrolling, isScrollingDisabled } from '../../ducks/ui.duck';

import TopbarContainer from '../TopbarContainer/TopbarContainer';
import FooterContainer from '../FooterContainer/FooterContainer';

import css from './AlgoliaSearchPage.module.css';


import algoliasearch from 'algoliasearch';
import { Configure, Index, InstantSearch, useInstantSearch, useSortBy } from 'react-instantsearch';

import { Modal, NamedRedirect, Page } from '../../components';
import Filters from './Filters/Filters';
import CustomHits from './Hits/Hits';
import CustomPagination from './Pagination/Pagination';
import IconCollection from '../../components/IconCollection/IconCollection';
import { ALL_SEARCH_ID, CREATOR_SEARCH_ID, creatorFilters, filmFilters, FILTER_TYPE_REFINEMENT_LIST, LISTING_SEARCH_ID, LISTING_STATE_PUBLISHED, LISTING_TYPE_FILMS, listingFilters, USER_STATE_BANNED } from '../../constants';
import { createRefinementList, useQuery } from '../../util/data';


const appId = process.env.REACT_APP_ALGOLIA_APP_ID;
const apiKey = process.env.REACT_APP_ALGOLIA_ADMIN_API_KEY;
const listingIndex = process.env.REACT_APP_ALGOLIA_LISTINGS_INDEX;
const creatorIndex = process.env.REACT_APP_ALGOLIA_USERS_INDEX;

const HITS_PER_PAGE = 6;

const searchClient = algoliasearch(
  appId,
  apiKey
);

const TotalResults = () => {
  const { results, indexUiState } = useInstantSearch();
  const { nbHits = 0 } = results;
  return (<div className={css.totalResults}>
    <FormattedMessage id='AlgoliaSearchPage.totalResults' values={{ nbHits }} />
  </div>)
};


const SortBy = ({handleSortChange, items }) => {
  const { currentRefinement, options, refine } = useSortBy({ items });
  return (
    <div className={css.sortByContainer}>
      <select
        onChange={(event) => { refine(event.target.value), handleSortChange(event.target.value) }}
        value={currentRefinement}

      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};


export const AlgoliaSearchPageComponent = (props) => {
  const {
    intl,
    location,
    scrollingDisabled,
    routeConfiguration,
    config,
    history,
    onManageDisableScrolling,
    params,
    currentUser,
  } = props;

  const [showFilters, setShowFilters] = useState(false);
  const [listingHits, setListingHits] = useState(0);
  const [creatorHits, setCreatorHits] = useState(0);
  const [currentListingIndex, setCurrentListingIndex] = useState(`${listingIndex}_timestamp_desc`);

  const handleSortChange = (newIndex) => {
    setCurrentListingIndex(newIndex);
  };
  const queryParams = Object.fromEntries(useQuery(location.search).entries());
  // check out the index
  const { searchId, genre: initialCategory } = params || {};

  const initialKeyword = useQuery(location.search).get('keywords');

  const indexName = [LISTING_SEARCH_ID, ALL_SEARCH_ID].includes(searchId)
    ? listingIndex
    : searchId === CREATOR_SEARCH_ID
      ? creatorIndex
      : null;

  // Redirect user to home page if index name is null
  if (!indexName) {
    return <NamedRedirect name="LandingPage" />;
  };

  const filters = indexName === listingIndex && initialCategory === LISTING_TYPE_FILMS
    ? filmFilters
    : indexName === listingIndex
      ? listingFilters
      : indexName === creatorIndex
        ? creatorFilters
        : [];

  const refinementListAttributes = filters.filter(filter => filter.type === FILTER_TYPE_REFINEMENT_LIST)
    .map(filter => filter.attribute);

  const initialRefinementList = createRefinementList(queryParams, refinementListAttributes);
  const initialRange = queryParams['price.amount'] || null;

  // Define initial UI state
  const uiState = {};
  const filterState = {};

  if (searchId === LISTING_SEARCH_ID) {
    // Mandatory filters
    filterState.filters = `NOT privateMode:true AND state:${LISTING_STATE_PUBLISHED} AND markAsDraft:false`;

    // Initial Category
    if (initialCategory) {
      uiState.menu = { 'publicData.listingType': initialCategory };
    }

    // Initial Fefinements
    if (Object.keys(initialRefinementList || {}).length) {
      uiState.refinementList = initialRefinementList;
    }

    // Initial Range
    if (!!initialRange) {
      uiState.range = {
        ['price.amount']: initialRange.replace('-', ':')
      }
    }

  } else if (searchId === CREATOR_SEARCH_ID) {
    filterState.filters = `NOT state:${USER_STATE_BANNED} AND deleted:false AND NOT privateMode:true`;
    uiState.refinementList = initialRefinementList;
  };

  const initialUiState = {
    [indexName]: {
      ...uiState,
      configure: {
        ...filterState,
      },
    }
  };

  const creatorCurrentIndex = currentListingIndex == `${listingIndex}_timestamp_desc` ? `${creatorIndex}_timestamp_desc` : `${creatorIndex}_timestamp_asc`;

  return (
    <Page
      scrollingDisabled={scrollingDisabled}
    >
      <TopbarContainer />
      <InstantSearch
        key={`${indexName}-${initialCategory}-${location.search}`} // Forces reinitialization on indexName change
        indexName={indexName}
        searchClient={searchClient}
        initialUiState={{ ...initialUiState }}
        insights={true}
      >
        <Configure
          hitsPerPage={HITS_PER_PAGE}
          {...(initialKeyword?.trim() ? { query: initialKeyword } : {})}
          clickAnalytics={true}
        />
        <div className={css.layoutWrapperContainer}>
          <Modal
            id="algoliaSearchPage.filterModal"
            isOpen={showFilters}
            onClose={() => setShowFilters(false)}
            onManageDisableScrolling={onManageDisableScrolling}
            className={css.filterModal}
          >

            <div className={css.filterColumnContent}>
              <Filters
                filters={filters}
                intl={intl}
                indexName={indexName}
                routeConfiguration={routeConfiguration}
                history={history}
                initialCategory={initialCategory}
                searchId={searchId}
                queryParams={queryParams}
                currentUser={currentUser}
                hasOnlyKeywords={searchId === ALL_SEARCH_ID}
              />
            </div>

          </Modal>
          <aside className={css.layoutWrapperFilterColumn} data-testid="filterColumnAside">
            <div className={css.filterColumnContent}>
              <Filters
                filters={filters}
                intl={intl}
                indexName={indexName}
                routeConfiguration={routeConfiguration}
                history={history}
                initialCategory={initialCategory}
                searchId={searchId}
                queryParams={queryParams}
                currentUser={currentUser}
                hasOnlyKeywords={searchId === ALL_SEARCH_ID}
              />
            </div>
          </aside>


          <div className={css.layoutWrapperMain} role="main">
            <div className={css.searchPageHeader}>
              <FormattedMessage id='AlgoliaSearchPage.totalResults' values={{ nbHits: (listingHits + creatorHits) }} />
              <SortBy
                items={[
                  {
                    label: 'Sort By: Newest',
                    value: indexName === listingIndex ? `${indexName}_timestamp_desc` : `${indexName}_timeStamp_desc`,
                  },
                  {
                    label: 'Sort By: Oldest',
                    value: indexName === listingIndex ? `${indexName}_timestamp_asc` : `${indexName}_timeStamp_asc`,
                  },
                ]}
                handleSortChange={handleSortChange}
              />
            </div>
            <button onClick={() => setShowFilters(true)} className={css.filterButton}>
              <IconCollection icon="filter-icon" />
              <span><FormattedMessage id='AlgoliaSearchPage.filters' /></span>
            </button>
            {(searchId === ALL_SEARCH_ID) ? <div className={css.searchResultContainer}>
              {/* First Index: Listings */}
              <Index
                indexName={currentListingIndex}
              >
                <Configure
                  filters={`NOT privateMode:true AND state:${LISTING_STATE_PUBLISHED} AND markAsDraft:false`}
                  hitsPerPage={HITS_PER_PAGE}
                />

                <div className={css.searchPageHeader}>
                </div>
                <CustomHits
                  routeConfiguration={routeConfiguration}
                  history={history}
                  indexName={listingIndex}
                  intl={intl}
                  currentUser={currentUser}
                  setNbHits={setListingHits}
                />
              </Index>

              {/* Second Index: Creators */}
              <Index
                indexName={creatorCurrentIndex}
              >
                <Configure
                  filters={`NOT state:${USER_STATE_BANNED} AND deleted:false AND NOT privateMode:true`}
                  hitsPerPage={3}
                />
                <CustomHits
                  routeConfiguration={routeConfiguration}
                  history={history}
                  indexName={creatorIndex}
                  intl={intl}
                  currentUser={currentUser}
                  setNbHits={setCreatorHits}
                />
              </Index>
            </div>
              :
              <div className={css.searchResultContainer}>
                <CustomHits
                  routeConfiguration={routeConfiguration}
                  history={history}
                  indexName={indexName}
                  intl={intl}
                  currentUser={currentUser}
                  listingIndex={listingIndex}
                  creatorIndex={creatorIndex}
                  searchId={CREATOR_SEARCH_ID}
                  setNbHits={setListingHits}
                />
              </div>}
            <CustomPagination />
          </div>
        </div>
      </InstantSearch>
      <FooterContainer />
    </Page>
  );
};

AlgoliaSearchPageComponent.defaultProps = {
  searchParams: {},
};

AlgoliaSearchPageComponent.propTypes = {
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

const EnhancedAlgoliaSearchPage = props => {
  const config = useConfiguration();
  const routeConfiguration = useRouteConfiguration();
  const intl = useIntl();
  const history = useHistory();
  const location = useLocation();
  return (
    <AlgoliaSearchPageComponent
      config={config}
      routeConfiguration={routeConfiguration}
      intl={intl}
      history={history}
      location={location}
      {...props}
    />
  );
};

const mapStateToProps = state => {
  const { currentUser } = state.user;

  return {
    currentUser,
    scrollingDisabled: isScrollingDisabled(state),
  };
};

const mapDispatchToProps = dispatch => ({
  onManageDisableScrolling: (componentId, disableScrolling) =>
    dispatch(manageDisableScrolling(componentId, disableScrolling)),
});

// Note: it is important that the withRouter HOC is **outside** the
// connect HOC, otherwise React Router won't rerender any Route
// components since connect implements a shouldComponentUpdate
// lifecycle hook.
//
// See: https://github.com/ReactTraining/react-router/issues/4671
const AlgoliaSearchPage = compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(EnhancedAlgoliaSearchPage);

export default AlgoliaSearchPage;
