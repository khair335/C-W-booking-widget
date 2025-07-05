import { util as sdkUtil } from '../util/sdkLoader';
import { denormalisedResponseEntities, ensureOwnListing, extractStorableData, getUploadKey, updateListingToMongo } from '../util/data';
import * as log from '../util/log';
import { LISTING_STATE_DRAFT, LISTING_STATE_PENDING_APPROVAL, SERIES_PRODUCTS } from '../util/types';
import { storableError } from '../util/errors';
import { isUserAuthorized } from '../util/userHelpers';
import { getTransitionsNeedingProviderAttention } from '../transactions/transaction';

import { authInfo } from './auth.duck';
import { stripeAccountCreateSuccess } from './stripeConnectAccount.duck';
import { uploadFileToGumlet } from '../util/uploadAssets';
import { ASSET_CATEGORY_EPISODE, ASSET_CATEGORY_FILM, ASSET_CATEOGRY_MARKETING, GUMLET_ASSET, GUMLET_PROCESSING_STATUS, LISTING_STATE_PUBLISHED, SEARCHABLE_LISTING_ATTRIBUTES, STATUS_PENDING_APPROVAL, TYPE_UPLOAD_ERROR, TYPE_UPLOAD_SUCCESS, WASABI_ASSET } from '../constants';
import { deleteGumletAsset, deleteWasabiFile, updateAlgoliaData, uploadImageFileToWasabi } from '../util/api';
import { v4 as uuidv4 } from 'uuid';

// ================ Action types ================ //

export const CURRENT_USER_SHOW_REQUEST = 'app/user/CURRENT_USER_SHOW_REQUEST';
export const CURRENT_USER_SHOW_SUCCESS = 'app/user/CURRENT_USER_SHOW_SUCCESS';
export const CURRENT_USER_SHOW_ERROR = 'app/user/CURRENT_USER_SHOW_ERROR';

export const CLEAR_CURRENT_USER = 'app/user/CLEAR_CURRENT_USER';

export const FETCH_CURRENT_USER_HAS_LISTINGS_REQUEST =
  'app/user/FETCH_CURRENT_USER_HAS_LISTINGS_REQUEST';
export const FETCH_CURRENT_USER_HAS_LISTINGS_SUCCESS =
  'app/user/FETCH_CURRENT_USER_HAS_LISTINGS_SUCCESS';
export const FETCH_CURRENT_USER_HAS_LISTINGS_ERROR =
  'app/user/FETCH_CURRENT_USER_HAS_LISTINGS_ERROR';

export const FETCH_CURRENT_USER_NOTIFICATIONS_REQUEST =
  'app/user/FETCH_CURRENT_USER_NOTIFICATIONS_REQUEST';
export const FETCH_CURRENT_USER_NOTIFICATIONS_SUCCESS =
  'app/user/FETCH_CURRENT_USER_NOTIFICATIONS_SUCCESS';
export const FETCH_CURRENT_USER_NOTIFICATIONS_ERROR =
  'app/user/FETCH_CURRENT_USER_NOTIFICATIONS_ERROR';

export const FETCH_CURRENT_USER_HAS_ORDERS_REQUEST =
  'app/user/FETCH_CURRENT_USER_HAS_ORDERS_REQUEST';
export const FETCH_CURRENT_USER_HAS_ORDERS_SUCCESS =
  'app/user/FETCH_CURRENT_USER_HAS_ORDERS_SUCCESS';
export const FETCH_CURRENT_USER_HAS_ORDERS_ERROR = 'app/user/FETCH_CURRENT_USER_HAS_ORDERS_ERROR';

export const SEND_VERIFICATION_EMAIL_REQUEST = 'app/user/SEND_VERIFICATION_EMAIL_REQUEST';
export const SEND_VERIFICATION_EMAIL_SUCCESS = 'app/user/SEND_VERIFICATION_EMAIL_SUCCESS';
export const SEND_VERIFICATION_EMAIL_ERROR = 'app/user/SEND_VERIFICATION_EMAIL_ERROR';



export const ADD_FILE_TO_QUEUE = 'app/user/ADD_FILE_TO_QUEUE';
export const PROCESS_QUEUE_START = 'app/user/PROCESS_QUEUE_START';
export const PROCESS_QUEUE_END = 'app/user/PROCESS_QUEUE_END';
export const UPDATE_UPLOAD_QUEUE = 'app/user/UPDATE_UPLOAD_QUEUE';


const CREATE_EPISODE_ASSET_REQUEST = 'app/user/CREATE_EPISODE_ASSET_REQUEST';
const CREATE_EPISODE_ASSET_SUCCESS = 'app/user/CREATE_EPISODE_ASSET_SUCCESS';
const CREATE_EPISODE_ASSET_ERROR = 'app/user/CREATE_EPISODE_ASSET_ERROR';
export const UPDATE_EPISODE_ASSET = 'app/user/UPDATE_EPISODE_ASSET';


const CREATE_FILM_GUMLET_ASSET_REQURST = 'app/user/CREATE_FILM_GUMLET_ASSET_REQURST';
const CREATE_FILM_GUMLET_ASSET_SUCCESS = 'app/user/CREATE_FILM_GUMLET_ASSET_SUCCESS';
const CREATE_FILM_GUMLET_ASSET_ERROR = 'app/user/CREATE_FILM_GUMLET_ASSET_ERROR';

export const UPDATE_FILM_ASSET = 'app/user/UPDATE_FILM_ASSET';

const DELETE_EPISODE_REQUEST = 'app/user/DELETE_EPISODE_REQUEST';
const DELETE_EPISODE_SUCCESS = 'app/user/DELETE_EPISODE_SUCCESS';
const DELETE_EPISODE_ERROR = 'app/user/DELETE_EPISODE_ERROR';

const DELETE_FILM_ASSET_REQUEST = 'app/user/DELETE_FILM_ASSET_REQUEST';
const DELETE_FILM_ASSET_SUCCESS = 'app/user/DELETE_FILM_ASSET_SUCCESS';
const DELETE_FILM_ASSET_ERROR = 'app/user/DELETE_FILM_ASSET_ERROR';

const DELETE_EPISODE_ASSET_REQUEST = 'app/user/DELETE_EPISODE_ASSET_REQUEST';
const DELETE_EPISODE_ASSET_SUCCESS = 'app/user/DELETE_EPISODE_ASSET_SUCCESS';
const DELETE_EPISODE_ASSET_ERROR = 'app/user/DELETE_EPISODE_ASSET_ERROR';

const CLEAR_NOTIFICATION = 'app/user/CLEAR_NOTIFICATION';

const CREATE_MARKETING_ASSET_REQUEST = 'app/user/CREATE_MARKETING_ASSET_REQUEST';
const CREATE_MARKETING_ASSET_SUCCESS = 'app/user/CREATE_MARKETING_ASSET_SUCCESS';
const CREATE_MARKETING_ASSET_ERROR = 'app/user/CREATE_MARKETING_ASSET_ERROR';

export const UPDATE_MARKETING_ASSET = 'app/user/UPDATE_MARKETING_ASSET';

const DELETE_MARKETING_ASSET_REQUEST = 'app/user/DELETE_MARKETING_ASSET_REQUEST';
const DELETE_MARKETING_ASSET_SUCCESS = 'app/user/DELETE_MARKETING_ASSET_SUCCESS';
const DELETE_MARKETING_ASSET_ERROR = 'app/user/DELETE_MARKETING_ASSET_ERROR';

// ================ Reducer ================ //

const mergeCurrentUser = (oldCurrentUser, newCurrentUser) => {
  const { id: oId, type: oType, attributes: oAttr, ...oldRelationships } = oldCurrentUser || {};
  const { id, type, attributes, ...relationships } = newCurrentUser || {};

  // Passing null will remove currentUser entity.
  // Only relationships are merged.
  // TODO figure out if sparse fields handling needs a better handling.
  return newCurrentUser === null
    ? null
    : oldCurrentUser === null
      ? newCurrentUser
      : { id, type, attributes, ...oldRelationships, ...relationships };
};

const initialState = {
  currentUser: null,
  currentUserShowTimestamp: 0,
  currentUserShowError: null,
  currentUserHasListings: false,
  currentUserHasListingsError: null,
  currentUserNotificationCount: 0,
  currentUserNotificationCountError: null,
  currentUserHasOrders: null, // This is not fetched unless unverified emails exist
  currentUserHasOrdersError: null,
  sendVerificationEmailInProgress: false,
  sendVerificationEmailError: null,
  uploadQueue: [],
  isProcessingQueue: false,
  episodeAssets: {},
  episodeAssetsInProgress: {},
  episodeAssetsError: {},
  filmGumletAsset: {},
  filmGumletAssetInProgress: {},
  filmGumletAssetError: {},
  deleteEpisodeInProgress: {},
  deleteEpisodeError: {},
  deletedEpisodeIds: [],
  deleteFilmAssetInProgress: {},
  deleteFilmAssetError: {},
  uploadNotifications: [],
  marketingAssets: {},
  deleteMarketingAssetsInProgress: {},
  deleteMarketingAssetsError: {},
  removedImageKeys: [],
  deletedAssetIds: [],
};

export default function reducer(state = initialState, action = {}) {
  const { type, payload } = action;
  switch (type) {
    case CURRENT_USER_SHOW_REQUEST:
      return { ...state, currentUserShowError: null };
    case CURRENT_USER_SHOW_SUCCESS:
      return {
        ...state,
        currentUser: mergeCurrentUser(state.currentUser, payload),
        currentUserShowTimestamp: payload ? new Date().getTime() : 0,
      };
    case CURRENT_USER_SHOW_ERROR:
      // eslint-disable-next-line no-console
      console.error(payload);
      return { ...state, currentUserShowError: payload };

    case CLEAR_CURRENT_USER:
      return {
        ...state,
        currentUser: null,
        currentUserShowError: null,
        currentUserHasListings: false,
        currentUserHasListingsError: null,
        currentUserNotificationCount: 0,
        currentUserNotificationCountError: null,
      };

    case FETCH_CURRENT_USER_HAS_LISTINGS_REQUEST:
      return { ...state, currentUserHasListingsError: null };
    case FETCH_CURRENT_USER_HAS_LISTINGS_SUCCESS:
      return { ...state, currentUserHasListings: payload.hasListings };
    case FETCH_CURRENT_USER_HAS_LISTINGS_ERROR:
      console.error(payload); // eslint-disable-line
      return { ...state, currentUserHasListingsError: payload };

    case FETCH_CURRENT_USER_NOTIFICATIONS_REQUEST:
      return { ...state, currentUserNotificationCountError: null };
    case FETCH_CURRENT_USER_NOTIFICATIONS_SUCCESS:
      return { ...state, currentUserNotificationCount: payload.transactions.length };
    case FETCH_CURRENT_USER_NOTIFICATIONS_ERROR:
      console.error(payload); // eslint-disable-line
      return { ...state, currentUserNotificationCountError: payload };

    case FETCH_CURRENT_USER_HAS_ORDERS_REQUEST:
      return { ...state, currentUserHasOrdersError: null };
    case FETCH_CURRENT_USER_HAS_ORDERS_SUCCESS:
      return { ...state, currentUserHasOrders: payload.hasOrders };
    case FETCH_CURRENT_USER_HAS_ORDERS_ERROR:
      console.error(payload); // eslint-disable-line
      return { ...state, currentUserHasOrdersError: payload };

    case SEND_VERIFICATION_EMAIL_REQUEST:
      return {
        ...state,
        sendVerificationEmailInProgress: true,
        sendVerificationEmailError: null,
      };
    case SEND_VERIFICATION_EMAIL_SUCCESS:
      return {
        ...state,
        sendVerificationEmailInProgress: false,
      };
    case SEND_VERIFICATION_EMAIL_ERROR:
      return {
        ...state,
        sendVerificationEmailInProgress: false,
        sendVerificationEmailError: payload,
      };

    // Gumlet upload
    case ADD_FILE_TO_QUEUE:
      return {
        ...state,
        uploadQueue: [...state.uploadQueue, action.payload], // Add file to the end of the queue
      };

    case CREATE_EPISODE_ASSET_REQUEST:
      return {
        ...state,
        episodeAssets: {
          ...state.episodeAssets,
          [payload.listingId]: {
            ...(state.episodeAssets[payload.listingId] || {}),
            [payload.episodeId]: {
              ...(state.episodeAssets[payload.listingId]?.[payload.episodeId] || {}),
              [payload.assetName]: { inProgress: payload.inProgress, isQueued: payload.isQueued, progress: payload.progress, error: null }
            }
          }
        }
      };

    case CREATE_EPISODE_ASSET_SUCCESS:
      const { listingTitle, notificationId, ...data } = payload;
      const updatedNotifications = [...state.uploadNotifications];
      if (notificationId) {
        const notification = {
          id: notificationId,
          type: TYPE_UPLOAD_SUCCESS,
          message: `The episode file is uploaded successfully for ${listingTitle}`,
          listingId: payload.listingId,
          assetName: payload.assetName,
        };

        updatedNotifications.push(notification)
      };

      return {
        ...state,
        episodeAssets: {
          ...state.episodeAssets,
          [payload.listingId]: {
            ...(state.episodeAssets[payload.listingId] || {}),
            [payload.episodeId]: {
              ...(state.episodeAssets[payload.listingId]?.[payload.episodeId] || {}),
              [payload.assetName]: { ...data, inProgress: false, isQueued: false }
            }
          }
        },
        uploadNotifications: updatedNotifications
      };

    case CREATE_EPISODE_ASSET_ERROR:
      const notifications = [...state.uploadNotifications];
      if (payload.notificationId) {
        const notification = {
          id: payload.notificationId,
          type: TYPE_UPLOAD_ERROR,
          message: `Failed to upload episode file for ${payload.listingTitle}`,
          listingId: payload.listingId,
          assetName: payload.assetName,
        };

        notifications.push(notification);
      };

      return {
        ...state,
        episodeAssets: {
          ...state.episodeAssets,
          [payload.listingId]: {
            ...(state.episodeAssets[payload.listingId] || {}),
            [payload.episodeId]: {
              ...(state.episodeAssets[payload.listingId]?.[payload.episodeId] || {}),
              [payload.assetName]: { error: payload.error, inProgress: false, isQueued: false }
            }
          }
        },
        uploadNotifications: notifications,
      };

    case UPDATE_EPISODE_ASSET:
      return {
        ...state,
        episodeAssets: {
          ...state.episodeAssets,
          [payload.listingId]: {
            ...(state.episodeAssets[payload.listingId] || {}),
            [payload.episodeId]: {
              ...(state.episodeAssets[payload.listingId]?.[payload.episodeId] || {}),
              ...(payload.added && { added: true }),
              ...(payload.assetName && { [payload.assetName]: { ...payload } })
            }
          }
        },
      };

    case CREATE_FILM_GUMLET_ASSET_REQURST:
      return {
        ...state,
        filmGumletAssetInProgress: {
          ...state.filmGumletAssetInProgress,
          [payload.listingId]: { inProgress: true, progress: payload.progress }
        },
        filmGumletAssetError: {
          ...state.filmGumletAssetError,
          [payload]: null
        },
      };
    case CREATE_FILM_GUMLET_ASSET_SUCCESS:
      return {
        ...state,
        filmGumletAssetInProgress: {
          ...state.filmGumletAssetInProgress,
          [payload.listingId]: null
        },
        filmGumletAsset: {
          ...state.filmGumletAsset,
          [payload.listingId]: { ...payload }
        },
        uploadNotifications: [
          ...state.uploadNotifications,
          {
            id: payload.notificationId,
            type: TYPE_UPLOAD_SUCCESS,
            message: `The file is uploaded successfully for ${payload.listingTitle}`,
            listingId: payload.listingId,
            assetName: payload.assetName
          }
        ]
      };
    case CREATE_FILM_GUMLET_ASSET_ERROR:
      return {
        ...state,
        filmGumletAssetInProgress: {
          ...state.filmGumletAssetInProgress,
          [payload.listingId]: null
        },
        filmGumletAssetError: {
          ...state.filmGumletAssetError,
          [payload.listingId]: payload.error
        },
        uploadNotifications: [
          ...state.uploadNotifications,
          {
            id: payload.notificationId,
            type: TYPE_UPLOAD_ERROR,
            message: `There was an error uploading the file for ${payload.listingTitle}. Please try again.`,
            listingId: payload.listingId,
            assetName: payload.assetName
          }
        ],
      };

    case UPDATE_FILM_ASSET:
      return {
        ...state,
        filmGumletAsset: {
          ...state.filmGumletAsset,
          [payload.listingId]: { ...payload }
        },
      };

    case PROCESS_QUEUE_START:
      return {
        ...state,
        isProcessingQueue: true, // Mark the queue as processing
      };

    case PROCESS_QUEUE_END:
      return {
        ...state,
        isProcessingQueue: false, // Mark the queue as not processing
      };

    case UPDATE_UPLOAD_QUEUE:
      return {
        ...state,
        uploadQueue: action.payload, // Replace the queue with the updated queue
      };

    case DELETE_EPISODE_REQUEST:
      return {
        ...state,
        deleteEpisodeInProgress: {
          ...state.deleteEpisodeInProgress,
          [payload.listingId]: {
            ...(state.deleteEpisodeInProgress[payload.listingId] || {}),
            [payload.episodeId]: true
          }
        },
        deleteEpisodeError: {
          ...state.deleteEpisodeError,
          [payload.listingId]: {
            ...(state.deleteEpisodeError[payload.listingId] || {}),
            [payload.episodeId]: null
          }
        }
      };

    case DELETE_EPISODE_SUCCESS:
      const updateEpisodeAssetsAfterDelete = Object.keys(state.episodeAssets).reduce((result, listingId) => {
        result[listingId] = { ...state.episodeAssets[listingId] };
        if (result[listingId][payload.episodeId]) {
          // Remove the episodeId from the specific listing
          delete result[listingId][payload.episodeId];
        }
        return result;
      }, {});

      return {
        ...state,
        deleteEpisodeInProgress: {
          ...state.deleteEpisodeInProgress,
          [payload.listingId]: {
            ...(state.deleteEpisodeInProgress[payload.listingId] || {}),
            [payload.episodeId]: false
          }
        },
        episodeAssets: updateEpisodeAssetsAfterDelete,
        deletedEpisodeIds: [...state.deletedEpisodeIds, payload.episodeId]
      };

    case DELETE_EPISODE_ERROR:
      return {
        ...state,
        deleteEpisodeInProgress: {
          ...state.deleteEpisodeInProgress,
          [payload.listingId]: {
            ...(state.deleteEpisodeInProgress[payload.listingId] || {}),
            [payload.episodeId]: false
          }
        },
        deleteEpisodeError: {
          ...state.deleteEpisodeError,
          [payload.listingId]: {
            ...(state.deleteEpisodeError[payload.listingId] || {}),
            [payload.episodeId]: payload.error
          }
        }
      };

    case DELETE_FILM_ASSET_REQUEST:
      return {
        ...state,
        deleteFilmAssetInProgress: {
          ...state.deleteFilmAssetInProgress,
          [payload]: true,
        },
        deleteFilmAssetError: {
          ...state.deleteFilmAssetError,
          [payload]: null
        }
      };

    case DELETE_FILM_ASSET_SUCCESS:
      return {
        ...state,
        deleteFilmAssetInProgress: {
          ...state.deleteFilmAssetInProgress,
          [payload.listingId]: false
        },
        filmGumletAsset: {
          ...state.filmGumletAsset,
          [payload.listingId]: null
        },
        deletedAssetIds: [...state.deletedAssetIds, payload.assetId]
      };

    case DELETE_FILM_ASSET_ERROR:
      return {
        ...state,
        deleteFilmAssetInProgress: {
          ...state.deleteFilmAssetInProgress,
          [payload.listingId]: false
        },
        deleteFilmAssetError: {
          ...state.deleteFilmAssetError,
          [payload.listingId]: payload.error
        }
      };

    case CLEAR_NOTIFICATION:
      return {
        ...state,
        uploadNotifications: state.uploadNotifications.filter(notification => notification.id !== payload.notificationId),
      };

    case DELETE_EPISODE_ASSET_REQUEST:
      return {
        ...state,
        episodeAssets: {
          ...state.episodeAssets,
          [payload.listingId]: {
            ...(state.episodeAssets[payload.listingId] || {}),
            [payload.episodeId]: {
              ...(state.episodeAssets[payload.listingId]?.[payload.episodeId] || {}),
              [payload.assetName]: { inProgress: true, error: null }
            }
          }
        }
      };

    case DELETE_EPISODE_ASSET_SUCCESS:
      return {
        ...state,
        episodeAssets: {
          ...state.episodeAssets,
          [payload.listingId]: {
            ...(state.episodeAssets[payload.listingId] || {}),
            [payload.episodeId]: {
              ...(state.episodeAssets[payload.listingId]?.[payload.episodeId] || {}),
              [payload.assetName]: null,
            }
          }
        },
        deletedAssetIds: [...state.deletedAssetIds, payload.assetId]
      };

    case DELETE_EPISODE_ASSET_ERROR:
      return {
        ...state,
        episodeAssets: {
          ...state.episodeAssets,
          [payload.listingId]: {
            ...(state.episodeAssets[payload.listingId] || {}),
            [payload.episodeId]: {
              ...(state.episodeAssets[payload.listingId]?.[payload.episodeId] || {}),
              [payload.assetName]: { inProgress: false, error: payload.error }
            }
          }
        }
      };

    case CREATE_MARKETING_ASSET_REQUEST:
      return {
        ...state,
        marketingAssets: {
          ...state.marketingAssets,
          [payload.listingId]: {
            ...(state.marketingAssets[payload.listingId] || {}),
            [payload.assetName]: { error: null, inProgress: payload.inProgress, isQueued: payload.isQueued, progress: payload.progress }
          }
        }
      };
    case CREATE_MARKETING_ASSET_SUCCESS:
      return {
        ...state,
        marketingAssets: {
          ...state.marketingAssets,
          [payload.listingId]: {
            ...(state.marketingAssets[payload.listingId] || {}),
            [payload.assetName]: { ...payload, inProgress: false, isQueued: false, error: null }
          }
        },
        ...(payload.notificationId ? {
          uploadNotifications: [
            ...state.uploadNotifications,
            {
              id: payload.notificationId,
              type: TYPE_UPLOAD_SUCCESS,
              message: `Successfully uploaded the file for ${payload.listingTitle}.`,
              listingId: payload.listingId,
              assetName: payload.assetName
            }
          ]
        } : {}),
      };
    case CREATE_MARKETING_ASSET_ERROR:
      return {
        ...state,
        marketingAssets: {
          ...state.marketingAssets,
          [payload.listingId]: {
            ...(state.marketingAssets[payload.listingId] || {}),
            [payload.assetName]: { error: payload.error, inProgress: false, isQueued: false }
          }
        },
        ...(payload.notificationId ? {
          uploadNotifications: [
            ...state.uploadNotifications,
            {
              id: payload.notificationId,
              type: TYPE_UPLOAD_ERROR,
              message: `Failed to upload the file for ${payload.listingTitle}.`,
              listingId: payload.listingId,
              assetName: payload.assetName
            }
          ]
        } : {}),
      };

    case UPDATE_MARKETING_ASSET:
      return {
        ...state,
        marketingAssets: {
          ...state.marketingAssets,
          [payload.listingId]: {
            ...(state.marketingAssets[payload.listingId] || {}),
            [payload.assetName]: payload
          }
        }
      };

    case DELETE_MARKETING_ASSET_REQUEST:
      return {
        ...state,
        deleteMarketingAssetsInProgress: {
          ...state.deleteMarketingAssetsInProgress,
          [payload.listingId]: {
            ...(state.deleteMarketingAssetsInProgress[payload.listingId] || {}),
            [payload.assetName]: true
          }
        },
        deleteMarketingAssetsError: {
          ...state.deleteMarketingAssetsError,
          [payload.listingId]: {
            ...(state.deleteMarketingAssetsError[payload.listingId] || {}),
            [payload.assetName]: null
          }
        }
      };

    case DELETE_MARKETING_ASSET_SUCCESS:
      return {
        ...state,
        deleteMarketingAssetsInProgress: {
          ...state.deleteMarketingAssetsInProgress,
          [payload.listingId]: {
            ...(state.deleteMarketingAssetsInProgress[payload.listingId] || {}),
            [payload.assetName]: false
          }
        },
        marketingAssets: {
          ...state.marketingAssets,
          [payload.listingId]: {
            ...(state.marketingAssets[payload.listingId] || {}),
            [payload.assetName]: null
          }
        },
        ...(payload.assetType === GUMLET_ASSET
          ? { deletedAssetIds: [...state.deletedAssetIds, payload.key] }
          : {
            removedImageKeys: [
              ...state.removedImageKeys,
              payload.key
            ]
          })
    };

    case DELETE_MARKETING_ASSET_ERROR:
      return {
        ...state,
        deleteMarketingAssetsInProgress: {
          ...state.deleteMarketingAssetsInProgress,
          [payload.listingId]: {
            ...(state.deleteMarketingAssetsInProgress[payload.listingId] || {}),
            [payload.assetName]: false
          },
        },
        deleteMarketingAssetsError: {
          ...state.deleteMarketingAssetsError,
          [payload.listingId]: {
            ...(state.deleteMarketingAssetsError[payload.listingId] || {}),
            [payload.assetName]: payload.error
          }
        }
      };

    default:
      return state;
  }
}

// ================ Selectors ================ //

export const hasCurrentUserErrors = state => {
  const { user } = state;
  return (
    user.currentUserShowError ||
    user.currentUserHasListingsError ||
    user.currentUserNotificationCountError ||
    user.currentUserHasOrdersError
  );
};

export const verificationSendingInProgress = state => {
  return state.user.sendVerificationEmailInProgress;
};

// ================ Action creators ================ //

export const currentUserShowRequest = () => ({ type: CURRENT_USER_SHOW_REQUEST });

export const currentUserShowSuccess = user => ({
  type: CURRENT_USER_SHOW_SUCCESS,
  payload: user,
});

export const currentUserShowError = e => ({
  type: CURRENT_USER_SHOW_ERROR,
  payload: e,
  error: true,
});

export const clearCurrentUser = () => ({ type: CLEAR_CURRENT_USER });

const fetchCurrentUserHasListingsRequest = () => ({
  type: FETCH_CURRENT_USER_HAS_LISTINGS_REQUEST,
});

export const fetchCurrentUserHasListingsSuccess = hasListings => ({
  type: FETCH_CURRENT_USER_HAS_LISTINGS_SUCCESS,
  payload: { hasListings },
});

const fetchCurrentUserHasListingsError = e => ({
  type: FETCH_CURRENT_USER_HAS_LISTINGS_ERROR,
  error: true,
  payload: e,
});

export const fetchCurrentUserNotificationsRequest = () => ({
  type: FETCH_CURRENT_USER_NOTIFICATIONS_REQUEST,
});

export const fetchCurrentUserNotificationsSuccess = transactions => ({
  type: FETCH_CURRENT_USER_NOTIFICATIONS_SUCCESS,
  payload: { transactions },
});

const fetchCurrentUserNotificationsError = e => ({
  type: FETCH_CURRENT_USER_NOTIFICATIONS_ERROR,
  error: true,
  payload: e,
});

const fetchCurrentUserHasOrdersRequest = () => ({
  type: FETCH_CURRENT_USER_HAS_ORDERS_REQUEST,
});

export const fetchCurrentUserHasOrdersSuccess = hasOrders => ({
  type: FETCH_CURRENT_USER_HAS_ORDERS_SUCCESS,
  payload: { hasOrders },
});

const fetchCurrentUserHasOrdersError = e => ({
  type: FETCH_CURRENT_USER_HAS_ORDERS_ERROR,
  error: true,
  payload: e,
});

export const sendVerificationEmailRequest = () => ({
  type: SEND_VERIFICATION_EMAIL_REQUEST,
});

export const sendVerificationEmailSuccess = () => ({
  type: SEND_VERIFICATION_EMAIL_SUCCESS,
});

export const sendVerificationEmailError = e => ({
  type: SEND_VERIFICATION_EMAIL_ERROR,
  error: true,
  payload: e,
});


// Gumlet actions
export const addFileToQueue = (data) => ({ type: ADD_FILE_TO_QUEUE, payload: data });
export const processQueueStart = () => ({ type: PROCESS_QUEUE_START });
export const processQueueEnd = () => ({ type: PROCESS_QUEUE_END });
export const updateUploadQueue = (data) => ({ type: UPDATE_UPLOAD_QUEUE, payload: data });

const createEpisodeAssetsRequest = (data) => ({ type: CREATE_EPISODE_ASSET_REQUEST, payload: data });
const createEpisodeAssetsSuccess = (data) => ({ type: CREATE_EPISODE_ASSET_SUCCESS, payload: data });
const createEpisodeAssetError = (data) => ({ type: CREATE_EPISODE_ASSET_ERROR, payload: data });

export const updateEpisodeAsset = (data) => ({ type: UPDATE_EPISODE_ASSET, payload: data });

const createFilmGumletAssetRequest = (data) => ({ type: CREATE_FILM_GUMLET_ASSET_REQURST, payload: data });
const createFilmGumletAssetSuccess = (data) => ({ type: CREATE_FILM_GUMLET_ASSET_SUCCESS, payload: data });
const createFilmGumletAssetError = (err) => ({ type: CREATE_FILM_GUMLET_ASSET_ERROR, payload: err });

const deleteEpisodeRequest = (episodeId) => ({ type: DELETE_EPISODE_REQUEST, payload: episodeId });
const deleteEpisodeSuccess = (episodeId) => ({ type: DELETE_EPISODE_SUCCESS, payload: episodeId });
const deleteEpisodeError = (data) => ({ type: DELETE_EPISODE_ERROR, payload: data });


const deleteFilmAssetRequest = (data) => ({ type: DELETE_FILM_ASSET_REQUEST, payload: data });
const deleteFilmAssetSuccess = (data) => ({ type: DELETE_FILM_ASSET_SUCCESS, payload: data });
const deleteFilmAssetError = (data) => ({ type: DELETE_FILM_ASSET_ERROR, payload: data });

const deleteEpisodeAssetRequest = (data) => ({ type: DELETE_EPISODE_ASSET_REQUEST, payload: data });
const deleteEpisodeAssetSuccess = (data) => ({ type: DELETE_EPISODE_ASSET_SUCCESS, payload: data });
const deleteEpisodeAssetError = (data) => ({ type: DELETE_EPISODE_ASSET_ERROR, payload: data });


const createMarketingAssetRequest = (data) => ({ type: CREATE_MARKETING_ASSET_REQUEST, payload: data });
const createMarketingAssetSuccess = (data) => ({ type: CREATE_MARKETING_ASSET_SUCCESS, payload: data });
const createMarketingAssetError = (data) => ({ type: CREATE_MARKETING_ASSET_ERROR, payload: data });


const deleteMarketingAssetRequest = (data) => ({ type: DELETE_MARKETING_ASSET_REQUEST, payload: data });
const deleteMarketingAssetSuccess = (data) => ({ type: DELETE_MARKETING_ASSET_SUCCESS, payload: data });
const deleteMarketingAssetError = (data) => ({ type: DELETE_MARKETING_ASSET_ERROR, payload: data });


// Action to clear a notification by timestamp
export const clearNotification = (notificationId) => ({
  type: CLEAR_NOTIFICATION,
  payload: { notificationId },
});


// ================ Thunks ================ //

export const fetchCurrentUserHasListings = () => (dispatch, getState, sdk) => {
  dispatch(fetchCurrentUserHasListingsRequest());
  const { currentUser } = getState().user;

  if (!currentUser) {
    dispatch(fetchCurrentUserHasListingsSuccess(false));
    return Promise.resolve(null);
  }

  const params = {
    // Since we are only interested in if the user has published
    // listings, we only need at most one result.
    states: 'published',
    page: 1,
    perPage: 1,
  };

  return sdk.ownListings
    .query(params)
    .then(response => {
      const hasListings = response.data.data && response.data.data.length > 0;

      const hasPublishedListings =
        hasListings &&
        ensureOwnListing(response.data.data[0]).attributes.state !== LISTING_STATE_DRAFT;
      dispatch(fetchCurrentUserHasListingsSuccess(!!hasPublishedListings));
    })
    .catch(e => dispatch(fetchCurrentUserHasListingsError(storableError(e))));
};

export const fetchCurrentUserHasOrders = () => (dispatch, getState, sdk) => {
  dispatch(fetchCurrentUserHasOrdersRequest());

  if (!getState().user.currentUser) {
    dispatch(fetchCurrentUserHasOrdersSuccess(false));
    return Promise.resolve(null);
  }

  const params = {
    only: 'order',
    page: 1,
    perPage: 1,
  };

  return sdk.transactions
    .query(params)
    .then(response => {
      const hasOrders = response.data.data && response.data.data.length > 0;
      dispatch(fetchCurrentUserHasOrdersSuccess(!!hasOrders));
    })
    .catch(e => dispatch(fetchCurrentUserHasOrdersError(storableError(e))));
};

// Notificaiton page size is max (100 items on page)
const NOTIFICATION_PAGE_SIZE = 100;

export const fetchCurrentUserNotifications = () => (dispatch, getState, sdk) => {
  const transitionsNeedingAttention = getTransitionsNeedingProviderAttention();
  if (transitionsNeedingAttention.length === 0) {
    // Don't update state, if there's no need to draw user's attention after last transitions.
    return;
  }

  const apiQueryParams = {
    only: 'sale',
    last_transitions: transitionsNeedingAttention,
    page: 1,
    perPage: NOTIFICATION_PAGE_SIZE,
  };

  dispatch(fetchCurrentUserNotificationsRequest());
  sdk.transactions
    .query(apiQueryParams)
    .then(response => {
      const transactions = response.data.data;
      dispatch(fetchCurrentUserNotificationsSuccess(transactions));
    })
    .catch(e => dispatch(fetchCurrentUserNotificationsError(storableError(e))));
};

export const fetchCurrentUser = options => (dispatch, getState, sdk) => {
  const state = getState();
  const { currentUserHasListings, currentUserShowTimestamp } = state.user || {};
  const { isAuthenticated } = state.auth;
  const {
    callParams = null,
    updateHasListings = true,
    updateNotifications = true,
    afterLogin,
    enforce = false, // Automatic emailVerification might be called too fast
  } = options || {};

  // Double fetch might happen when e.g. profile page is making a full page load
  const aSecondAgo = new Date().getTime() - 1000;
  if (!enforce && currentUserShowTimestamp > aSecondAgo) {
    return Promise.resolve({});
  }
  // Set in-progress, no errors
  dispatch(currentUserShowRequest());

  if (!isAuthenticated && !afterLogin) {
    // Make sure current user is null
    dispatch(currentUserShowSuccess(null));
    return Promise.resolve({});
  }

  const parameters = callParams || {
    include: ['effectivePermissionSet', 'profileImage', 'stripeAccount','stripeCustomer.defaultPaymentMethod'],
    'fields.image': [
      'variants.square-small',
      'variants.square-small2x',
      'variants.square-xsmall',
      'variants.square-xsmall2x',
    ],
    'imageVariant.square-xsmall': sdkUtil.objectQueryString({
      w: 40,
      h: 40,
      fit: 'crop',
    }),
    'imageVariant.square-xsmall2x': sdkUtil.objectQueryString({
      w: 80,
      h: 80,
      fit: 'crop',
    }),
  };

  return sdk.currentUser
    .show(parameters)
    .then(response => {
      const entities = denormalisedResponseEntities(response);
      if (entities.length !== 1) {
        throw new Error('Expected a resource in the sdk.currentUser.show response');
      }
      const currentUser = entities[0];

      // Save stripeAccount to store.stripe.stripeAccount if it exists
      if (currentUser.stripeAccount) {
        dispatch(stripeAccountCreateSuccess(currentUser.stripeAccount));
      }

      // set current user id to the logger
      log.setUserId(currentUser.id.uuid);
      dispatch(currentUserShowSuccess(currentUser));
      return currentUser;
    })
    .then(currentUser => {
      // If currentUser is not active (e.g. in 'pending-approval' state),
      // then they don't have listings or transactions that we care about.
      if (isUserAuthorized(currentUser)) {
        if (currentUserHasListings === false && updateHasListings !== false) {
          dispatch(fetchCurrentUserHasListings());
        }

        if (updateNotifications !== false) {
          dispatch(fetchCurrentUserNotifications());
        }

        if (!currentUser.attributes.emailVerified) {
          dispatch(fetchCurrentUserHasOrders());
        }
      }

      // Make sure auth info is up to date
      dispatch(authInfo());
      return currentUser;
    })
    .catch(e => {
      // Make sure auth info is up to date
      dispatch(authInfo());
      log.error(e, 'fetch-current-user-failed');
      dispatch(currentUserShowError(storableError(e)));
    });
};

export const sendVerificationEmail = () => (dispatch, getState, sdk) => {
  if (verificationSendingInProgress(getState())) {
    return Promise.reject(new Error('Verification email sending already in progress'));
  }
  dispatch(sendVerificationEmailRequest());
  return sdk.currentUser
    .sendVerificationEmail()
    .then(() => dispatch(sendVerificationEmailSuccess()))
    .catch(e => dispatch(sendVerificationEmailError(storableError(e))));
};


export const createEpisodeAssets = (params) => (dispatch, getState, sdk) => {
  const { file, episodeId, assetType, assetName, listingId,
    assetTitle, assetCategory, listingTitle, subtitleLanguages = [] } = params;

  if (assetType === WASABI_ASSET) {
    dispatch(createEpisodeAssetsRequest({ listingId, episodeId, assetName, inProgress: true }));
    return uploadImageFileToWasabi({
      file,
      bucketName: process.env.REACT_APP_WASABI_BUCKET,
      folder: process.env.REACT_APP_WASABI_SERIES_FOLDER,
      tags: { assetName, listingId, episodeId, assetCategory: ASSET_CATEGORY_EPISODE }
    })
      .then(({ tags, url, key }) => {
        dispatch(createEpisodeAssetsSuccess({
          listingId, assetName, tags, url,
          status: STATUS_PENDING_APPROVAL, key, episodeId
        }));
        // return { url, tags, status: STATUS_PENDING_APPROVAL, key, episodeId, };
      })
      .catch(err => {
        console.log(err, 'eer');
        dispatch(createEpisodeAssetError({
          listingId, assetName: assetName,
          error: "could not create episode, please try again.", episodeId
        }))
      });
  } else if (assetType === GUMLET_ASSET) {
    dispatch(createEpisodeAssetsRequest({ listingId, episodeId, assetName, isQueued: true, inProgress: false, progress: 0 }));
    dispatch(addFileToQueue({
      file,
      assetName,
      listingId,
      assetTitle,
      assetCategory,
      episodeId,
      listingTitle,
      subtitleLanguages,
      uploadKey: getUploadKey({ listingId, assetCategory, episodeId })
    }));

    // call process queue
    dispatch(processQueue());
  }
};

export const deleteEpisodeAsset = ({ assetName, key, episodeId, listingId, assetType, status }) => async (dispatch, getState, sdk) => {
  // Only delete if the asset is in the processing state
  if ((assetType === GUMLET_ASSET) && GUMLET_PROCESSING_STATUS.includes(status)) {
    // Dispatch the request action first
    dispatch(deleteEpisodeAssetRequest({ assetName, episodeId, listingId }));

    try {
      await deleteGumletAsset(key, listingId);

      // Dispatch success action after successful deletion from the asset provider
      dispatch(deleteEpisodeAssetSuccess({ assetName, episodeId, listingId, assetId: key }));

      // Fetch the current listing details
      const listingResponse = await sdk.ownListings.show({ id: listingId });
      const { data: listing } = listingResponse.data;
      const { publicData } = listing.attributes;
      const { episodes = [] } = publicData;

      // Find the episode to update
      const episodeInd = episodes.findIndex(epi => epi.episodeId === episodeId);
      if (episodeInd !== -1) {
        const updatedEpisodes = [...episodes];
        updatedEpisodes[episodeInd] = {
          ...updatedEpisodes[episodeInd],
          [assetName]: null, // Remove the asset from the episode
        };

        // Update the listing with the modified episodes
        await sdk.ownListings.update({
          id: listingId,
          publicData: {
            episodes: updatedEpisodes,
          },
        });          
      }
    } catch (err) {
      // Dispatch error action if any part of the process fails
      dispatch(deleteEpisodeAssetError({ assetName, error: `Failed to delete episode file`, listingId, episodeId }));
    }
  }else{
    dispatch(deleteEpisodeAssetSuccess({ assetName, episodeId, listingId, assetId: key }));
  }
};


export const createFilmGumletAsset = (params) => (dispatch, getState, sdk) => {
  const { file,
    assetType,
    assetName,
    listingId,
    assetTitle,
    assetCategory,
    listingTitle,
    subtitleLanguages
  } = params;

  dispatch(addFileToQueue({
    file,
    assetName,
    listingId,
    assetTitle,
    assetCategory,
    assetType,
    listingTitle,
    uploadKey: getUploadKey({ listingId, assetCategory }),
    subtitleLanguages
  }));

  // call process queue
  dispatch(processQueue());
};

export const createMarketingAssets = ({ file, assetName, listingId, assetTitle, listingTitle, subtitleLanguages }) => async (dispatch, getState, sdk) => {
  if (file.type.includes('image')) {
    try {
      dispatch(createMarketingAssetRequest({ listingId, assetName, inProgress: true }));
      const { tags, url, key } = await uploadImageFileToWasabi({
        file,
        bucketName: process.env.REACT_APP_WASABI_BUCKET,
        folder: process.env.REACT_APP_WASABI_POSTER_AND_BANNER_FOLDER,
        tags: { assetName, listingId, assetCategory: ASSET_CATEOGRY_MARKETING }
      });

      dispatch(createMarketingAssetSuccess({ listingId, assetName, url, status: STATUS_PENDING_APPROVAL, key, listingTitle, tags }));
    } catch (err) {
      console.log(err, 'eer');
      dispatch(createMarketingAssetError({ listingId, assetName: assetName, error: err }))
    }
  } else {
    dispatch(createMarketingAssetRequest({ listingId, assetName, isQueued: true }));
    dispatch(addFileToQueue({
      file,
      assetName,
      listingId,
      assetTitle,
      assetCategory: ASSET_CATEOGRY_MARKETING,
      listingTitle,
      subtitleLanguages,
      uploadKey: getUploadKey({ listingId, assetCategory: ASSET_CATEOGRY_MARKETING })
    }));

    // call process queue
    dispatch(processQueue());
  }
};


export const deleteMarketingAsset = ({ assetName, key, listingId, assetType }) => (dispatch, getState, sdk) => {
  dispatch(deleteMarketingAssetRequest({ listingId, assetName }));
  if (assetType === WASABI_ASSET) {
    // We can't delete the assets to preserve the previous versions.
    // Code is commented only for now.
    //  First delete from wasabi and then from listing
    // return deleteWasabiFile({ fileKey: key, bucketName: process.env.REACT_APP_WASABI_BUCKET })
    //   .then(res => {
    //     dispatch(deleteMarketingAssetSuccess({ assetName, listingId }))

    //     // Update listing
    //     sdk.ownListings.update({
    //       id: listingId,
    //       publicData: {
    //         [assetName]: null
    //       }
    //     })
    //     .then(response => {
    //       // EditListingPage fetches new listing data, which also needs to be added to global data
    //       dispatch(addMarketplaceEntities(response));
    //       // In case of success, we'll clear state.EditListingPage (user will be redirected away)
    //       dispatch(showListingsSuccess(response));
    //       return response;
    //     })
    //     .catch(err => {
    //       console.log(err, 'error updating listing');
    //       // Let parent catch handle this.
    //       throw new Error('failed to update ownlisting')
    //     })

    //     const { currentUser } = getState().user;
    //     const { publicData: userPublicData } = currentUser.attributes.profile;
    //     const { marketingPosters = [] } = userPublicData;
    //     const filteredPosters = marketingPosters.filter(posterUrl => !posterUrl.includes(key));

    //     // Update in console and algolia
    //     sdk.currentUser.updateProfile({
    //       publicData: {
    //         marketingPosters: filteredPosters
    //       }
    //     })
    //       .catch(err => {
    //         console.log('error updating user profile!');
    //         throw new Error('failed to update user profile')
    //       });

    //     // update in algolia
    //     return updateAlgoliaData({
    //       indexName: process.env.REACT_APP_ALGOLIA_USERS_INDEX,
    //       objectID: currentUser.id.uuid,
    //       marketingPosters: filteredPosters,
    //     })
    //       .catch(err => {
    //         throw new Error('failed to update user profile')
    //       });
    //   })
    //   .catch(err => {
    //     console.log(err, 'err');
    //     dispatch(deleteMarketingAssetError({ listingId, assetName, error: err.message || "failed to delete asset" }))
    //   });

    dispatch(deleteMarketingAssetSuccess({ assetName, listingId, key }));

  } else if (assetType === GUMLET_ASSET) {
    // We can't delete the assets to preserve the previous versions.
    // Code is commented only for now.
    dispatch(deleteMarketingAssetSuccess({ assetName, listingId, key, assetType: GUMLET_ASSET }));
    // First delete from wasabi and then from listing
    // return deleteGumletAsset(key)
    //   .then(() => {
    //     dispatch(deleteMarketingAssetSuccess({ assetName, listingId }))
    //     return sdk.ownListings.update({
    //       id: listingId,
    //       publicData: {
    //         [assetName]: null
    //       }
    //     }).then((res) => res);;
    //   })
    //   .catch(err => dispatch(deleteMarketingAssetError({ listingId, assetName, error: "Failed to delete asset" })))
  }
}


const processQueue = () => async (dispatch, getState, sdk) => {
  const { uploadQueue, isProcessingQueue } = getState().user;

  console.log('step 1=>> upload queue', uploadQueue);

  // Exit if the queue is already being processed or is empty
  if (isProcessingQueue || uploadQueue.length === 0) return;

  // Mark the queue as processing (to prevent duplicate processing)
  dispatch(processQueueStart());

  // Clone the queue to avoid direct mutation
  const currentTask = uploadQueue[0];
  if (!currentTask) {
    dispatch(processQueueEnd());
    return;
  }

  console.log('step 2=>> current task', currentTask);

  const { file, assetName, listingId, assetTitle, assetCategory, episodeId, listingTitle, subtitleLanguages = [] } = currentTask;
  const notificationId = uuidv4();

  // Function to handle the task-specific dispatching after Gumlet upload
  const handleGumletUploadSuccess = (assetCategory, gumletRes, assetName, listingTitle, notificationId, listingId) => {
    const { asset_id, playback_url, status, thumbnail_url, profile_id, duration } = gumletRes;

    switch (assetCategory) {
      case ASSET_CATEGORY_EPISODE:
        dispatch(createEpisodeAssetsSuccess({
          assetName,
          status,
          asset_id,
          episodeId,
          playback_url,
          thumbnail_url,
          profile_id,
          duration,
          listingId,
          listingTitle,
          notificationId
        }));
        break;
      case ASSET_CATEGORY_FILM:
        dispatch(createFilmGumletAssetSuccess({
          ...gumletRes,
          assetName,
          listingTitle,
          notificationId
        }));
        break;
      case ASSET_CATEOGRY_MARKETING:
        dispatch(createMarketingAssetSuccess({
          assetName,
          status,
          asset_id,
          playback_url,
          thumbnail_url,
          profile_id,
          duration,
          listingId,
          notificationId,
          listingTitle
        }));
        break;
      default:
        break;
    }
  };

  // Function to handle upload failure
  const handleUploadError = (error, assetCategory, assetName, listingId, listingTitle, notificationId, episodeId) => {
    switch (assetCategory) {
      case ASSET_CATEGORY_EPISODE:
        dispatch(createEpisodeAssetError({
          listingTitle, notificationId, listingId, assetName, error: error?.message || "Failed to upload episode, please try again.", episodeId
        }));
        break;
      case ASSET_CATEGORY_FILM:
        dispatch(createFilmGumletAssetError({
          notificationId, listingTitle, assetName, listingId, error: error?.message || "Failed to upload film, please try again."
        }));
        break;
      case ASSET_CATEOGRY_MARKETING:
        dispatch(createMarketingAssetError({
          listingId, assetName, error: "Failed to upload marketing asset"
        }));
        break;
      default:
        break;
    }
    console.error(error);
  };

  try {
    // Handle asset upload based on category
    if (assetCategory === ASSET_CATEGORY_EPISODE) {
      dispatch(createEpisodeAssetsRequest({ listingId, episodeId, assetName, isQueued: false, inProgress: true, progress: 0 }));

      const gumletRes = await uploadFileToGumlet({
        file, listingId, assetName, episodeId, assetCategory: ASSET_CATEGORY_EPISODE, assetTitle, subtitleLanguages,
        progressHandler: (percantage) => dispatch(createEpisodeAssetsRequest({ listingId, episodeId, assetName, isQueued: false, inProgress: true, progress: percantage }))
      });

      handleGumletUploadSuccess(assetCategory, gumletRes, assetName, listingTitle, notificationId, listingId);

    } else if (assetCategory === ASSET_CATEGORY_FILM) {
      dispatch(createFilmGumletAssetRequest({ listingId, progress: 0 }));

      const gumletRes = await uploadFileToGumlet({
        file, listingId, assetName, assetCategory: ASSET_CATEGORY_FILM, assetTitle, subtitleLanguages,
        progressHandler: (percantage) => dispatch(createFilmGumletAssetRequest({ listingId, progress: percantage }))
      });

      handleGumletUploadSuccess(assetCategory, gumletRes, assetName, listingTitle, notificationId, listingId);

    } else if (assetCategory === ASSET_CATEOGRY_MARKETING) {
      dispatch(createMarketingAssetRequest({ assetName, listingId, isQueued: false, inProgress: true }));

      const gumletRes = await uploadFileToGumlet({
        file, listingId, assetName, assetCategory: ASSET_CATEOGRY_MARKETING, assetTitle, subtitleLanguages,
        progressHandler: (percantage) => dispatch(createMarketingAssetRequest({ assetName, listingId, inProgress: true, isQueued: false, progress: percantage }))
      });

      handleGumletUploadSuccess(assetCategory, gumletRes, assetName, listingTitle, notificationId, listingId);
    }
  } catch (error) {
    handleUploadError(error, assetCategory, assetName, listingId, listingTitle, notificationId, episodeId);
  }

  // Clear notification after 30 seconds
  setTimeout(() => {
    dispatch(clearNotification(notificationId));
  }, 30000);

  // Update the queue state (shift the first task from the queue)
  const currentUploadQueue = getState().user.uploadQueue;
  const taskQueue = [...currentUploadQueue];
  const remainingQueue = taskQueue.slice(1);

  console.log('step 4=>>>', { taskQueue, remainingQueue });
  dispatch(updateUploadQueue(remainingQueue));

  // Mark the queue as not processing
  dispatch(processQueueEnd());

  // If there are more tasks left, start processing the next one
  if (remainingQueue.length > 0) {
    console.log('running next task!!');
    dispatch(processQueue()); // Start processing the next task in the queue
  }
};



export const deleteFilmAsset = ({ assetId, listingId }) => (dispatch, getState, sdk) => {
  // NOTE: Commented down due to change in requirement.
  // dispatch(deleteFilmAssetRequest(listingId));
  // return deleteGumletAsset(assetId)
  //   .then(() => {
  //     dispatch(deleteFilmAssetSuccess(listingId));
  //     return sdk.ownListings.update({
  //       id: listingId,
  //       publicData: {
  //         filmVideo: null
  //       }
  //     }).then((res) => res);
  //   })
  //   .catch(err => dispatch(deleteFilmAssetError({ listingId, error: "failed to delete film, please try again" })))
  dispatch(deleteFilmAssetSuccess({ listingId, assetId }));
};

export const deleteEpisode = ({ listingId, episodeId, videoAssetId, thumbnailAssetId }) => (dispatch, getState, sdk) => {

  // NOTE: Commented down due to change in requirement. May need in future.
  dispatch(deleteEpisodeRequest({ listingId, episodeId }));

  return sdk.ownListings.show({ id: listingId })
    .then(({ data }) => {
      const { data: listing } = data;
      const { publicData } = listing.attributes;
      const { episodes = [] } = publicData;

      const episode = episodes.find(epi => epi.episodeId === episodeId);
      const updatedEpisodes = episodes.filter(e => e.episodeId !== episodeId);

      return sdk.ownListings.update({
        id: listingId,
        publicData: {
          episodes: updatedEpisodes,
          episodeCount: updatedEpisodes.length
        }
      }, { expand: true })
        .then((response) => {
          const { data: listing } = response.data;
          const { id, attributes, type } = listing;

          const promises = [];

          // Delete video asset from gumlet if it's in the processing state
          const { videoFile } = episode || {};
          if(GUMLET_PROCESSING_STATUS.includes(videoFile?.status)) {
            promises.push(deleteGumletAsset(videoFile?.asset_id, listingId));
          };

          // Update in mongo db;
          const mongoPromise = updateListingToMongo({
            id,
            attributes,
            type,
            listingType: SERIES_PRODUCTS
          });

          promises.push(mongoPromise);

          // Update publicData in Algolia
          if ([LISTING_STATE_PENDING_APPROVAL, LISTING_STATE_PUBLISHED].includes(attributes.state)) {
            // update in algolia
            const algoliaPromise = updateAlgoliaData({
              indexName: process.env.REACT_APP_ALGOLIA_LISTINGS_INDEX,
              objectID: id.uuid,
              publicData: extractStorableData(attributes.publicData, SEARCHABLE_LISTING_ATTRIBUTES),
            });

            promises.push(algoliaPromise);
          };

          return Promise.all(promises)
            .then(() => {
              dispatch(deleteEpisodeSuccess({ listingId, episodeId }));
              return episodeId;
            })
            .catch(err => dispatch(deleteEpisodeError({ listingId, episodeId, error: 'failed to delete episode, please try again.' })));
        })
    })
    .catch(err => dispatch(deleteEpisodeError({ listingId, episodeId, error: 'failed to delete episode, please try again.' })))
};

export const currentUserSelector = state => state.user.currentUser;
export const currentUserIdSelector = state => currentUserSelector(state)?.id?.uuid;
export const currentUserProfileSelector = state => currentUserSelector(state)?.attributes?.profile;
export const currentUserPublicDataSelector = state => currentUserProfileSelector(state)?.publicData;
export const listingPreferencesSelector = state =>
  currentUserPublicDataSelector(state)?.listing_preferences;
export const wishlistSelector = state => currentUserPublicDataSelector(state)?.wishlistData;