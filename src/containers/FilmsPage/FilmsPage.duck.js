import algoliasearch from 'algoliasearch';
import { fetchPageAssets } from '../../ducks/hostedAssets.duck';
import { getFilmsHeroData } from '../../util/api';
import { LISTING_CATEGORY_FILTER, LISTING_TYPE_FILMS, PRIMARY_GENRE_FILTER } from '../../constants';

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

export const FILMS_PAGE = 'films-page';

// ================ Action types ================ //
export const FETCH_FILMS_HERO_DATA_REQUEST = 'app/FilmsPage/FETCH_FILMS_HERO_DATA_REQUEST';
export const FETCH_FILMS_HERO_DATA_SUCCESS = 'app/FilmsPage/FETCH_FILMS_HERO_DATA_SUCCESS';
export const FETCH_FILMS_HERO_DATA_ERROR = 'app/FilmsPage/FETCH_FILMS_HERO_DATA_ERROR';

export const FETCH_GENRE_FACETS_REQUEST = 'app/FilmsPage/FETCH_GENRE_FACETS_REQUEST';
export const FETCH_GENRE_FACETS_SUCCESS = 'app/FilmsPage/FETCH_GENRE_FACETS_SUCCESS';
export const FETCH_GENRE_FACETS_ERROR = 'app/FilmsPage/FETCH_GENRE_FACETS_ERROR';

// ================ Reducer ================ //
const initialState = {
  filmsHero: null,
  filmsHeroError: null,
  filmsHeroInProgress: false,

  genreFacets: [],
  genreFacetsError: null,
  genreFacetsInProgress: false,
};

export default function reducer(state = initialState, action = {}) {
  const { type, payload } = action;
  switch (type) {
    case FETCH_FILMS_HERO_DATA_REQUEST:
      return { ...state, filmsHeroInProgress: true };
    case FETCH_FILMS_HERO_DATA_SUCCESS:
      return { ...state, filmsHero: payload };
    case FETCH_FILMS_HERO_DATA_ERROR:
      return { ...state, filmsHero: null, filmsHeroError: payload };

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


const fetchFilmsHeroDataRequest = requestAction(FETCH_FILMS_HERO_DATA_REQUEST);
const fetchFilmsHeroDataSuccess = successAction(FETCH_FILMS_HERO_DATA_SUCCESS);
const fetchFilmsHeroDataError = errorAction(FETCH_FILMS_HERO_DATA_ERROR);

const fetchGenreFacetsRequest = requestAction(FETCH_GENRE_FACETS_REQUEST);
const fetchGenreFacetsSuccess = successAction(FETCH_GENRE_FACETS_SUCCESS);
const fetchGenreFacetsError = errorAction(FETCH_GENRE_FACETS_ERROR);

// ================ Thunks ================ //
export const fetchFilmsHeroData = () => async (dispatch, getState) => {
  dispatch(fetchFilmsHeroDataRequest());
  try {
    const response = await getFilmsHeroData();
    dispatch(fetchFilmsHeroDataSuccess(response.data));
  } catch (error) {
    dispatch(fetchFilmsHeroDataError(error));
  }
};

export const fetchFilmsGenres = () => async (dispatch, getState, sdk) => {
  try {
    dispatch(fetchGenreFacetsRequest());
    const response = await listingIndex.search('', {
      facets: [PRIMARY_GENRE_FILTER, LISTING_CATEGORY_FILTER],
      filters:`${LISTING_CATEGORY_FILTER}:${LISTING_TYPE_FILMS}`,
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
export const filmsHeroDataSelector = state => state.FilmsPage.filmsHero;
export const genreFacetsSelector = state => state.FilmsPage.genreFacets;

export const loadData = (params, search) => (dispatch, getState) => {
  const pageAsset = { filmsPage: `content/pages/${FILMS_PAGE}.json` };
  
  return dispatch(fetchPageAssets(pageAsset, true));
};
