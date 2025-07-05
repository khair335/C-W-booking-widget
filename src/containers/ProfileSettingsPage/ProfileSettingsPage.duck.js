import { denormalisedResponseEntities, compareExtractUpdatedData, getUserType } from '../../util/data';
import { storableError } from '../../util/errors';
import { currentUserShowSuccess } from '../../ducks/user.duck';
import { createAlgoliaData, getUserDetailsApi, switchPrivateMode, updateAlgoliaData, uploadImageFileToWasabi, userNameValidation } from '../../util/api';
import { util } from '../../util/sdkLoader';
import { ASSET_CATEOGRY_USER_PROFILE, STATUS_PENDING_APPROVAL, USER_TYPE_CREATOR } from '../../constants';
import moment from 'moment';
import { CREATOR_USER_TYPE } from '../../util/types';
// ================ Action types ================ //

export const CLEAR_UPDATED_FORM = 'app/ProfileSettingsPage/CLEAR_UPDATED_FORM';

export const UPLOAD_IMAGE_REQUEST = 'app/ProfileSettingsPage/UPLOAD_IMAGE_REQUEST';
export const UPLOAD_IMAGE_SUCCESS = 'app/ProfileSettingsPage/UPLOAD_IMAGE_SUCCESS';
export const UPLOAD_IMAGE_ERROR = 'app/ProfileSettingsPage/UPLOAD_IMAGE_ERROR';

export const UPDATE_PROFILE_REQUEST = 'app/ProfileSettingsPage/UPDATE_PROFILE_REQUEST';
export const UPDATE_VIEW_PROFILE_REQUEST = 'app/ProfileSettingsPage/UPDATE_VIEW_PROFILE_REQUEST';
export const UPDATE_PROFILE_SUCCESS = 'app/ProfileSettingsPage/UPDATE_PROFILE_SUCCESS';
export const UPDATE_PROFILE_ERROR = 'app/ProfileSettingsPage/UPDATE_PROFILE_ERROR';


export const FETCH_USER_NAME = 'app/ProfileSettingsPage/FETCH_USER_NAME';

export const UPLOAD_BANNER_IMAGE_REQUEST = 'app/ProfileSettingsPage/UPLOAD_BANNER_IMAGE_REQUEST';
export const UPLOAD_BANNER_IMAGE_SUCCESS = 'app/ProfileSettingsPage/UPLOAD_BANNER_IMAGE_SUCCESS';
export const UPLOAD_BANNER_IMAGE_ERROR = 'app/ProfileSettingsPage/UPLOAD_BANNER_IMAGE_ERROR';

export const CREATE_MARKETING_ASSET_REQUEST = 'app/ProfileSettingsPage/CREATE_MARKETING_ASSET_REQUEST';
export const CREATE_MARKETING_ASSET_SUCCESS = 'app/ProfileSettingsPage/CREATE_MARKETING_ASSET_SUCCESS';
export const CREATE_MARKETING_ASSET_ERROR = 'app/ProfileSettingsPage/CREATE_MARKETING_ASSET_ERROR';

export const TOGGLE_PRIVATE_MODE_REQUEST = 'app/ProfileSettingsPage/TOGGLE_PRIVATE_MODE_REQUEST';
export const TOGGLE_PRIVATE_MODE_SUCCESS = 'app/ProfileSettingsPage/TOGGLE_PRIVATE_MODE_SUCCESS';
export const TOGGLE_PRIVATE_MODE_ERROR = 'app/ProfileSettingsPage/TOGGLE_PRIVATE_MODE_ERROR';

// ================ Reducer ================ //

// create image variant from variant name, desired width and aspectRatio
const createImageVariantConfig = (name, width, aspectRatio) => {
  let variantWidth = width;
  let variantHeight = Math.round(width / 2);

  if (variantWidth > 3072 || variantHeight > 3072) {
    if (!isServer) {
      console.error(`Dimensions of custom image variant (${name}) are too high (w:${variantWidth}, h:${variantHeight}).
      Reduce them to max 3072px. https://www.sharetribe.com/api-reference/marketplace.html#custom-image-variants`);
    }

    if (variantHeight > 3072) {
      variantHeight = 3072;
      variantWidth = Math.round(variantHeight / aspectRatio);
    } else if (variantHeight > 3072) {
      variantWidth = 3072;
      variantHeight = Math.round(aspectRatio * variantWidth);
    }
  }

  return {
    [`imageVariant.${name}`]: util.objectQueryString({
      w: variantWidth,
      h: variantHeight,
      fit: 'crop',
    }),
  };
};

const getImageVariantInfo = () => {
  const aspectWidth = 1;
  const aspectHeight = 1;
  const aspectRatio = aspectHeight / aspectWidth;
  const fieldsImage = [`variants.profile-banner-2x`];

  return {
    fieldsImage,
    imageVariants: {
      ...createImageVariantConfig(`profile-banner-2x`, 800, aspectRatio),
    },
  };
};

const initialState = {
  image: null,
  uploadImageError: null,
  uploadInProgress: false,
  updateInProgress: false,
  updateViewInProgress: false,
  updateProfileError: null,
  userNameExist: false,
  bannerImage: null,
  userProfileAssetsInProgress: {},
  userProfileAssetsError: {},
  userProfileAssets: {},
  privateModeInProgress: false,
  privateModeError: null,
};

export default function reducer(state = initialState, action = {}) {
  const { type, payload } = action;
  switch (type) {
    case UPLOAD_IMAGE_REQUEST:
      // payload.params: { id: 'tempId', file }
      return {
        ...state,
        image: { ...payload.params },
        uploadInProgress: true,
        uploadImageError: null,
      };
    case UPLOAD_IMAGE_SUCCESS: {
      // payload: { id: 'tempId', uploadedImage }
      const { id, uploadedImage, imageType } = payload;
      const { file } = state.image || {};
      const image = { id, imageId: uploadedImage.id, file, uploadedImage, imageType };
      return { ...state, image, uploadInProgress: false };
    }

    case UPLOAD_IMAGE_ERROR: {
      // eslint-disable-next-line no-console
      return { ...state, image: null, uploadInProgress: false, uploadImageError: payload.error };
    }

    case UPLOAD_BANNER_IMAGE_REQUEST:
      // payload.params: { id: 'tempId', file }
      return {
        ...state,
        bannerImage: { ...payload.params },
        uploadInProgress: true,
        uploadImageError: null,
      };

    case UPLOAD_BANNER_IMAGE_SUCCESS: {
      const { id, uploadedImage, imageType } = payload;
      const { file } = state.bannerImage || {};
      const bannerImage = { id, imageId: uploadedImage.id, file, uploadedImage, imageType };
      return { ...state, bannerImage, uploadInProgress: false };
    }

    case UPLOAD_BANNER_IMAGE_ERROR: {
      // eslint-disable-next-line no-console
      return { ...state, bannerImage: null, uploadInProgress: false, uploadImageError: payload.error };
    }

    case UPDATE_PROFILE_REQUEST:
      return {
        ...state,
        updateInProgress: true,
        updateProfileError: null,
      };
    case UPDATE_VIEW_PROFILE_REQUEST:
      return {
        ...state,
        updateViewInProgress: true,
        updateProfileError: null,
      };
    case UPDATE_PROFILE_SUCCESS:
      return {
        ...state,
        image: null,
        updateInProgress: false,
        updateViewInProgress: false
      };
    case UPDATE_PROFILE_ERROR:
      return {
        ...state,
        image: null,
        updateInProgress: false,
        updateProfileError: payload,
      };

    case CLEAR_UPDATED_FORM:
      return { ...state, updateProfileError: null, uploadImageError: null };

    case FETCH_USER_NAME:
      return { ...state, userNameExist: payload };

    case CREATE_MARKETING_ASSET_REQUEST:
      return {
        ...state,
        userProfileAssetsInProgress: {
          ...state.userProfileAssetsInProgress,
          [payload]: true,
        },
        userProfileAssetsError: {
          ...state.userProfileAssetsError,
          [payload]: null
        }
      };
    case CREATE_MARKETING_ASSET_SUCCESS:
      return {
        ...state,
        userProfileAssetsInProgress: {
          ...state.userProfileAssetsInProgress,
          [payload.assetName]: false
        },
        userProfileAssets: { ...state.userProfileAssets, [payload.assetName]: { ...payload } }
      };
    case CREATE_MARKETING_ASSET_ERROR:
      return {
        ...state,
        userProfileAssetsInProgress: {
          ...state.userProfileAssetsInProgress,
          [payload.assetName]: false
        },
        userProfileAssetsError: {
          ...state.userProfileAssetsError,
          [payload.assetName]: { error: payload.error }
        }
      };

    case TOGGLE_PRIVATE_MODE_REQUEST:
      return {
        ...state,
        privateModeInProgress: true,
        privateModeError: null,
      };

    case TOGGLE_PRIVATE_MODE_SUCCESS:
      return {
        ...state,
        privateModeInProgress: false,
      };

    case TOGGLE_PRIVATE_MODE_ERROR:
      return {
        ...state,
        privateModeInProgress: false,
        privateModeError: payload,
      }

    default:
      return state;
  }
}

// ================ Selectors ================ //

// ================ Action creators ================ //

export const clearUpdatedForm = () => ({
  type: CLEAR_UPDATED_FORM,
});

// SDK method: images.upload
export const uploadImageRequest = params => ({ type: UPLOAD_IMAGE_REQUEST, payload: { params } });
export const uploadImageSuccess = result => ({ type: UPLOAD_IMAGE_SUCCESS, payload: result.data });
export const uploadImageError = error => ({
  type: UPLOAD_IMAGE_ERROR,
  payload: error,
  error: true,
});

// SDK method: images.upload
export const uploadBannerImageRequest = params => ({ type: UPLOAD_BANNER_IMAGE_REQUEST, payload: { params } });
export const uploadBannerImageSuccess = result => ({ type: UPLOAD_BANNER_IMAGE_SUCCESS, payload: result.data });
export const uploadBannerImageError = error => ({
  type: UPLOAD_BANNER_IMAGE_ERROR,
  payload: error,
  error: true,
});


// SDK method: sdk.currentUser.updateProfile
export const updateProfileRequest = params => ({
  type: UPDATE_PROFILE_REQUEST,
  payload: { params },
});
export const viewUpdateProfileRequest = params => ({
  type: UPDATE_VIEW_PROFILE_REQUEST,
  payload: { params },
});
export const updateProfileSuccess = result => ({
  type: UPDATE_PROFILE_SUCCESS,
  payload: result,
});
export const updateProfileError = error => ({
  type: UPDATE_PROFILE_ERROR,
  payload: error,
  error: true,
});

export const fetchUserNameSuccess = result => ({
  type: FETCH_USER_NAME,
  payload: result,
});


export const createMarketingAssetRequest = (assetId) => ({ type: CREATE_MARKETING_ASSET_REQUEST, payload: assetId });
export const createMarketingAssetSuccess = (data) => ({ type: CREATE_MARKETING_ASSET_SUCCESS, payload: data });
export const createMarketingAssetError = (data) => ({ type: CREATE_MARKETING_ASSET_ERROR, payload: data });


export const togglePrivateModeRequest = () => ({ type: TOGGLE_PRIVATE_MODE_REQUEST });
export const togglePrivateModeSuccess = () => ({ type: TOGGLE_PRIVATE_MODE_SUCCESS});
export const togglePrivateModeError = (data) => ({ type: TOGGLE_PRIVATE_MODE_ERROR, payload: data });

// ================ Thunk ================ //

// Images return imageId which we need to map with previously generated temporary id
export function uploadImage(actionPayload) {
  return (dispatch, getState, sdk) => {
    const id = actionPayload.id;
    dispatch(uploadImageRequest(actionPayload));

    const bodyParams = {
      image: actionPayload.file,
    };
    const queryParams = {
      expand: true,
      'fields.image': ['variants.square-small', 'variants.square-small2x'],
    };

    return sdk.images
      .upload(bodyParams, queryParams)
      .then(resp => {
        const uploadedImage = resp.data.data;
        dispatch(uploadImageSuccess({
          data: {
            id, uploadedImage, imageType: actionPayload.imageType
          }
        }));
      })
      .catch(e => dispatch(uploadImageError({ id, error: storableError(e) })));
  };
}


export function uploadProfileBanner(actionPayload) {
  return (dispatch, getState, sdk) => {
    const id = actionPayload.id;
    dispatch(uploadBannerImageRequest(actionPayload));

    const bodyParams = {
      image: actionPayload.file,
    };
    const imageVariantInfo = getImageVariantInfo();

    const queryParams = {
      expand: true,
      'fields.image': imageVariantInfo.fieldsImage,
      ...imageVariantInfo.imageVariants,
    };

    return sdk.images
      .upload(bodyParams, queryParams)
      .then(resp => {
        const uploadedImage = resp.data.data;
        dispatch(uploadBannerImageSuccess({
          data: {
            id, uploadedImage, imageType: actionPayload.imageType
          }
        }))
      })
      .catch(e => dispatch(uploadBannerImageError({ id, error: storableError(e) })));
  };
}


export const validateUserName = (data) => (dispatch) => {
  try {
    userNameValidation({ ...data }).then((res) => {
      dispatch(fetchUserNameSuccess(res.isUserNameAlreadyExist))
    })
  } catch (error) {

  }
};

export const createProfileAssets = ({ file, assetName, userId }) => (dispatch, getState, sdk) => {
  dispatch(createMarketingAssetRequest(assetName));

  if (file.type.includes('image')) {
    return uploadImageFileToWasabi({
      file,
      bucketName: process.env.REACT_APP_WASABI_BUCKET,
      folder: process.env.REACT_APP_WASABI_USER_PROFILE_IMAGE_BANNER_FOLDER,
      tags: { assetName, userId, assetCategory: ASSET_CATEOGRY_USER_PROFILE }
    })
      .then(({ tags, url, key }) => {
        dispatch(createMarketingAssetSuccess({ assetName, url, status: STATUS_PENDING_APPROVAL, key }));

        return {
          url,
          tags,
          status: STATUS_PENDING_APPROVAL,
          key
        }

      })
      .catch(err => {
        console.log(err, 'eer');
        dispatch(createMarketingAssetError({ assetName: assetName, error: err }))
      });
  };
};

export const updateProfile = (actionPayload, saveAndViewProfile, eventTrigger) => {
  return (dispatch, getState, sdk) => {
    saveAndViewProfile ? dispatch(viewUpdateProfileRequest()) : dispatch(updateProfileRequest());

    const queryParams = {
      expand: true,
      include: ['profileImage'],
      'fields.image': ['variants.square-small', 'variants.square-small2x'],
    };

    const { currentUser } = getState().user;
    const isUpdate = !!currentUser?.attributes?.profile?.publicData?.userName;
    return getUserDetailsApi({ userId: currentUser.id.uuid })
      .then(res => {
        const { totalPublishedFilms, totalPublishedSeries } = res.data;
        const updatedActionPayload = actionPayload && actionPayload.publicData
          ? {
            ...actionPayload,
            publicData: {
              ...actionPayload.publicData,
              totalFilms: totalPublishedFilms,
              totalSeries: totalPublishedSeries
            }
          } : {};

        const userType = getUserType(currentUser);
        const fieldsToCheck =
          userType === CREATOR_USER_TYPE
            ? [
              'firstName',
              'lastName',
              'bio',
              'publicData.userName',
              'publicData.professional_role',
              'publicData.profile_banner',
              'publicData.userProfileImage',
              'publicData.userProfileBanner',
              'publicData.displayName',
              'publicData.custom_role',
              'publicData.facebook_url',
              'publicData.instagram_url',
              'publicData.linkedIn_url',
              'publicData.professional_role',
              'publicData.spotify_url',
              'publicData.tiktok_url',
              'publicData.x_url',
              'publicData.youtube_url'
            ]
            : ['firstName', 'lastName', 'displayName', 'publicData.userProfileImage', 'publicData.displayName'];

        const updatedAttributes = compareExtractUpdatedData(
          currentUser?.attributes?.profile,
          actionPayload,
          fieldsToCheck
        );

        return sdk.currentUser
          .updateProfile(updatedActionPayload, queryParams)
          .then(response => {
            dispatch(updateProfileSuccess({ response, updatedAttributes, isUpdate, eventTrigger }));

            const entities = denormalisedResponseEntities(response);
            if (entities.length !== 1) {
              throw new Error('Expected a resource in the sdk.currentUser.updateProfile response');
            }
            const currentUser = entities[0];

            // Update current user in state.user.currentUser through user.duck.js
            dispatch(currentUserShowSuccess(currentUser));

            // If the current user is creator, save to Algolia
            const userType = getUserType(currentUser);
            if (userType === USER_TYPE_CREATOR) {
              const { id, attributes } = currentUser;
              const { profile, createdAt, banned, deleted, email, emailVerified, stripeConnected } = attributes;
              const { firstName, lastName, abbreviatedName, bio, publicData } = profile;
              const { displayName, privateMode } = publicData || {};

              const objectID = id.uuid;
              const timeStamp = moment(createdAt).unix();
              const indexName = process.env.REACT_APP_ALGOLIA_USERS_INDEX;

              const totalFilms = totalPublishedFilms; //replace with actual value
              const totalSeries = totalPublishedSeries; //replace with actual value
              const { userName, userType, addedInAlgolia, userProfileImage, userProfileBanner, marketingPosters } = publicData;
              const data = {
                indexName,
                objectID,
                timeStamp,
                banned,
                deleted,
                email,
                emailVerified,
                stripeConnected,
                firstName,
                lastName,
                displayName,
                abbreviatedName,
                bio,
                totalFilms,
                totalSeries,
                username: userName,
                userType,
                userProfileImage, userProfileBanner,
                marketingPosters,
                privateMode
              };
              if (addedInAlgolia) {
                updateAlgoliaData(data)
              } else {
                createAlgoliaData(data).then((res) => {
                  if (res) {
                    sdk.currentUser
                      .updateProfile({ publicData: { addedInAlgolia: true } })
                  }
                });
              }
            };
          })
          .catch(e => dispatch(updateProfileError(storableError(e))));
      })
      .catch(e => dispatch(updateProfileError(storableError(e))));
  };
};


export const togglePrivateMode = () => {
  return async (dispatch, getState, sdk) => {
    dispatch(togglePrivateModeRequest());
    try {
      const response = await switchPrivateMode({ userId: getState().user.currentUser.id.uuid });
      dispatch(togglePrivateModeSuccess());
      const entities = denormalisedResponseEntities(response.data);
      if (entities.length !== 1) {
        throw new Error('Expected a resource in the sdk.currentUser.updateProfile response');
      }
      const currentUser = entities[0];

      // Update current user in state.user.currentUser through user.duck.js
      dispatch(currentUserShowSuccess(currentUser));

    } catch (error) {
      // Rollback logic or appropriate error handling
      dispatch(togglePrivateModeError(storableError(error)));
    }
  };
};
