import isArray from 'lodash/isArray';
import reduce from 'lodash/reduce';
import { sanitizeEntity } from './sanitize';
import { isEqual, pick, truncate } from 'lodash';
import { CODE_PROCESSING_FILM, CODE_PROCESSING_MARKETING, CODE_PROCESSING_SERIES, CODE_UPLOADING, EPISODE_FIELD_DESCRIPTION, EPISODE_FIELD_SEQUENCE_NUMBER, EPISODE_FIELD_TITLE, GUMLET_PROCESSING_STATUS, LISTING_TYPE_FILMS, LISTING_TYPE_SERIES, STATUS_APPROVED, STATUS_PENDING_APPROVAL, STATUS_UPLOAD_READY } from '../constants';
import { matchPathname } from './routes';
import { CREATOR_USER_TYPE, FILM_PRODUCTS, SERIES_PRODUCTS } from './types';
import { createFilm, createSeries, updateFilm, updateSeries } from './api';
// NOTE: This file imports sanitize.js, which may lead to circular dependency

/**
 * Combine the given relationships objects
 *
 * See: http://jsonapi.org/format/#document-resource-object-relationships
 */
export const combinedRelationships = (oldRels, newRels) => {
  if (!oldRels && !newRels) {
    // Special case to avoid adding an empty relationships object when
    // none of the resource objects had any relationships.
    return null;
  }
  return { ...oldRels, ...newRels };
};

/**
 * Combine the given resource objects
 *
 * See: http://jsonapi.org/format/#document-resource-objects
 */
export const combinedResourceObjects = (oldRes, newRes) => {
  const { id, type } = oldRes;
  if (newRes.id.uuid !== id.uuid || newRes.type !== type) {
    throw new Error('Cannot merge resource objects with different ids or types');
  }
  const attributes = newRes.attributes || oldRes.attributes;
  const attributesOld = oldRes.attributes || {};
  const attributesNew = newRes.attributes || {};
  // Allow (potentially) sparse attributes to update only relevant fields
  const attrs = attributes ? { attributes: { ...attributesOld, ...attributesNew } } : null;
  const relationships = combinedRelationships(oldRes.relationships, newRes.relationships);
  const rels = relationships ? { relationships } : null;
  return { id, type, ...attrs, ...rels };
};

/**
 * Combine the resource objects form the given api response to the
 * existing entities.
 */
export const updatedEntities = (oldEntities, apiResponse, sanitizeConfig = {}) => {
  const { data, included = [] } = apiResponse;
  const objects = (Array.isArray(data) ? data : [data]).concat(included);

  const newEntities = objects.reduce((entities, curr) => {
    const { id, type } = curr;

    // Some entities (e.g. listing and user) might include extended data,
    // you should check if src/util/sanitize.js needs to be updated.
    const current = sanitizeEntity(curr, sanitizeConfig);

    entities[type] = entities[type] || {};
    const entity = entities[type][id.uuid];
    entities[type][id.uuid] = entity ? combinedResourceObjects({ ...entity }, current) : current;

    return entities;
  }, oldEntities);

  return newEntities;
};

/**
 * Denormalise the entities with the resources from the entities object
 *
 * This function calculates the dernormalised tree structure from the
 * normalised entities object with all the relationships joined in.
 *
 * @param {Object} entities entities object in the SDK Redux store
 * @param {Array<{ id, type }} resources array of objects
 * with id and type
 * @param {Boolean} throwIfNotFound wheather to skip a resource that
 * is not found (false), or to throw an Error (true)
 *
 * @return {Array} the given resource objects denormalised that were
 * found in the entities
 */
export const denormalisedEntities = (entities, resources, throwIfNotFound = true) => {
  const denormalised = resources.map(res => {
    const { id, type } = res;
    const entityFound = entities[type] && id && entities[type][id.uuid];
    if (!entityFound) {
      if (throwIfNotFound) {
        throw new Error(`Entity with type "${type}" and id "${id ? id.uuid : id}" not found`);
      }
      return null;
    }
    const entity = entities[type][id.uuid];
    const { relationships, ...entityData } = entity;

    if (relationships) {
      // Recursively join in all the relationship entities
      return reduce(
        relationships,
        (ent, relRef, relName) => {
          // A relationship reference can be either a single object or
          // an array of objects. We want to keep that form in the final
          // result.
          const hasMultipleRefs = Array.isArray(relRef.data);
          const multipleRefsEmpty = hasMultipleRefs && relRef.data.length === 0;
          if (!relRef.data || multipleRefsEmpty) {
            ent[relName] = hasMultipleRefs ? [] : null;
          } else {
            const refs = hasMultipleRefs ? relRef.data : [relRef.data];

            // If a relationship is not found, an Error should be thrown
            const rels = denormalisedEntities(entities, refs, true);

            ent[relName] = hasMultipleRefs ? rels : rels[0];
          }
          return ent;
        },
        entityData
      );
    }
    return entityData;
  });
  return denormalised.filter(e => !!e);
};

/**
 * Denormalise the data from the given SDK response
 *
 * @param {Object} sdkResponse response object from an SDK call
 *
 * @return {Array} entities in the response with relationships
 * denormalised from the included data
 */
export const denormalisedResponseEntities = sdkResponse => {
  const apiResponse = sdkResponse.data;
  const data = apiResponse.data;
  const resources = Array.isArray(data) ? data : [data];

  if (!data || resources.length === 0) {
    return [];
  }

  const entities = updatedEntities({}, apiResponse);
  return denormalisedEntities(entities, resources);
};

/**
 * Denormalize JSON object.
 * NOTE: Currently, this only handles denormalization of image references
 *
 * @param {JSON} data from Asset API (e.g. page asset)
 * @param {JSON} included array of asset references (currently only images supported)
 * @returns deep copy of data with images denormalized into it.
 */
const denormalizeJsonData = (data, included) => {
  let copy;

  // Handle strings, numbers, booleans, null
  if (data === null || typeof data !== 'object') {
    return data;
  }

  // At this point the data has typeof 'object' (aka Array or Object)
  // Array is the more specific case (of Object)
  if (data instanceof Array) {
    copy = data.map(datum => denormalizeJsonData(datum, included));
    return copy;
  }

  // Generic Objects
  if (data instanceof Object) {
    copy = {};
    Object.entries(data).forEach(([key, value]) => {
      // Handle denormalization of image reference
      const hasImageRefAsValue =
        typeof value == 'object' && value?._ref?.type === 'imageAsset' && value?._ref?.id;
      // If there is no image included,
      // the _ref might contain parameters for image resolver (Asset Delivery API resolves image URLs on the fly)
      const hasUnresolvedImageRef = typeof value == 'object' && value?._ref?.resolver === 'image';

      if (hasImageRefAsValue) {
        const foundRef = included.find(inc => inc.id === value._ref?.id);
        copy[key] = foundRef;
      } else if (hasUnresolvedImageRef) {
        // Don't add faulty image ref
        // Note: At the time of writing, assets can expose resolver configs,
        //       which we don't want to deal with.
      } else {
        copy[key] = denormalizeJsonData(value, included);
      }
    });
    return copy;
  }

  throw new Error("Unable to traverse data! It's not JSON.");
};

/**
 * Denormalize asset json from Asset API.
 * @param {JSON} assetJson in format: { data, included }
 * @returns deep copy of asset data with images denormalized into it.
 */
export const denormalizeAssetData = assetJson => {
  const { data, included } = assetJson || {};
  return denormalizeJsonData(data, included);
};

/**
 * Create shell objects to ensure that attributes etc. exists.
 *
 * @param {Object} transaction entity object, which is to be ensured against null values
 */
export const ensureTransaction = (transaction, booking = null, listing = null, provider = null) => {
  const empty = {
    id: null,
    type: 'transaction',
    attributes: {},
    booking,
    listing,
    provider,
  };
  return { ...empty, ...transaction };
};

/**
 * Create shell objects to ensure that attributes etc. exists.
 *
 * @param {Object} booking entity object, which is to be ensured against null values
 */
export const ensureBooking = booking => {
  const empty = { id: null, type: 'booking', attributes: {} };
  return { ...empty, ...booking };
};

/**
 * Create shell objects to ensure that attributes etc. exists.
 *
 * @param {Object} listing entity object, which is to be ensured against null values
 */
export const ensureListing = listing => {
  const empty = {
    id: null,
    type: 'listing',
    attributes: { publicData: {} },
    images: [],
  };
  return { ...empty, ...listing };
};

/**
 * Create shell objects to ensure that attributes etc. exists.
 *
 * @param {Object} listing entity object, which is to be ensured against null values
 */
export const ensureOwnListing = listing => {
  const empty = {
    id: null,
    type: 'ownListing',
    attributes: { publicData: {} },
    images: [],
  };
  return { ...empty, ...listing };
};

/**
 * Create shell objects to ensure that attributes etc. exists.
 *
 * @param {Object} user entity object, which is to be ensured against null values
 */
export const ensureUser = user => {
  const empty = { id: null, type: 'user', attributes: { profile: {} } };
  return { ...empty, ...user };
};

/**
 * Create shell objects to ensure that attributes etc. exists.
 *
 * @param {Object} current user entity object, which is to be ensured against null values
 */
export const ensureCurrentUser = user => {
  const empty = { id: null, type: 'currentUser', attributes: { profile: {} }, profileImage: {} };
  return { ...empty, ...user };
};

/**
 * Create shell objects to ensure that attributes etc. exists.
 *
 * @param {Object} time slot entity object, which is to be ensured against null values
 */
export const ensureTimeSlot = timeSlot => {
  const empty = { id: null, type: 'timeSlot', attributes: {} };
  return { ...empty, ...timeSlot };
};

/**
 * Create shell objects to ensure that attributes etc. exists.
 *
 * @param {Object} availability exception entity object, which is to be ensured against null values
 */
export const ensureDayAvailabilityPlan = availabilityPlan => {
  const empty = { type: 'availability-plan/day', entries: [] };
  return { ...empty, ...availabilityPlan };
};

/**
 * Create shell objects to ensure that attributes etc. exists.
 *
 * @param {Object} availability exception entity object, which is to be ensured against null values
 */
export const ensureAvailabilityException = availabilityException => {
  const empty = { id: null, type: 'availabilityException', attributes: {} };
  return { ...empty, ...availabilityException };
};

/**
 * Create shell objects to ensure that attributes etc. exists.
 *
 * @param {Object} stripeCustomer entity from API, which is to be ensured against null values
 */
export const ensureStripeCustomer = stripeCustomer => {
  const empty = { id: null, type: 'stripeCustomer', attributes: {} };
  return { ...empty, ...stripeCustomer };
};

/**
 * Create shell objects to ensure that attributes etc. exists.
 *
 * @param {Object} stripeCustomer entity from API, which is to be ensured against null values
 */
export const ensurePaymentMethodCard = stripePaymentMethod => {
  const empty = {
    id: null,
    type: 'stripePaymentMethod',
    attributes: { type: 'stripe-payment-method/card', card: {} },
  };
  const cardPaymentMethod = { ...empty, ...stripePaymentMethod };

  if (cardPaymentMethod.attributes.type !== 'stripe-payment-method/card') {
    throw new Error(`'ensurePaymentMethodCard' got payment method with wrong type.
      'stripe-payment-method/card' was expected, received ${cardPaymentMethod.attributes.type}`);
  }

  return cardPaymentMethod;
};

/**
 * Get the display name of the given user as string. This function handles
 * missing data (e.g. when the user object is still being downloaded),
 * fully loaded users, as well as banned users.
 *
 * For banned or deleted users, a translated name should be provided.
 *
 * @param {propTypes.user} user
 * @param {String} defaultUserDisplayName
 *
 * @return {String} display name that can be rendered in the UI
 */
export const userDisplayNameAsString = (user, defaultUserDisplayName) => {
  const hasDisplayName = user?.attributes?.profile?.publicData?.displayName || user?.attributes?.profile?.displayName;

  if (hasDisplayName) {
    return hasDisplayName;
  } else {
    return defaultUserDisplayName || '';
  }
};

/**
 * DEPRECATED: Use userDisplayNameAsString function or UserDisplayName component instead
 *
 * @param {propTypes.user} user
 * @param {String} bannedUserDisplayName
 *
 * @return {String} display name that can be rendered in the UI
 */
export const userDisplayName = (user, bannedUserDisplayName) => {
  console.warn(
    `Function userDisplayName is deprecated!
User function userDisplayNameAsString or component UserDisplayName instead.`
  );

  return userDisplayNameAsString(user, bannedUserDisplayName);
};

/**
 * Get the abbreviated name of the given user. This function handles
 * missing data (e.g. when the user object is still being downloaded),
 * fully loaded users, as well as banned users.
 *
 * For banned  or deleted users, a default abbreviated name should be provided.
 *
 * @param {propTypes.user} user
 * @param {String} defaultUserAbbreviatedName
 *
 * @return {String} abbreviated name that can be rendered in the UI
 * (e.g. in Avatar initials)
 */
export const userAbbreviatedName = (user, defaultUserAbbreviatedName) => {
  const hasAttributes = user && user.attributes;
  const hasProfile = hasAttributes && user.attributes.profile;
  const hasDisplayName = hasProfile && user.attributes.profile.abbreviatedName;

  if (hasDisplayName) {
    return user.attributes.profile.abbreviatedName;
  } else {
    return defaultUserAbbreviatedName || '';
  }
};

/**
 * A customizer function to be used with the
 * mergeWith function from lodash.
 *
 * Works like merge in every way exept that on case of
 * an array the old value is completely overridden with
 * the new value.
 *
 * @param {Object} objValue Value of current field, denoted by key
 * @param {Object} srcValue New value
 * @param {String} key Key of the field currently being merged
 * @param {Object} object Target object that is receiving values from source
 * @param {Object} source Source object that is merged into object param
 * @param {Object} stack Tracks merged values
 *
 * @return {Object} New value for objValue if the original is an array,
 * otherwise undefined is returned, which results in mergeWith using the
 * standard merging function
 */
export const overrideArrays = (objValue, srcValue, key, object, source, stack) => {
  if (isArray(objValue)) {
    return srcValue;
  }
};

/**
 * Humanizes a line item code. Strips the "line-item/" namespace
 * definition from the beginnign, replaces dashes with spaces and
 * capitalizes the first character.
 *
 * @param {string} code a line item code
 *
 * @return {string} returns the line item code humanized
 */
export const humanizeLineItemCode = code => {
  if (!/^line-item\/.+/.test(code)) {
    throw new Error(`Invalid line item code: ${code}`);
  }
  const lowercase = code.replace(/^line-item\//, '').replace(/-/g, ' ');

  return lowercase.charAt(0).toUpperCase() + lowercase.slice(1);
};


export const extractStorableData = (data, includeArr) => {
  const { listingType, filmVideo } = data;
  const { duration: filmDuration } = filmVideo || {};
  return listingType === LISTING_TYPE_FILMS
    ? { ...pick(data, includeArr), filmDuration }
    : pick(data, includeArr);
};

export function normalizeText(text) {
  return text
    .replace(/[_-]+/g, ' ')               // Replace underscores or hyphens with spaces
    .replace(/\s+/g, ' ')                 // Ensure single spaces in case of multiple separators
    .replace(/\b\w/g, char => char.toUpperCase()); // Capitalize each word
}

export function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  let result = [];

  if (hours > 0) {
    result.push(`${hours} hr${hours > 1 ? 's' : ''}`);
  }

  if (minutes > 0) {
    result.push(`${minutes} min${minutes > 1 ? 's' : ''}`);
  }

  if (remainingSeconds > 0) {
    result.push(`${remainingSeconds} sec${remainingSeconds > 1 ? 's' : ''}`);
  }

  return result.join(' ');
};


export const generatePagination = (currentPage, totalPages) => {
  // If the total number of pages is 7 or less, display all pages.
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i);
  }

  // If the current page is among the last 3 pages, show the first 2,
  // an ellipsis, and the last 4 pages.
  if (currentPage >= totalPages - 4) {
    return [0, 1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1];
  }

  // For pages in the middle, show the first page, an ellipsis,
  // the current page and its neighbors, another ellipsis, and the last page.
  return [
    0,
    '...',
    currentPage - 1,
    currentPage,
    currentPage + 1,
    '...',
    totalPages - 1,
  ];
};


export const getUserType = (currentUser) => {
  return currentUser?.attributes?.profile?.publicData?.userType
};

export function useQuery(search) {
  return new URLSearchParams(search);
}

export const delay = (milliseconds) => new Promise(resolve => setTimeout(resolve, milliseconds));

const isPrimary = o => o.group === 'primary';
const isSecondary = o => o.group === 'secondary';
const compareGroups = (a, b) => {
  const isAHigherGroupThanB = isPrimary(a) && isSecondary(b);
  const isALesserGroupThanB = isSecondary(a) && isPrimary(b);
  // Note: sort order is stable in JS
  return isAHigherGroupThanB ? -1 : isALesserGroupThanB ? 1 : 0;
};

// Returns links in order where primary links are returned first
export const sortCustomLinks = customLinks => {
  const links = Array.isArray(customLinks) ? customLinks : [];
  return links.sort(compareGroups);
};

// Resolves in-app links against route configuration
export const getResolvedCustomLinks = (customLinks, routeConfiguration) => {
  const links = Array.isArray(customLinks) ? customLinks : [];
  return links.map(linkConfig => {
    const { type, href } = linkConfig;
    const isInternalLink = type === 'internal' || href.charAt(0) === '/';
    if (isInternalLink) {
      // Internal link
      const testURL = new URL('http://my.marketplace.com' + href);
      const matchedRoutes = matchPathname(testURL.pathname, routeConfiguration);
      if (matchedRoutes.length > 0) {
        const found = matchedRoutes[0];
        const to = { search: testURL.search, hash: testURL.hash };
        return {
          ...linkConfig,
          route: {
            name: found.route?.name,
            params: found.params,
            to,
          },
        };
      }
    }
    return linkConfig;
  });
};

/**
 * Each file is assigned a unique key based on listing id and asset category while uploading,
 * This unique key helps to extract the file state from uploads.
 * @param {*} param0 
 * @returns 
 */
export const getUploadKey = ({ listingId, assetCategory, episodeId }) => {
  const uploadKey = `${listingId}-${assetCategory}${episodeId ? `-${episodeId}` : ''}`; // Include `episodeId` only if it exists
  return uploadKey;
};

export const mergeEpisodesWithAssets = ({
  episodes = [], listingEpisodeAssets = {}, fieldTextInputValues = [], deletedEpisodeIds = [], deletedAssetIds = []
}) => {
  // Create a map for fieldTextInputValues for quick lookup
  const fieldTextInputMap = fieldTextInputValues.reduce((map, { episodeId, sequenceNumber, description, title, editingField }) => {
    map[episodeId] = { sequenceNumber, description, title, editingField };
    return map;
  }, {});

  // Create a set of episodeIds for quick lookup
  const episodeIds = new Set(episodes.map(episode => episode.episodeId));

  // Merge episodes with matching uploads and include any unmatched uploads
  const mergedArray = [];

  // First loop: Merge episodes and listingEpisodeAssets
  episodes.forEach((episode) => {
    const { episodeId } = episode;
    const episodeAss = listingEpisodeAssets[episodeId];
    const { sequenceNumber, description, title, editingField } = fieldTextInputMap[episodeId] || {};

    const mergedEpisode = {
      ...episode,
      ...(episodeAss || {}),
      ...((editingField === EPISODE_FIELD_SEQUENCE_NUMBER) || sequenceNumber ? { sequenceNumber } : {}),
      ...((editingField === EPISODE_FIELD_DESCRIPTION) || description ? { description } : {}),
      ...((editingField === EPISODE_FIELD_TITLE) || title ? { title } : {}),
    };

    mergedArray.push(mergedEpisode);
  });

  // Second loop: Add uploads without matching episodes
  Object.keys(listingEpisodeAssets).forEach((episodeId) => {
    if (!episodeIds.has(episodeId)) {
      const upload = listingEpisodeAssets[episodeId];
      const { sequenceNumber, description, title } = fieldTextInputMap[episodeId] || {};

      mergedArray.push({
        episodeId,
        ...upload,
        ...(sequenceNumber ? { sequenceNumber } : {}),
        ...(description ? { description } : {}),
        ...(title ? { title } : {}),
      });
    }
  });

  // Third loop: Add unmatched field text input values (if any)
  fieldTextInputValues.forEach(({ episodeId, sequenceNumber, description, title }) => {
    if (!episodeIds.has(episodeId) && !mergedArray.some(ep => ep.episodeId === episodeId)) {
      mergedArray.push({
        episodeId,
        sequenceNumber,
        description,
        title,
      });
    }
  });

  // filter out the deleted episodes
  let filteredMergedArr = mergedArray.filter(item => !deletedEpisodeIds.includes(item.episodeId));

  // Removed the deleted assets
  filteredMergedArr = filteredMergedArr.map(item => {
    const { videoFile } = item;
    const { asset_id } = videoFile || {};

    if (deletedAssetIds.includes(asset_id)) {
      return { ...item, videoFile: null };
    }
    return item;
  });
  return filteredMergedArr;
};


export const preparePreferenceConfig = (
  userPreferenceConfig = {},
  listingType = "",
  primary_genre = [],
  isAdding = true
) => {
  if (listingType === CREATOR_USER_TYPE) {
    return null;
  }

  // Initialize preference payload with existing data
  const preferencePayload = {
    ...userPreferenceConfig,
    [listingType]: {
      ...(userPreferenceConfig?.[listingType] ?? {}),
    },
  };

  // Update genre counts
  primary_genre.forEach((genre) => {
    const prevGenreCount = preferencePayload[listingType][genre] || 0;
    preferencePayload[listingType][genre] = isAdding
      ? prevGenreCount + 1
      : Math.max(prevGenreCount - 1, 0); // Ensure the count doesn't go below 0

    if (!preferencePayload[listingType][genre]) {
      delete preferencePayload[listingType][genre]
    }
  });

  // Return the final payload structure
  return {
    publicData: {
      listing_preferences: preferencePayload,
    },
  };
};


export function getLanguageCodes(languages) {
  const languageMap = {
    'english': 'en',
    'spanish': 'es',
    'mandarin': 'zh',
    'arabic': 'ar',
    'german': 'de',
    'korean': 'ko',
    'portuguese': 'pt',
    'hindi': 'hi',
    'japanese': 'ja',
    'french': 'fr'
  };

  // Normalize input to lowercase for case-insensitive comparison
  return languages.map(language => {
    const normalizedLanguage = language.toLowerCase();
    return languageMap[normalizedLanguage] || normalizedLanguage;
  });
}

export function compareExtractUpdatedData(oldData, updatedData, fieldsToCheck = []) {
  function compareObjects(oldObj, newObj, allowedFields) {
    const changes = {};

    for (const key in newObj) {
      if (newObj.hasOwnProperty(key)) {
        const fullPath = allowedFields.find(field => field.startsWith(key));

        if (fullPath) {
          const remainingPath = fullPath.slice(key.length + 1);

          if (
            typeof newObj[key] === "object" &&
            !Array.isArray(newObj[key]) &&
            remainingPath
          ) {
            // Recursively compare nested objects for matching field paths
            const nestedChanges = compareObjects(
              oldObj[key] || {},
              newObj[key],
              allowedFields.map(field =>
                field.startsWith(key + ".") ? field.slice(key.length + 1) : null
              ).filter(Boolean)
            );

            if (Object.keys(nestedChanges).length > 0) {
              changes[key] = nestedChanges;
            }
          } else if (allowedFields.includes(key) || remainingPath === "") {
            // Include the key if it's directly allowed or matches a complete path
            // using isEqual because the obj[key] can be an object as we are providing the fields to check. Using isEqual we ensure that we get the data which has undergone some change
            if (!isEqual(newObj[key], oldObj[key])) {
              changes[key] = newObj[key];
            }
          }
        }
      }
    }

    return changes;
  }

  return compareObjects(oldData, updatedData, fieldsToCheck);
}


export const refineQueryParams = (queryParams, validQueryParams) => {
  // Filter queryParams to include only keys from validQueryParams
  return Object.keys(queryParams)
    .filter((key) => validQueryParams.includes(key))
    .reduce((refinedParams, key) => {
      refinedParams[key] = queryParams[key];
      return refinedParams;
    }, {});
};

export const createRefinementList = (queryParams, validQueryParams) => {
  // Filter and transform query parameters
  return Object.keys(queryParams)
    .filter((key) => validQueryParams.includes(key)) // Keep only valid keys
    .reduce((refinementList, key) => {
      const values = [...new Set( // Use Set to remove duplicates
        queryParams[key]
          .split(",") // Split comma-separated values
          .map((value) => value.trim()) // Remove extra whitespace
          .filter(Boolean) // Remove empty strings
      )];
      if (values.length > 0) { // Only add if values array is not empty
        refinementList[key] = values;
      }
      return refinementList;
    }, {});
};


export function ensureHttps(url) {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
  }
  return url;
}

const languageMap = {
  'english': 'en',
  'spanish': 'es',
  'mandarin': 'zh',
  'arabic': 'ar',
  'german': 'de',
  'korean': 'ko',
  'portuguese': 'pt',
  'hindi': 'hi',
  'japanese': 'ja',
  'french': 'fr'
};


export function getSubtitleLanguage(filename) {
  // Map of language codes to their corresponding names
  const languageMap = {
      en: "English",
      pt: "Portuguese",
      ko: "Korean",
      hi: "Hindi",
      ja: "Japanese",
      ar: "Arabic",
      zh: "Mandarin",
      fr: "French",
      es: "Spanish",
      de: "German",
  };

  // Extract the language code from the filename (code is before ".vtt")
  const regex = /_([a-z]{2})\.vtt$/;
  const match = filename.match(regex);
 
  if (!match) {
      return null; // Return if filename format is incorrect
  }

  const languageCode = match[1]; // Extracted language code
  return languageMap[languageCode] || languageCode;
}

export const transformImage = (url, width) => {
  if (!width) {
    return url;
  }
  const urlObj = new URL(url);
  const queryParams = `w=${width}&dpr=1&ar=1%3A1&mode=crop&crop=smart`;
  const params = new URLSearchParams(queryParams);

  // Append each query parameter
  for (const [key, value] of params.entries()) {
      urlObj.searchParams.set(key, value);
  }

  return urlObj.toString();
}

export const removeTags = (str) => {
  if (!str) {
    return '';
  }
  // Replace full-width ＜＞ with standard <>
  const normalizedStr = str.replace(/＜/g, '<').replace(/＞/g, '>');
  
  // Add a space after tags close
  const spacedStr = normalizedStr.replace(/>(\S)/g, '> $1');
  
  // Remove all HTML tags
  return spacedStr.replace(/<[^>]+>/g, '').trim();
};


export const getUserInfo = (currentUser) => {
  if (currentUser && currentUser.id) {
    const { email, profile, emailVerified, banned, deleted} = currentUser.attributes;
    const { firstName, lastName, displayName, publicData } = profile || {};
    const { userType: role, userName } = publicData || {};

    const username = !!userName?.trim()
      ? userName
      : !!displayName?.trim()
        ? displayName
        : `${firstName} ${lastName}`;

    return {
      email, username, role, firstName, lastName, props: { emailVerified, banned, deleted }
    }
  } else {
    return {
      username: "anonymous",
      email: "",
      role: "guest",
    };
  }
};

export const wasabiImageData = (wasabiImage) => {
  if (!wasabiImage || typeof wasabiImage !== 'object') {
    return {};
  }
  return {
    tags: wasabiImage.tags,
    key: wasabiImage.key,
    listingId: wasabiImage.listingId,
    assetName: wasabiImage.assetName,
    status: wasabiImage.status,
    url: wasabiImage.url,
    listingTitle: wasabiImage.listingTitle
  }
};

// Check if all assets are ready

const MINIMUM_EPISODES = 3;

export const isAssetReady = (localAsset, fallbackAsset, processingStatus) => {
    // Prioritize localAsset; check if it's an image asset (key) or a video asset (asset_id)
    if (localAsset) {
        if (localAsset.key) return true; // Image asset is ready
        if (localAsset.asset_id) {
            return !processingStatus.includes(localAsset.status); // Video asset is ready
        }
    }

    // Fallback to checking fallbackAsset
    if (fallbackAsset) {
        if (fallbackAsset.key) return true; // Image asset is ready
        if (fallbackAsset.asset_id) {
            return !processingStatus.includes(fallbackAsset.status); // Video asset is ready
        }
    }

    // If neither asset is ready
    return false;
};


export const areMarketingAssetsReady = (localMarketingAssets, listingMarketingAssets, processingStatus) => {
    const { marketingPoster, marketingBanner, marketingTrailer } = localMarketingAssets || {};
    return (
        isAssetReady(marketingPoster, listingMarketingAssets?.marketingPoster, processingStatus) &&
        isAssetReady(marketingBanner, listingMarketingAssets?.marketingBanner, processingStatus) &&
        isAssetReady(marketingTrailer, listingMarketingAssets?.marketingTrailer, processingStatus)
    );
};

export const isFilmReady = (filmGumletAsset, filmVideo, processingStatus) => {
    return isAssetReady(filmGumletAsset, filmVideo, processingStatus);
};

export const areAllEpisodesReady = (episodeAssets) => {
  if (episodeAssets && Object.keys(episodeAssets).length) {
      return Object.values(episodeAssets).every(episode => episode.added && videoReady.includes(episode?.videoFile?.status));
  }
  return true;
};

const videoReady = [STATUS_APPROVED, STATUS_PENDING_APPROVAL, STATUS_UPLOAD_READY];

// Check if there are any episodes that haven't been added
export const hasUnaddedEpisodes = (episodes) => {
  return episodes.some(episode => !episode?.added || !videoReady.includes(episode?.videoFile?.status));
};

export const isSeriesReady = (episodes, episodeAssets) => {
  const mergedEpisodes = mergeEpisodesWithAssets({ episodes, listingEpisodeAssets: episodeAssets });
    return (
      mergedEpisodes.length >= MINIMUM_EPISODES &&
        areAllEpisodesReady(mergedEpisodes)
    );
};

export const isListingAssetsReady = ({
  uploadQueue = [],
  episodeAssets = {},
  filmGumletAsset = {},
  marketingAssets = {},
  gumletProcessingStatus = GUMLET_PROCESSING_STATUS,
  listing,
}) => {

  if (!listing) return { isReady: false, message: "No listing" };
  const listingId = listing?.id?.uuid;
  const { episodes = [], listingType, filmVideo, marketingBanner, marketingPoster, marketingTrailer } = listing?.attributes?.publicData || {};

  // Step 1: Check for upload queue
  const isUploadPending = uploadQueue.some((task) => task.listingId === listingId);
  if (isUploadPending) return {
    isReady: false,
    message: "Upload in progress",
    code: CODE_UPLOADING
  };

  // Step 2: Check marketing assets
  if (!areMarketingAssetsReady(marketingAssets, { marketingPoster, marketingBanner, marketingTrailer }, gumletProcessingStatus)) {
    return {
      isReady: false,
      message: "processing marketing assets",
      code: CODE_PROCESSING_MARKETING
    };
  }

  // Step 3: Check based on listing type
  if (listingType === LISTING_TYPE_FILMS) {
    const isReady = isFilmReady(filmGumletAsset, filmVideo, gumletProcessingStatus);
    return {
      isReady,
      message: isReady ? 'ready' : 'processing film assets',
      code: isReady ? 'ready' : CODE_PROCESSING_FILM
    }
  }

  if (listingType === LISTING_TYPE_SERIES) {
    const isReady = isSeriesReady(episodes, episodeAssets);
    return {
      isReady,
      message: isReady ? 'ready' : 'processing series assets',
      code: isReady ? 'ready' : CODE_PROCESSING_SERIES
    }
  }

  return {
    isReady: false,
  };
};


export const createListingToMongo = async ({ id, attributes, type, listingType }) => {
  if (listingType === FILM_PRODUCTS) {
    return createFilm({ id: id.uuid, attributes, type })
  }

  if (listingType === SERIES_PRODUCTS) {
    return createSeries({ id: id.uuid, attributes, type })
  }

  return null;
};

export const updateListingToMongo = async ({ id, attributes, type, listingType }) => {
  if (listingType === FILM_PRODUCTS) {
    return updateFilm({ id: id.uuid, attributes, type })
  }

  if (listingType === SERIES_PRODUCTS) {
    return updateSeries({ id: id.uuid, attributes, type })
  }

  return null;
};

export const truncateEpisodeDescription = (description) => truncate(description, 100);