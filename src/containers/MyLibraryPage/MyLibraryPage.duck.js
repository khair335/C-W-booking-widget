import reverse from 'lodash/reverse';
import sortBy from 'lodash/sortBy';
import { ADDED_TO_WISHLIST, LISTING_TYPE_FILMS, LISTING_TYPE_SERIES } from '../../constants';
import { addMarketplaceEntities } from '../../ducks/marketplaceData.duck';
import { getAllTransitionsForEveryProcess } from '../../transactions/transaction';
import { getTransactionCollection, getUsersByIds, updateTransactionMetaData } from '../../util/api';
import { storableError } from '../../util/errors';
import { CREATOR_USER_TYPE, FILM_PRODUCTS, SERIES_PRODUCTS } from '../../util/types';
import { parse } from '../../util/urlHelpers';
import { updateProfile } from '../ProfileSettingsPage/ProfileSettingsPage.duck';
import { addedToWishlistObjectIDsAfterSearch, addedToWishlistObjectIDs } from '../../util/searchInsight';
import { lastTransitions } from '../../util/dataExtractor';

const RESULT_PAGE_SIZE = 30;
const includeParams = {
  include: ['author', 'images'],
  'fields.image': [
    'variants.scaled-small',
    'variants.scaled-medium',
  ],
  'limit.images': 1,
};

const sortedTransactions = txs =>
  reverse(
    sortBy(txs, tx => {
      return tx.attributes ? tx.attributes.lastTransitionedAt : null;
    })
  );

// ================ Action types ================ //

export const ADD_LISTING_TO_WISHLIST = 'app/MyLibraryPage/ADD_LISTING_TO_WISHLIST';
export const REMOVE_LISTING_FROM_WISHLIST = 'app/MyLibraryPage/REMOVE_LISTING_FROM_WISHLIST';

export const ADD_CREATOR_TO_WISHLIST = 'app/MyLibraryPage/ADD_CREATOR_TO_WISHLIST';
export const REMOVE_CREATOR_FROM_WISHLIST = 'app/MyLibraryPage/REMOVE_CREATOR_FROM_WISHLIST';

export const FETCH_ORDERS_OR_SALES_REQUEST = 'app/MyLibraryPage/FETCH_ORDERS_OR_SALES_REQUEST';
export const FETCH_ORDERS_OR_SALES_SUCCESS = 'app/MyLibraryPage/FETCH_ORDERS_OR_SALES_SUCCESS';
export const FETCH_ORDERS_OR_SALES_ERROR = 'app/MyLibraryPage/FETCH_ORDERS_OR_SALES_ERROR';

export const FETCH_WISHLIST_FILM_REQUEST = 'app/WishlistPage/FETCH_WISHLIST_FILM_REQUEST';
export const FETCH_WISHLIST_FILM_SUCCESS = 'app/WishlistPage/FETCH_WISHLIST_FILM_SUCCESS';
export const FETCH_WISHLIST_FILM_ERROR = 'app/WishlistPage/FETCH_WISHLIST_FILM_ERROR';

export const FETCH_WISHLIST_SERIES_REQUEST = 'app/WishlistPage/FETCH_WISHLIST_SERIES_REQUEST';
export const FETCH_WISHLIST_SERIES_SUCCESS = 'app/WishlistPage/FETCH_WISHLIST_SERIES_SUCCESS';
export const FETCH_WISHLIST_SERIES_ERROR = 'app/WishlistPage/FETCH_WISHLIST_SERIES_ERROR';

export const FETCH_WISHLIST_CREATOR_REQUEST = 'app/WishlistPage/FETCH_WISHLIST_CREATOR_REQUEST';
export const FETCH_WISHLIST_CREATOR_SUCCESS = 'app/WishlistPage/FETCH_WISHLIST_CREATOR_SUCCESS';
export const FETCH_WISHLIST_CREATOR_ERROR = 'app/WishlistPage/FETCH_WISHLIST_CREATOR_ERROR';

export const FILM_WATCHED_SUCCESS = 'app/WishlistPage/FILM_WATCHED_SUCCESS';

// ================ Reducer ================ //

const resultIds = data => (Array.isArray(data) ? data.map(elm => elm?.id?.uuid) : []);

const entityRefs = entities =>
  entities.map(entity => ({
    id: entity.id,
    type: entity.type,
  }));

const initialState = {
  fetchInProgress: false,
  fetchOrdersOrSalesError: null,
  pagination: null,
  transactionRefs: [],
  wishlistFilmIds: [],
  wishlistFilmsLoading: false,
  wishlistFilmsError: null,
  wishlistSeriesIds: [],
  wishlistSeriesLoading: false,
  wishlistSeriesError: null,
  wishlistCreators: [],
  wishlistCreatorsLoading: false,
  wishlistCreatorsError: null,
};

export default function MyLibraryPageReducer(state = initialState, action = {}) {
  const { type, payload } = action;
  switch (type) {
    case FETCH_ORDERS_OR_SALES_REQUEST:
      return { ...state, fetchInProgress: true, fetchOrdersOrSalesError: null };
    case FETCH_ORDERS_OR_SALES_SUCCESS: {
      const transactions = sortedTransactions(payload.data.data);
      return {
        ...state,
        fetchInProgress: false,
        transactionRefs: entityRefs(transactions),
        pagination: payload.data.meta,
      };
    }
    case FETCH_ORDERS_OR_SALES_ERROR:
      console.error(payload); // eslint-disable-line
      return { ...state, fetchInProgress: false, fetchOrdersOrSalesError: payload };

    case FETCH_WISHLIST_FILM_REQUEST:
      return { ...state, wishlistFilmsLoading: true, wishlistFilmsError: null };
    case FETCH_WISHLIST_FILM_SUCCESS:
      return {
        ...state,
        wishlistFilmIds: resultIds(payload.data.data),
        wishlistFilmsLoading: false,
      };
    case FETCH_WISHLIST_FILM_ERROR:
      return { ...state, wishlistFilmsLoading: false, wishlistFilmsError: payload };

    case FETCH_WISHLIST_SERIES_REQUEST:
      return { ...state, wishlistSeriesLoading: true, wishlistSeriesError: null };
    case FETCH_WISHLIST_SERIES_SUCCESS:
      return {
        ...state,
        wishlistSeriesIds: resultIds(payload.data.data),
        wishlistSeriesLoading: false,
      };
    case FETCH_WISHLIST_SERIES_ERROR:
      return { ...state, wishlistSeriesLoading: false, wishlistSeriesError: payload };

    case FETCH_WISHLIST_CREATOR_REQUEST:
      return { ...state, wishlistCreatorsLoading: true, wishlistCreatorsError: null };
    case FETCH_WISHLIST_CREATOR_SUCCESS:
      return {
        ...state,
        wishlistCreators: payload,
        wishlistCreatorsLoading: false,
      };
    case FILM_WATCHED_SUCCESS:
      return {
        ...state,
      };
    case FETCH_WISHLIST_CREATOR_ERROR:
      return { ...state, wishlistCreatorsLoading: false, wishlistCreatorsError: payload };

    default:
      return state;
  }
}

// ================ Action creators ================ //

const addListingToWishlist = (payload) => ({ type: ADD_LISTING_TO_WISHLIST, payload });
const removeListingFromWishlist = () => ({ type: REMOVE_LISTING_FROM_WISHLIST });

const addCreatorToWishlist = (payload) => ({ type: ADD_CREATOR_TO_WISHLIST, payload });
const removeCreatorFromWishlist = () => ({ type: REMOVE_CREATOR_FROM_WISHLIST });

const fetchOrdersOrSalesRequest = () => ({ type: FETCH_ORDERS_OR_SALES_REQUEST });
const fetchOrdersOrSalesSuccess = response => ({
  type: FETCH_ORDERS_OR_SALES_SUCCESS,
  payload: response,
});
const fetchOrdersOrSalesError = e => ({
  type: FETCH_ORDERS_OR_SALES_ERROR,
  error: true,
  payload: e,
});

export const fetchWishlistFilmRequest = () => ({ type: FETCH_WISHLIST_FILM_REQUEST });
export const fetchWishlistFilmSuccess = wishlistItems => ({
  type: FETCH_WISHLIST_FILM_SUCCESS,
  payload: wishlistItems,
});
export const fetchWishlistFilmError = error => ({
  type: FETCH_WISHLIST_FILM_ERROR,
  payload: error,
});

export const fetchWishlistSeriesRequest = () => ({ type: FETCH_WISHLIST_SERIES_REQUEST });
export const fetchWishlistSeriesSuccess = wishlistItems => ({
  type: FETCH_WISHLIST_SERIES_SUCCESS,
  payload: wishlistItems,
});
export const fetchWishlistSeriesError = error => ({
  type: FETCH_WISHLIST_SERIES_ERROR,
  payload: error,
});

export const fetchWishlistCreatorRequest = () => ({ type: FETCH_WISHLIST_CREATOR_REQUEST });
export const fetchWishlistCreatorSuccess = wishlistItems => ({
  type: FETCH_WISHLIST_CREATOR_SUCCESS,
  payload: wishlistItems,
});
export const fetchWishlistCreatorError = error => ({
  type: FETCH_WISHLIST_CREATOR_ERROR,
  payload: error,
});

export const fetchFilmWatchedSuccess = (response, listing) => ({
  type: FILM_WATCHED_SUCCESS,
  payload: { response, listing },
});

// ================ Thunks ================ //

const INBOX_PAGE_SIZE = 10;

export const updateWishlist = (wishlist, isAdding, type, data) => (dispatch, getState) => {
  if (isAdding) {
    if (type === CREATOR_USER_TYPE && data?.user?.id?.uuid) {
      dispatch(addCreatorToWishlist(data));
      // Trigger Algolia add to cart event
      const params = {
        userToken: getState().user.currentUser?.id?.uuid || '',
        ...(!!data.queryID ? { queryID: data.queryID } : {}),
        eventName: ADDED_TO_WISHLIST,
        index: process.env.REACT_APP_ALGOLIA_USERS_INDEX,
        objectIDs: [data.user.id.uuid],
      };
      if (!!data.queryID) {
        addedToWishlistObjectIDsAfterSearch(params);
      } else {
        addedToWishlistObjectIDs(params);
      }

    } else if ([LISTING_TYPE_SERIES, LISTING_TYPE_FILMS].includes(type) && data.listing?.id?.uuid) {
      dispatch(addListingToWishlist(data));
      const params = {
        userToken: getState().user.currentUser?.id?.uuid || '',
        ...(!!data.queryID ? { queryID: data.queryID } : {}),
        eventName: ADDED_TO_WISHLIST,
        index: process.env.REACT_APP_ALGOLIA_LISTINGS_INDEX,
        objectIDs: [data.listing.id.uuid],
        value: data.listing.attributes.price.amount,
        currency: data.listing.attributes.price.currency,
      };

      if (!!data.queryID) {
        addedToWishlistObjectIDsAfterSearch(params);
      } else {
        addedToWishlistObjectIDs(params);
      }
    }
  }

  return dispatch(updateProfile(wishlist));
};

export function fetchSeriesListings(ids, page = 1) {
  return (dispatch, getState, sdk) => {
    dispatch(fetchWishlistSeriesRequest());

    return sdk.listings
      .query({ ids, ...includeParams })
      .then(response => {
        dispatch(addMarketplaceEntities(response));
        dispatch(fetchWishlistSeriesSuccess(response));
      })
      .catch(e => {
        dispatch(fetchWishlistSeriesError(e));
      });
  };
}

export function fetchFilmsListings(ids, page = 1) {
  return (dispatch, getState, sdk) => {
    dispatch(fetchWishlistFilmRequest());

    return sdk.listings
      .query({ ids, ...includeParams })
      .then(response => {
        dispatch(addMarketplaceEntities(response));
        dispatch(fetchWishlistFilmSuccess(response));
      })
      .catch(e => {
        dispatch(fetchWishlistFilmError(e));
      });
  };
}

export const fetchWishlistCreators = (creatorIds, searchParams) => (dispatch, getState, sdk) => {
  dispatch(fetchWishlistCreatorRequest());

  return getUsersByIds({ userIds: creatorIds })
    .then(response => {
      const creators = response?.users || [];
      dispatch(fetchWishlistCreatorSuccess(creators));
      return response;
    })
    .catch(e => {
      const error = storableError(e);
      dispatch(fetchWishlistCreatorError(error));
      if (!(isErrorUserPendingApproval(error) || isForbiddenError(error))) {
        throw e;
      }
    });
};

export const updateMetadata = (params) => (dispatch, getState, sdk) => {
  return updateTransactionMetaData({ ...params })
    .then((res) => {
      const { data, included: includes = [] } = res.data;
      const { id } = data;

      return sdk.transactions
        .query({
          only: "order",
          include: ["listing"],
          "fields.listing": ["publicData"],
        })
        .then((response) => {
          const { data } = response;
          const { data: orders, included = [] } = data;

          // Ensure orders and included are valid and non-empty
          if (!orders.length || !included.length) {
            console.warn("No orders or included data available.");
            return res;
          }

          // Check if the last order matches the current transaction
          const lastOrder = orders[orders.length - 1];
          const lastOrderId = lastOrder.id.uuid;
          const isCurrentTransaction = lastOrderId === id.uuid;

          // Check for the first film watched
          const isFirstFilmWatched = isCurrentTransaction &&
            included.some((item) =>
              item.attributes.publicData.listingType === FILM_PRODUCTS
            );
          const listing = includes.find((e) => e.type == "listing");
          // for first film watched 
          if (isFirstFilmWatched) {
            dispatch(fetchFilmWatchedSuccess(res, listing));
          }
          return res;
        });
    })
    .catch((e) => {
      console.error("Error in updateMetadata:", e);
      return e;
    });
};

export const loadData = (params, search, config) => (dispatch, getState, sdk) => {
  dispatch(fetchOrdersOrSalesRequest());

  const { page = 1 } = parse(search);
  const { currentUser } = getState().user || {};
  const wishlistData = currentUser?.attributes.profile.publicData.wishlistData || {};
  const filmListingIds = wishlistData?.[FILM_PRODUCTS] || [];
  const seriesListingIds = wishlistData?.[SERIES_PRODUCTS] || [];
  const creatorIds = wishlistData?.creatorIds || [];

  const apiQueryParams = {
    only: 'order',
    lastTransitions: lastTransitions,
    include: [
      'listing',
      'provider',
      'provider.profileImage',
      'customer',
      'customer.profileImage',
      'booking',
    ],
    'fields.transaction': [
      'processName',
      'lastTransition',
      'lastTransitionedAt',
      'transitions',
      'payinTotal',
      'payoutTotal',
      'lineItems',
    ],
    'fields.listing': ['title', 'availabilityPlan', 'publicData'],
    'fields.user': ['profile.displayName', 'profile.abbreviatedName', 'deleted', 'banned'],
    'fields.image': ['variants.square-small', 'variants.square-small2x'],
    page,
    perPage: INBOX_PAGE_SIZE,
  };

  dispatch(fetchSeriesListings(seriesListingIds));
  dispatch(fetchFilmsListings(filmListingIds));
  dispatch(fetchWishlistCreators(creatorIds));

  return sdk.transactions
    .query(apiQueryParams)
    .then(response => {
      const transactions = response.data.data || [];

      const transactionPromises = transactions.map(async transaction => {
        const collectionResponse = await getTransactionCollection({
          buyerUserId: currentUser?.id?.uuid,
          transactionId: transaction.id.uuid,
        });

        // Structure each transaction to include additional collection data
        return {
          ...transaction,
          attributes: {
            ...transaction.attributes,
            collectionData: collectionResponse.data, // Adding collection data to attributes
          },
        };
      });

      Promise.all(transactionPromises)
        .then(updatedTransactions => {
          const sdkResponse = {
            status: 200,
            statusText: 'OK',
            data: {
              data: updatedTransactions, // Updated transactions array
              included: response.data.included || [], // Preserve any included data from original response
              meta: response.data.meta, // Keep meta data from the original response
            },
          };

          // Dispatch with the correctly formatted sdkResponse
          dispatch(addMarketplaceEntities(sdkResponse));
          dispatch(fetchOrdersOrSalesSuccess(sdkResponse));
        })
        .catch(error => {
          console.error('Error fetching transaction collections:', error);
        });

      return response;
    })
    .catch(e => {
      dispatch(fetchOrdersOrSalesError(storableError(e)));
      throw e;
    });
};
