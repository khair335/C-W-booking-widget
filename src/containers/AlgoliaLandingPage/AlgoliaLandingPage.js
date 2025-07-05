import algoliasearch from 'algoliasearch';
import React from 'react';
import { Configure, InstantSearch } from 'react-instantsearch';
import { useQuery } from '../../util/data';
import GuestAlgoliaLandingPage from './GuestAlgoliaLandingPage/GuestAlgoliaLandingPage';
import AuthAlogliaLandingPage from './AuthAlogliaLandingPage/AuthAlogliaLandingPage';
import { useLocation } from 'react-router-dom';
import { CREATOR_INDEX, CREATORS_WITH_SERIES, LISTING_STATE_PUBLISHED, TRENDING_SERIES_CONTENT, TRENDING_CREATORS, USER_STATE_BANNED, NEWLY_RELEASED_SERIES, FILMS_CREATORS_SECTION, TRENDING_FILMS, NEWLY_RELEASED_FILMS, POPULAR_CREATORS } from '../../constants';
import { FILM_PRODUCTS, SERIES_PRODUCTS } from '../../util/types';

const appId = process.env.REACT_APP_ALGOLIA_APP_ID;
const apiKey = process.env.REACT_APP_ALGOLIA_ADMIN_API_KEY;
const listingIndex = process.env.REACT_APP_ALGOLIA_LISTINGS_INDEX;
const creatorIndex = process.env.REACT_APP_ALGOLIA_USERS_INDEX;

const searchClient = algoliasearch(appId, apiKey);

const prepareAlgoliaFilters = listingPreferences => {
  if (!Object.keys(listingPreferences).length) {
    return ""
  }

  let filters = '';
  const genreObject = Object.values(listingPreferences);

  for (const genreValue of genreObject) {
    const genreKeys = Object.keys(genreValue);
    filters +=
      genreKeys.map(genreKey => `publicData.primary_genre:${genreKey}`).join(' OR ') + ' OR ';
  }

  // Remove the trailing ' OR ' if filters is not empty
  filters = filters.slice(0, -4);

  return filters;
};

const getIndexName = (sectionName, creatorIndex, listingIndex, isCreatorsIndex) => {
  if (isCreatorsIndex) {
    return [POPULAR_CREATORS, TRENDING_CREATORS].includes(sectionName)
      ? `${creatorIndex}_views_desc`
      : `${creatorIndex}_timestamp_desc`;
  }

  return [TRENDING_SERIES_CONTENT, TRENDING_FILMS].includes(sectionName)
    ? `${listingIndex}_views_desc`
    : `${listingIndex}_timestamp_desc`;
};

const getDefaultState = (isCreatorsIndex, sectionName) => {
  // Sections that contain only series or films
  const onlySeriesSections = [TRENDING_SERIES_CONTENT, NEWLY_RELEASED_SERIES];
  const onlyFilmsSections = [TRENDING_FILMS, NEWLY_RELEASED_FILMS];

  // Common filters for creators (excluding banned users, deleted profiles, and private mode)
  const commonCreatorFilter = `NOT state:${USER_STATE_BANNED} AND deleted:false AND NOT privateMode:true`;

  // 1️⃣ If it's a creator's index, apply different rules based on section type
  if (isCreatorsIndex) {
    if (sectionName === CREATORS_WITH_SERIES) return `${commonCreatorFilter} AND totalSeries > 0`;
    if (sectionName === FILMS_CREATORS_SECTION) return `${commonCreatorFilter} AND totalFilms > 0`;
    return commonCreatorFilter; // General creator rule (not specific to films or series)
  }

  // 2️⃣ If it's NOT a creator's index, apply content-based filters
  if (onlySeriesSections.includes(sectionName)) {
    return `NOT privateMode:true AND state:${LISTING_STATE_PUBLISHED} AND markAsDraft:false AND publicData.listingType:${SERIES_PRODUCTS}`;
  }

  if (onlyFilmsSections.includes(sectionName)) {
    return `NOT privateMode:true AND state:${LISTING_STATE_PUBLISHED} AND markAsDraft:false AND publicData.listingType:${FILM_PRODUCTS}`;
  }

  // 3️⃣ Default fallback filter for non-creators
  return `NOT privateMode:true AND state:${LISTING_STATE_PUBLISHED} AND markAsDraft:false`;
};


const getInitialUiState = (initialCategory, indexName) => {
  if (!initialCategory) {
    console.log('Initial category is empty. No UI state applied.');
    return {};
  }

  return {
    [indexName]: {
      menu: { 'publicData.listingType': initialCategory },
    },
  };
};


const AlgoliaLandingPage = props => {
  const location = useLocation();
  const { sectionName, isAuthenticated = true, title, description, index } = props;
  
  const isCreatorsIndex = index === CREATOR_INDEX;
  const indexName = getIndexName(sectionName, creatorIndex, listingIndex, isCreatorsIndex);
  const initialCategory = useQuery(location.search).get('category');
  const defaultState = getDefaultState(isCreatorsIndex, sectionName);
  const initialUiState = getInitialUiState(initialCategory, indexName);


  return (
    <InstantSearch
      key={`${indexName}_${initialCategory || 'default'}`}
      indexName={indexName}
      searchClient={searchClient}
      initialUiState={{
        ...initialUiState
      }}
    >
      <Configure hitsPerPage={10} filters={defaultState} />
      {isAuthenticated ? (
        <AuthAlogliaLandingPage
          sectionName={sectionName}
          description={description}
          title={title}
        />
      ) : (
        <GuestAlgoliaLandingPage indexName={indexName} />
      )}
    </InstantSearch>
  );
};

export default AlgoliaLandingPage;
