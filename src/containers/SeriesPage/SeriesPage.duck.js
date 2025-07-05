import algoliasearch from 'algoliasearch';
import { fetchPageAssets } from '../../ducks/hostedAssets.duck';
import { getSeriesHeroData } from '../../util/api';
import { LISTING_CATEGORY_FILTER, LISTING_TYPE_SERIES, PRIMARY_GENRE_FILTER } from '../../constants';

// Initialize Algolia client
const algoliaApplicationId = process.env.REACT_APP_ALGOLIA_APP_ID;
const algoliaApiKey = process.env.REACT_APP_ALGOLIA_ADMIN_API_KEY;
const client = algoliasearch(algoliaApplicationId, algoliaApiKey);
const algoliaIndex = process.env.REACT_APP_ALGOLIA_LISTINGS_INDEX;
const listingIndex = client.initIndex(algoliaIndex);

const defaultSchemaFilters = {
  pub_markAsDraft: false,
  pub_deletedListing: false,
  pub_privateMode: false,
};

const includeParams = {
  include: ['author', 'author.profileImage', 'images', 'currentStock'],
  'fields.image': [
    // Scaled variants for large images
    'variants.scaled-small',
    'variants.scaled-medium',
    'variants.scaled-large',
    'variants.scaled-xlarge',

    // Social media
    'variants.facebook',
    'variants.twitter',

    // Avatars
    'variants.square-small',
    'variants.square-small2x',
  ],
};

export const SERIES_PAGE = 'series-page';

// ================ Action types ================ //
export const FETCH_SERIES_HERO_DATA_REQUEST = 'app/SeriesPage/FETCH_SERIES_HERO_DATA_REQUEST';
export const FETCH_SERIES_HERO_DATA_SUCCESS = 'app/SeriesPage/FETCH_SERIES_HERO_DATA_SUCCESS';
export const FETCH_SERIES_HERO_DATA_ERROR = 'app/SeriesPage/FETCH_SERIES_HERO_DATA_ERROR';

export const FETCH_GENRE_FACETS_REQUEST = 'app/SeriesPage/FETCH_GENRE_FACETS_REQUEST';
export const FETCH_GENRE_FACETS_SUCCESS = 'app/SeriesPage/FETCH_GENRE_FACETS_SUCCESS';
export const FETCH_GENRE_FACETS_ERROR = 'app/SeriesPage/FETCH_GENRE_FACETS_ERROR';

// ================ Reducer ================ //
const initialState = {
  seriesHero: null,
  seriesHeroError: null,
  seriesHeroInProgress: false,

  genreFacets: [],
  genreFacetsError: null,
  genreFacetsInProgress: false,
};

export default function reducer(state = initialState, action = {}) {
  const { type, payload } = action;
  switch (type) {
    case FETCH_SERIES_HERO_DATA_REQUEST:
      return { ...state, seriesHeroInProgress: true };
    case FETCH_SERIES_HERO_DATA_SUCCESS:
      return { ...state, seriesHero: payload };
    case FETCH_SERIES_HERO_DATA_ERROR:
      return { ...state, seriesHero: null, seriesHeroError: payload };

    case FETCH_GENRE_FACETS_REQUEST:
      return { ...state, genreFacetsInProgress: true };
    case FETCH_GENRE_FACETS_SUCCESS:
      return { ...state, genreFacets: payload };
    case FETCH_GENRE_FACETS_ERROR:
      return { ...state, genreFacets: [], genreFacetsError: payload };

    default:
      return state;
  }
}

// ================ Action creators ================ //
const requestAction = actionType => params => ({ type: actionType, payload: { params } });
const successAction = actionType => result => ({ type: actionType, payload: result.data });
const errorAction = actionType => payload => ({ type: actionType, payload, error: true });


const fetchSeriesHeroDataRequest = requestAction(FETCH_SERIES_HERO_DATA_REQUEST);
const fetchSeriesHeroDataSuccess = successAction(FETCH_SERIES_HERO_DATA_SUCCESS);
const fetchSeriesHeroDataError = errorAction(FETCH_SERIES_HERO_DATA_ERROR);

const fetchGenreFacetsRequest = requestAction(FETCH_GENRE_FACETS_REQUEST);
const fetchGenreFacetsSuccess = successAction(FETCH_GENRE_FACETS_SUCCESS);
const fetchGenreFacetsError = errorAction(FETCH_GENRE_FACETS_ERROR);

// ================ Thunks ================ //
export const fetchSeriesHeroData = () => async (dispatch, getState) => {
  dispatch(fetchSeriesHeroDataRequest());
  try {
    const response = await getSeriesHeroData();
    dispatch(fetchSeriesHeroDataSuccess(response.data));
  } catch (error) {
    dispatch(fetchSeriesHeroDataError(error));
  }
};

export const fetchSeriesGenres = () => async (dispatch, getState, sdk) => {
  try {
    dispatch(fetchGenreFacetsRequest());
    const response = await listingIndex.search('', {
      facets: [PRIMARY_GENRE_FILTER, LISTING_CATEGORY_FILTER],
      filters:`${LISTING_CATEGORY_FILTER}:${LISTING_TYPE_SERIES}`,
      hitsPerPage: 0, // Ensures no hits (results) are returned
    });
    
    const facets = response?.facets?.[PRIMARY_GENRE_FILTER];

    dispatch(fetchGenreFacetsSuccess({ data: Object.keys(facets || {}) }));
    return response;
  } catch (error) {
    console.error('Error fetching facet data:', error);
    dispatch(fetchGenreFacetsError(error));
  }
}

// ================ Selectors ================ //
export const seriesHeroDataSelector = state => state.SeriesPage.seriesHero;
export const genreFacetsSelector = state => state.SeriesPage.genreFacets;

export const loadData = (params, search) => (dispatch, getState) => {
  const pageAsset = { seriesPage: `content/pages/${SERIES_PAGE}.json` };
  return dispatch(fetchPageAssets(pageAsset, true));
};
