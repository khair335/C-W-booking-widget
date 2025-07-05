import { LISTING_TYPE_FILMS, LISTING_TYPE_SERIES } from '../../constants';
import { fetchPageAssets } from '../../ducks/hostedAssets.duck';
import { addMarketplaceEntities } from '../../ducks/marketplaceData.duck';
import { getFeaturedCreators, getLandingPageCarouselData, getMyCreators } from '../../util/api';

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

export const LANDING_PAGE = 'landing-page';
export const GUEST_LANDING_PAGE = 'guest-landing-page';

export const FETCH_RECENT_LISTINGS_REQUEST = 'app/OtherSections/FETCH_RECENT_LISTINGS_REQUEST';
export const FETCH_RECENT_LISTINGS_SUCCESS = 'app/OtherSections/FETCH_RECENT_LISTINGS_SUCCESS';
export const FETCH_RECENT_LISTINGS_ERROR = 'app/OtherSections/FETCH_RECENT_LISTINGS_ERROR';

export const FETCH_SERIES_LISTINGS_REQUEST = 'app/OtherSections/FETCH_SERIES_LISTINGS_REQUEST';
export const FETCH_SERIES_LISTINGS_SUCCESS = 'app/OtherSections/FETCH_SERIES_LISTINGS_SUCCESS';
export const FETCH_SERIES_LISTINGS_ERROR = 'app/OtherSections/FETCH_SERIES_LISTINGS_ERROR';

export const FETCH_FILMS_LISTINGS_REQUEST = 'app/OtherSections/FETCH_FILMS_LISTINGS_REQUEST';
export const FETCH_FILMS_LISTINGS_SUCCESS = 'app/OtherSections/FETCH_FILMS_LISTINGS_SUCCESS';
export const FETCH_FILMS_LISTINGS_ERROR = 'app/OtherSections/FETCH_FILMS_LISTINGS_ERROR';

export const FETCH_FEATURED_CREATORS_REQUEST = 'app/OtherSections/FETCH_FEATURED_CREATORS_REQUEST';
export const FETCH_FEATURED_CREATORS_SUCCESS = 'app/OtherSections/FETCH_FEATURED_CREATORS_SUCCESS';
export const FETCH_FEATURED_CREATORS_ERROR = 'app/OtherSections/FETCH_FEATURED_CREATORS_ERROR';

export const FETCH_WISHLIST_REQUEST = 'app/OtherSections/FETCH_WISHLIST_REQUEST';
export const FETCH_WISHLIST_SUCCESS = 'app/OtherSections/FETCH_WISHLIST_SUCCESS';
export const FETCH_WISHLIST_ERROR = 'app/OtherSections/FETCH_WISHLIST_ERROR';

export const FETCH_WATCHLIST_REQUEST = 'app/OtherSections/FETCH_WATCHLIST_REQUEST';
export const FETCH_WATCHLIST_SUCCESS = 'app/OtherSections/FETCH_WATCHLIST_SUCCESS';
export const FETCH_WATCHLIST_ERROR = 'app/OtherSections/FETCH_WATCHLIST_ERROR';

export const FETCH_MY_CREATORS_REQUEST = 'app/OtherSections/FETCH_MY_CREATORS_REQUEST';
export const FETCH_MY_CREATORS_SUCCESS = 'app/OtherSections/FETCH_MY_CREATORS_SUCCESS';
export const FETCH_MY_CREATORS_ERROR = 'app/OtherSections/FETCH_MY_CREATORS_ERROR';

export const FETCH_CAROUSEL_DATA_REQUEST = 'app/OtherSections/FETCH_CAROUSEL_DATA_REQUEST';
export const FETCH_CAROUSEL_DATA_SUCCESS = 'app/OtherSections/FETCH_CAROUSEL_DATA_SUCCESS';
export const FETCH_CAROUSEL_DATA_ERROR = 'app/OtherSections/FETCH_CAROUSEL_DATA_ERROR';

const initialState = {
  recentListingsInProgress: false,
  recentListings: [],
  recentListingsError: null,

  seriesListingsInProgress: false,
  seriesListings: [],
  seriesListingsError: null,

  filmsListingsInProgress: false,
  filmsListings: [],
  filmsListingsError: null,

  featuredCreatorsInProgress: false,
  featuredCreators: [],
  featuredCreatorsError: null,

  wishlistInProgress: false,
  wishlist: [],
  wishlistError: null,

  watchlistInProgress: false,
  watchlist: [],
  watchlistError: null,

  myCreators: [],
  myCreatorsError: null,
  myCreatorsInProgress: false,

  carouselDataInProgress: false,
  carouselData: [],
  carouselDataError: null,
};

export default function reducer(state = initialState, action = {}) {
  const { type, payload } = action;
  switch (type) {
    case FETCH_RECENT_LISTINGS_REQUEST:
      return { ...state, recentListingsInProgress: true, recentListingsError: null };
    case FETCH_RECENT_LISTINGS_SUCCESS:
      return {
        ...state,
        recentListings: payload,
        recentListingsInProgress: false,
        recentListingsError: null,
      };
    case FETCH_RECENT_LISTINGS_ERROR:
      return {
        ...state,
        recentListings: [],
        recentListingsInProgress: false,
        recentListingsError: payload,
      };
    case FETCH_SERIES_LISTINGS_REQUEST:
      return { ...state, seriesListingsInProgress: true, seriesListingsError: null };
    case FETCH_SERIES_LISTINGS_SUCCESS:
      return {
        ...state,
        seriesListings: payload,
        seriesListingsInProgress: false,
        seriesListingsError: null,
      };
    case FETCH_SERIES_LISTINGS_ERROR:
      return {
        ...state,
        seriesListings: [],
        seriesListingsInProgress: false,
        seriesListingsError: payload,
      };
    case FETCH_FILMS_LISTINGS_REQUEST:
      return { ...state, filmsListingsInProgress: true, filmsListingsError: null };
    case FETCH_FILMS_LISTINGS_SUCCESS:
      return {
        ...state,
        filmsListings: payload,
        filmsListingsInProgress: false,
        filmsListingsError: null,
      };
    case FETCH_FILMS_LISTINGS_ERROR:
      return {
        ...state,
        filmsListings: [],
        filmsListingsInProgress: false,
        filmsListingsError: payload,
      };
    case FETCH_FEATURED_CREATORS_REQUEST:
      return { ...state, featuredCreatorsInProgress: true, featuredCreatorsError: null };
    case FETCH_FEATURED_CREATORS_SUCCESS:
      return {
        ...state,
        featuredCreators: payload,
        featuredCreatorsInProgress: false,
        featuredCreatorsError: null,
      };
    case FETCH_FEATURED_CREATORS_ERROR:
      return {
        ...state,
        featuredCreators: [],
        featuredCreatorsInProgress: false,
        featuredCreatorsError: payload,
      };

    case FETCH_WISHLIST_REQUEST:
      return { ...state, wishlistInProgress: true, wishlistError: null };
    case FETCH_WISHLIST_SUCCESS:
      return {
        ...state,
        wishlist: payload,
        wishlistInProgress: false,
        wishlistError: null,
      };
    case FETCH_WISHLIST_ERROR:
      return {
        ...state,
        wishlist: [],
        wishlistInProgress: false,
        wishlistError: payload,
      };

    case FETCH_WATCHLIST_REQUEST:
      return { ...state, watchlistInProgress: true, watchlistError: null };
    case FETCH_WATCHLIST_SUCCESS:
      return {
        ...state,
        watchlist: payload,
        watchlistInProgress: false,
        watchlistError: null,
      };
    case FETCH_WATCHLIST_ERROR:
      return {
        ...state,
        watchlist: [],
        watchlistInProgress: false,
        watchlistError: payload,
      }

    case FETCH_MY_CREATORS_REQUEST:
      return { ...state, myCreatorsInProgress: true, myCreatorsError: null };
    case FETCH_MY_CREATORS_SUCCESS:
      return {
        ...state,
        myCreators: payload,
        myCreatorsInProgress: false,
        myCreatorsError: null,
      };
    case FETCH_MY_CREATORS_ERROR:
      return {
        ...state,
        myCreators: [],
        myCreatorsInProgress: false,
        myCreatorsError: payload,
      };

    case FETCH_CAROUSEL_DATA_REQUEST:
      return { ...state, carouselDataInProgress: true, carouselDataError: null };
    case FETCH_CAROUSEL_DATA_SUCCESS:
      return {
        ...state,
        carouselData: payload,
        carouselDataInProgress: false,
        carouselDataError: null,
      };
    case FETCH_CAROUSEL_DATA_ERROR:
      return {
        ...state,
        carouselData: [],
        carouselDataInProgress: false,
        carouselDataError: payload,
      };

    default:
      return state;
  }
}

// ================ Action creators ================ //
const requestAction = actionType => params => ({ type: actionType, payload: { params } });
const successAction = actionType => result => ({ type: actionType, payload: result.data });
const errorAction = actionType => payload => ({ type: actionType, payload, error: true });

export const fetchRecentListingRequest = requestAction(FETCH_RECENT_LISTINGS_REQUEST);
export const fetchRecentListingSuccess = successAction(FETCH_RECENT_LISTINGS_SUCCESS);
export const fetchRecentListingError = errorAction(FETCH_RECENT_LISTINGS_ERROR);

export const fetchSeriesListingRequest = requestAction(FETCH_SERIES_LISTINGS_REQUEST);
export const fetchSeriesListingSuccess = successAction(FETCH_SERIES_LISTINGS_SUCCESS);
export const fetchSeriesListingError = errorAction(FETCH_SERIES_LISTINGS_ERROR);

export const fetchFilmsListingRequest = requestAction(FETCH_FILMS_LISTINGS_REQUEST);
export const fetchFilmsListingSuccess = successAction(FETCH_FILMS_LISTINGS_SUCCESS);
export const fetchFilmsListingError = errorAction(FETCH_FILMS_LISTINGS_ERROR);

export const fetchfeaturedCreatorsRequest = requestAction(FETCH_FEATURED_CREATORS_REQUEST);
export const fetchfeaturedCreatorsSuccess = successAction(FETCH_FEATURED_CREATORS_SUCCESS);
export const fetchfeaturedCreatorsError = errorAction(FETCH_FEATURED_CREATORS_ERROR);

export const fetchWishlistRequest = requestAction(FETCH_WISHLIST_REQUEST);
export const fetchWishlistSuccess = successAction(FETCH_WISHLIST_SUCCESS);
export const fetchWishlistError = errorAction(FETCH_WISHLIST_ERROR);

export const fetchWatchlistRequest = requestAction(FETCH_WATCHLIST_REQUEST);
export const fetchWatchlistSuccess = successAction(FETCH_WATCHLIST_SUCCESS);
export const fetchWatchlistError = errorAction(FETCH_WATCHLIST_ERROR);

export const fetchMyCreatorsRequest = requestAction(FETCH_MY_CREATORS_REQUEST);
export const fetchMyCreatorsSuccess = successAction(FETCH_MY_CREATORS_SUCCESS);
export const fetchMyCreatorsError = errorAction(FETCH_MY_CREATORS_ERROR);

export const fetchCarouselDataRequest = requestAction(FETCH_CAROUSEL_DATA_REQUEST);
export const fetchCarouselDataSuccess = successAction(FETCH_CAROUSEL_DATA_SUCCESS);
export const fetchCarouselDataError = errorAction(FETCH_CAROUSEL_DATA_ERROR);

export function fetchLatestContent() {
  return (dispatch, getState, sdk) => {
    dispatch(fetchRecentListingRequest());
    return sdk.listings
      .query({ sort: 'createdAt', ...defaultSchemaFilters, perPage: 10, ...includeParams })
      .then(response => {
        dispatch(addMarketplaceEntities(response));
        dispatch(fetchRecentListingSuccess(response?.data));
      })
      .catch(e => {
        dispatch(fetchRecentListingError(e));
      });
  };
};

export function fetchSeriesListings() {
  return (dispatch, getState, sdk) => {
    dispatch(fetchSeriesListingRequest());
    return sdk.listings
      .query({
        pub_listingType: LISTING_TYPE_SERIES,
        ...defaultSchemaFilters,
        perPage: 10,
        ...includeParams,
      })
      .then(response => {
        dispatch(addMarketplaceEntities(response));
        dispatch(fetchSeriesListingSuccess(response?.data));
      })
      .catch(e => {
        dispatch(fetchSeriesListingError(e));
      });
  };
};

export function fetchFilmsListings() {
  return (dispatch, getState, sdk) => {
    dispatch(fetchFilmsListingRequest());
    return sdk.listings
      .query({
        pub_listingType: LISTING_TYPE_FILMS,
        ...defaultSchemaFilters,
        perPage: 10,
        ...includeParams,
      })
      .then(response => {
        dispatch(addMarketplaceEntities(response));
        dispatch(fetchFilmsListingSuccess(response?.data));
      })
      .catch(e => {
        dispatch(fetchFilmsListingError(e));
      });
  };
};

export function fetchFeaturedCreators() {
  return (dispatch, getState, sdk) => {
    dispatch(fetchfeaturedCreatorsRequest());
    return getFeaturedCreators()
      .then(response => {
        dispatch(addMarketplaceEntities(response));
        dispatch(fetchfeaturedCreatorsSuccess(response?.data));
      })
      .catch(e => {
        dispatch(fetchfeaturedCreatorsError(e));
      });
  };
};

export function getWishlistListings() {
  return async (dispatch, getState, sdk) => {
    // Helper function to dispatch empty success for consistency
    const dispatchEmptyWishlist = () => dispatch(fetchWishlistSuccess({ data: [] }));

    dispatch(fetchWishlistRequest());

    const { currentUser } = getState().user;

    // Early exit if the user is not logged in
    if (!currentUser?.id) {
      dispatchEmptyWishlist();
      return;
    }

    const { publicData } = currentUser.attributes.profile;
    const { wishlistData = {} } = publicData;
    const { film_products = [], series_products = [] } = wishlistData;

    // Combine all wishlist items
    const wishlistListings = [...film_products, ...series_products];

    // If wishlist is empty, exit early
    if (wishlistListings.length === 0) {
      dispatchEmptyWishlist();
      return;
    }

    try {
      // Query the listings API with the wishlist
      const response = await sdk.listings.query({
        ids: wishlistListings,
        ...defaultSchemaFilters,
        perPage: 10,
        ...includeParams,
      });

      // Dispatch success and marketplace entities
      dispatch(addMarketplaceEntities(response));
      dispatch(fetchWishlistSuccess(response?.data));

      return response;
    } catch (error) {
      // Handle errors gracefully
      console.error("Failed to fetch wishlist listings:", error);
      dispatch(fetchWishlistError(error));
    }
  };
};


export function fetchWatchListings() {
  return async (dispatch, getState, sdk) => {
    dispatch(fetchWatchlistRequest());
    const { currentUser } = getState().user;
    const { privateData } = currentUser?.attributes?.profile || {};

    if (!currentUser?.id || !privateData?.watchlist || !privateData?.watchlist?.length) {
      dispatch(fetchWatchlistSuccess({ data: [] }));
      return;
    };
    try {
      const response = await sdk.listings.query({
        ...defaultSchemaFilters,
        perPage: 10,
        ...includeParams,
        ids: [...privateData.watchlist],
      });

      // Create a Map for quick lookup
      const listings = response.data.data;
      const listingsMap = new Map(listings.map(item => [item.id.uuid, item]));

      // Reorder results based on ids order
      const orderedListings = privateData.watchlist.map(id => listingsMap.get(id));

      dispatch(addMarketplaceEntities(response));
      dispatch(fetchWatchlistSuccess({ data: orderedListings }));

    } catch (error) {
      dispatch(fetchWatchlistError(error));
    }
  }
};

export function fetchMyCreators() {
  return (dispatch, getState, sdk) => {
    dispatch(fetchMyCreatorsRequest());
    const { currentUser } = getState().user;
    if (!currentUser?.id) {
      dispatch(fetchMyCreatorsSuccess({ data: [] }));
      return;
    };

    return getMyCreators(currentUser.id.uuid)
      .then(response => {
        dispatch(fetchMyCreatorsSuccess(response));
      })
      .catch(e => {
        dispatch(fetchMyCreatorsError(e));
      });
  };
}

export function fetchCarouselData() {
  return (dispatch, getState, sdk) => {
    dispatch(fetchCarouselDataRequest());
    return getLandingPageCarouselData()
      .then(response => {
        dispatch(fetchCarouselDataSuccess(response.data));
      })
      .catch(e => {
        dispatch(fetchCarouselDataError(e));
      });
  }
};

// ================ Selectors ================ //

export const recentListingsSelector = state => state.LandingPage.recentListings;
export const seriesListingsSelector = state => state.LandingPage.seriesListings;
export const filmsListingsSelector = state => state.LandingPage.filmsListings;
export const featuredCreatorsSelector = state => state.LandingPage.featuredCreators;
export const wishlistSelector = state => state.LandingPage.wishlist;
export const watchlistSelector = state => state.LandingPage.watchlist;
export const myCreatorsSelector = state => state.LandingPage.myCreators;
export const carouselDataSelector = state => state.LandingPage.carouselData;

export const loadData = (params, search) => (dispatch, getState) => {
  const { isAuthenticated } = getState().auth;
  const ASSET_NAME = isAuthenticated ? LANDING_PAGE : GUEST_LANDING_PAGE;
  // const ASSET_NAME = GUEST_LANDING_PAGE;
  const pageAsset = { landingPage: `content/pages/${ASSET_NAME}.json` };
  return dispatch(fetchPageAssets(pageAsset, true));
};
