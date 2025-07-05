// These helpers are calling this template's own server-side routes
// so, they are not directly calling Marketplace API or Integration API.
// You can find these api endpoints from 'server/api/...' directory

import axios from 'axios';
import appSettings from '../config/settings';
import { types as sdkTypes, transit } from './sdkLoader';
import Decimal from 'decimal.js';

export const apiBaseUrl = marketplaceRootURL => {
  const port = process.env.REACT_APP_DEV_API_SERVER_PORT;
  const useDevApiServer = process.env.NODE_ENV === 'development' && !!port;

  // In development, the dev API server is running in a different port
  if (useDevApiServer) {
    return `http://localhost:${port}`;
  }

  // Otherwise, use the given marketplaceRootURL parameter or the same domain and port as the frontend
  return marketplaceRootURL ? marketplaceRootURL.replace(/\/$/, '') : `${window.location.origin}`;
};

// Application type handlers for JS SDK.
//
// NOTE: keep in sync with `typeHandlers` in `server/api-util/sdk.js`
export const typeHandlers = [
  // Use Decimal type instead of SDK's BigDecimal.
  {
    type: sdkTypes.BigDecimal,
    customType: Decimal,
    writer: v => new sdkTypes.BigDecimal(v.toString()),
    reader: v => new Decimal(v.value),
  },
];

const serialize = data => {
  return transit.write(data, { typeHandlers, verbose: appSettings.sdk.transitVerbose });
};

const deserialize = str => {
  return transit.read(str, { typeHandlers });
};

const methods = {
  POST: 'POST',
  GET: 'GET',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
};

// If server/api returns data from SDK, you should set Content-Type to 'application/transit+json'
const request = (path, options = {}) => {
  const url = `${apiBaseUrl()}${path}`;
  const { credentials, headers, body, ...rest } = options;

  // If headers are not set, we assume that the body should be serialized as transit format.
  const shouldSerializeBody =
    (!headers || headers['Content-Type'] === 'application/transit+json') && body;
  const bodyMaybe = shouldSerializeBody ? { body: serialize(body) } : {};

  const fetchOptions = {
    credentials: credentials || 'include',
    // Since server/api mostly talks to Marketplace API using SDK,
    // we default to 'application/transit+json' as content type (as SDK uses transit).
    headers: headers || { 'Content-Type': 'application/transit+json' },
    ...bodyMaybe,
    ...rest,
  };


  return window.fetch(url, fetchOptions).then(res => {
    const contentTypeHeader = res.headers.get('Content-Type');
    const contentType = contentTypeHeader ? contentTypeHeader.split(';')[0] : null;

    if (res.status >= 400) {
      return res.json().then(data => {
        let e = new Error();
        e = Object.assign(e, data);

        throw e;
      });
    }
    if (contentType === 'application/transit+json') {
      return res.text().then(deserialize);
    } else if (contentType === 'application/json') {
      return res.json();
    }
    return res.text();
  });
};

// Keep the previous parameter order for the post method.
// For now, only POST has own specific function, but you can create more or use request directly.
const post = (path, body, options = {}) => {
  const requestOptions = {
    ...options,
    method: methods.POST,
    body,
  };

  return request(path, requestOptions);
};

// Fetch transaction line items from the local API endpoint.
//
// See `server/api/transaction-line-items.js` to see what data should
// be sent in the body.
export const transactionLineItems = body => {
  return post('/api/transaction-line-items', body);
};

// Initiate a privileged transaction.
//
// With privileged transitions, the transactions need to be created
// from the backend. This endpoint enables sending the order data to
// the local backend, and passing that to the Marketplace API.
//
// See `server/api/initiate-privileged.js` to see what data should be
// sent in the body.
export const initiatePrivileged = body => {
  return post('/api/initiate-privileged', body);
};

// Transition a transaction with a privileged transition.
//
// This is similar to the `initiatePrivileged` above. It will use the
// backend for the transition. The backend endpoint will add the
// payment line items to the transition params.
//
// See `server/api/transition-privileged.js` to see what data should
// be sent in the body.
export const transitionPrivileged = body => {
  return post('/api/transition-privileged', body);
};

// Create user with identity provider (e.g. Facebook or Google)
//
// If loginWithIdp api call fails and user can't authenticate to Marketplace API with idp
// we will show option to create a new user with idp.
// For that user needs to confirm data fetched from the idp.
// After the confirmation, this endpoint is called to create a new user with confirmed data.
//
// See `server/api/auth/createUserWithIdp.js` to see what data should
// be sent in the body.
export const createUserWithIdp = body => {
  return post('/api/auth/create-user-with-idp', body);
};


// WasAbi
export const createWasAbiAssetApi = ({ fileName, bucketName }) => {
  return post('/api/create-wasabi-asset', { fileName, bucketName })
};

export const uploadImageFileToWasabi = ({ file, bucketName, tags, folder }) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('bucketName', bucketName);
  formData.append('folder', folder)

  // Add tags to FormData
  // If tags is an object, you may want to stringify it to send as a single field
  if (typeof tags === 'object') {
    formData.append('tags', JSON.stringify(tags)); // Stringify if tags is an object
  } else {
    formData.append('tags', tags); // Append directly if tags is a string
  }

  const url = `${apiBaseUrl()}/api/upload-image-to-wasabi`;
  const fetchOptions = {
    method: 'POST',
    body: formData,
    // Do NOT set 'Content-Type' header; the browser will set it automatically
  };

  return window.fetch(url, fetchOptions).then(res => {
    if (res.status >= 400) {
      return res.json().then(data => {
        let e = new Error();
        e = Object.assign(e, data);
        throw e;
      });
    }
    return res.json();
  });
};

export const deleteWasabiFile = (data) => {
  return post('/api/delete-file-from-wasabi', data)
}

// Gumlet
export const createGumletAssetApi = (body) => {
  return post('/api/create-gumlet-asset', body)
};

export const deleteGumletAsset = (assetId, listingId) => {
  return post('/api/delete-gumlet-asset', { assetId, listingId }) 
}

export const createGumletImageAsset = (data) => {
  return post('/api/create-gumlet-image-asset', data)
};

// user name validation api
export const userNameValidation = (data) => {
  return post('/api/user-name-validation', data)
};

// Algilia
export const createAlgoliaData = (data) => {
  return post('/api/createAlgoliaData', data)
};

export const updateAlgoliaData = (data) => {
  return post('/api/updateAlgoliaData', data)
};

// integration apis

export const updateAuthorListing = (data) => {
  return post('/api/update-author-listing', data)
};

export const updateListingReviews = (data) => {
  return post('/api/update-listing-reviews', data)
};

export const getUserDetailsApi = (data) => {
  return post('/api/user-details', data)
};

export const updateTransactionMetaData = (data) => {
  return post('/api/update-metadata', data)
};

// update mongo db api

export const createTransactionDB = (data) => {
  return post('/api/update-mongo-db', data)
};

export const getTransactionCollection = (data) => {
  return post('/api/get-mongo-transaction', data)
};


export const getGumletAssetDetailsApi = (data) => {
  return post('/api/gumlet-asset-details', data)
};

export const getFeaturedCreators = () => {
  return post('/api/featured-creators', {})
}

export const getMyCreators = (currentUserId) => {
  return post('/api/my-creators', { userId: currentUserId })
};

export const getUsersByIds = (body) => {
  return post('/api/fetch-users', body)
}

export const createKlaviyoEvent = body => {
  return post('/api/klaviyo/event-create', body);
};

export const isFirstSaleForSeller = body => {
  return post('/api/first-sale', body);
};

export const deleteAlgoliaListing = body => {
  return post('/api/deleteAlgoliaData', body);
};

export const updateAlgoliaEntityViews = body => {
  return post('/api/update-entity-views', body);
};

//send grid notification
export const singleMailApiCollection = body => {
  return post('/api/refund-request-notification', body);
};

export const switchPrivateMode = body => {
  return post('/api/switch-private-mode', body);
};

export const getGumletPartUploadUrl = body => {
  return post('/api/gumlet/multipartupload', body);
};

export const gumletMultipartComplete = body => {
  return post('/api/gumlet/multipartcomplete', body);
};

export const createFilm = body => {
  return post('/api/film', body);
};

export const updateFilm = (body) => {
  return post('/api/update-film', body)
}

export const createSeries = body => {
  return post('/api/series', body);
};

export const updateSeries = (body) => {
  return post('/api/update-series', body)
}

export const getCreatorsWithRecentlyReleasedApi = (body = {}) => {
  return post('/api/creators-with-recently-released', body)
};

export const getLandingPageCarouselData = () => {
  const strapiRoot = process.env.REACT_APP_STRAPI_ROOT_URL;
  return axios.get(`${strapiRoot}/api/landing-section?populate=*`)
}

export const getSeriesHeroData = () => {
  const strapiRoot = process.env.REACT_APP_STRAPI_ROOT_URL;
  return axios.get(`${strapiRoot}/api/series-hero-sections?populate=*`)
}

export const getFilmsHeroData = () => {
  const strapiRoot = process.env.REACT_APP_STRAPI_ROOT_URL;
  return axios.get(`${strapiRoot}/api/film-hero-sections?populate=*`)
}


export const getCreatorsHeroData = () => {
  const strapiRoot = process.env.REACT_APP_STRAPI_ROOT_URL;
  return axios.get(`${strapiRoot}/api/creator-hero-sections?populate=*`)
};
