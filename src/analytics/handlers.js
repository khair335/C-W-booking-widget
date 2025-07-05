import moment from 'moment';
import {
  CREATOR_ACCOUNT_SIGNS_UP,
  UPLOAD_COMPLETE,
  USER_SIGN_UP,
  PURCHASE_COMPLETED,
  LISTING_STATE_PUBLISHED,
  USER_UPDATES_PROFILE,
  CREATOR_UPDATES_PROFILE,
  USER_FOLLOWED_CREATOR,
  RESET_PASSWORD_REQUESTED,
  CREATOR_SALE,
  LISTING_TYPE_FILMS,
  VIEWED_PRODUCT,
  ADDED_TO_WISHLIST,
  CREATOR_PROFILE_COMPLETED,
  USER_PROFILE_COMPLETED,
  ABANDONED_CART,
  LISTING_TYPE_SERIES,
} from '../constants';
import { createKlaviyoEvent, isFirstSaleForSeller } from '../util/api';
import { denormalisedResponseEntities, getUserType, removeTags } from '../util/data';
import { CREATOR_USER_TYPE, LISTING_STATE_PENDING_APPROVAL } from '../util/types';
import { createSlug } from '../util/urlHelpers';
import { v4 as uuidv4 } from 'uuid';

// Helper to safely extract user data
const extractUserData = user => {
  const { id, attributes, profileImage } = user || {};
  const { email, profile } = attributes || {};
  const { firstName, lastName, bio, publicData } = profile || {};
  const { displayName, userType, totalFilms, totalSeries, userName } = publicData || {};
  const userId = id?.uuid;
  const uName = userName ?? displayName;
  const profileUrl = `${process.env.REACT_APP_MARKETPLACE_ROOT_URL}/creator/${uName}/${userId}`;
  
  const { variants } = profileImage?.attributes || {};
  const profileImageUrl = variants?.['square-small2x'] ?? variants?.['square-small'] ?? "";

  return { email: email ?? publicData?.email, firstName, lastName, displayName, userId, profileUrl, bio, profileImageUrl, userType, totalFilms, totalSeries };
};

// Helper to safely extract listing data
const extractListingData = (listing) => {
  const { id: listingId, attributes, author } = listing || {};
  const { title = '', description, price, publicData, state } = attributes || {};
  const listingUrl = `${process.env.REACT_APP_MARKETPLACE_ROOT_URL}/l/${createSlug(title)}/${listingId?.uuid}`;
  const { listingType, filmVideo, episodes = [], episodeCount, primary_genre } = publicData || {};
  const { duration, thumbnail_url = null } = filmVideo || {};
  const thumbnailUrl = thumbnail_url || episodes?.[0]?.videoFile?.thumbnail_url;

  return {
    title,
    description: removeTags(description),
    price,
    listingType,
    duration,
    thumbnailUrl: Array.isArray(thumbnailUrl) ? thumbnailUrl[0] : thumbnailUrl,
    listingUrl,
    episodeCount,
    primary_genre,
    author,
    state,
    listingId: listingId?.uuid
  };
};

const prepareEventData = ({ metricName = '', profile = {}, eventDetails = {} }) => {
  const {
    email = '',
    firstName = '',
    lastName = '',
    properties: profileProperties = null,
    userId,
  } = profile || {};

  return {
    attributes: {
      metric: {
        data: {
          type: 'metric',
          attributes: {
            name: metricName,
          },
        },
      },
      profile: {
        data: {
          type: 'profile',
          attributes: {
            email,
            external_id: userId,
            firstName,
            lastName,
            ...(profileProperties ? { properties: profileProperties } : {}),
          },
        },
      },
      properties: eventDetails,
      unique_id: uuidv4(),
    },
  };
}

export class LoggingAnalyticsHandler {
  trackPageView(url) {
    console.log('Analytics page view:', url);
  }
}

// Google Analytics 4 (GA4) using gtag.js script, which is included in util/includeScripts.js
export class GoogleAnalyticsHandler {
  pushToDataLayer(eventData) {
    if (typeof window !== 'undefined' && window.dataLayer) {
      console.log('Analytics event:', eventData);
      window.dataLayer.push(eventData);
    } else {
      console.warn("Data Layer is not initialized");
    }
  }

  // Page View
  trackPageView(canonicalPath, previousPath) {
    // GA4 property. Manually send page_view events
    // https://developers.google.com/analytics/devguides/collection/gtagjs/single-page-applications
    // Note 1: You should turn "Enhanced measurement" off.
    //         It attaches own listeners to elements and that breaks in-app navigation.
    // Note 2: If previousPath is null (just after page load), gtag script sends page_view event automatically.
    //         Only in-app navigation needs to be sent manually from SPA.
    // Note 3: Timeout is needed because gtag script picks up <title>,
    //         and location change event happens before initial rendering.
    if (previousPath && window.gtag) {
      window.setTimeout(() => {
        window.gtag('event', 'page_view', {
          page_path: canonicalPath,
        });
      }, 300);
    };
  }

  // Sign up
  trackUserSignUp(payload) {
    const { publicData, userId } = payload || {};
    const { userType } = publicData || {};
    const eventName = userType === CREATOR_USER_TYPE ? 'creator_sign_up' : 'user_sign_up';
    this.pushToDataLayer({
      event: eventName,
      timestamp: moment().toISOString(),
      user_id: userId,
      user_type: userType,
    });
  }

  // Product View
  trackUserBrowsesAProduct({ payload, currentUser }) {
    if (!currentUser) return;
    const { listing } = payload || {};
    const { title, listingType, listingId, price } = extractListingData(listing);
    this.pushToDataLayer({
      event: 'product_view',
      product_id: listingId,
      product_name: title,
      category: listingType,
      timestamp: moment().toISOString(),
      price: price?.amount,
      currency: price?.currency
    });
  }

  // Add to Wishlist
  trackUserAddsItemToWishlist({ payload }) {
    const { listing } = payload || {};
    const { title, listingType, listingId, author, price } = extractListingData(listing);
    const { displayName, firstName, lastName } = extractUserData(author);
    this.pushToDataLayer({
      event: 'add_to_wishlist',
      product_id: listingId,
      product_name: title,
      category: listingType,
      by_creator: displayName || `${firstName} ${lastName}`,
      timestamp: moment().toISOString(),
      price: price?.amount,
      currency: price?.currency
    });
  }

  // Begin Checkout
  trackBeginCheckout({ payload }) {
    const { listing } = payload || {};
    const { title, listingType, listingId, author, price } = extractListingData(listing);
    const { displayName } = extractUserData(author);
    this.pushToDataLayer({
      event: 'add_to_checkout',
      product_id: listingId,
      product_name: title,
      category: listingType,
      by_creator: displayName,
      price: price?.amount,
      currency: price?.currency,
      timestamp: moment().toISOString(),
    });
  }

  // Purchase
  trackUserMakesAPurchase({ payload }) {
    const { orderId, listing, orderTotal = 0 } = payload || {};
    const { title, listingType, listingId, author, price } = extractListingData(listing);
    const { displayName } = extractUserData(author);
    this.pushToDataLayer({
      event: 'purchase',
      order_id: orderId,
      product_ids: [listingId],
      total_amount: orderTotal,
      price: price?.amount,
      currency: price?.currency,
      by_creator: displayName,
      product_name: title,
      category: listingType,
      timestamp: moment().toISOString(),
    });
  }

  // Creator Specific: Profile Event
  trackProfileEvent(payload) {
    const { response, isUpdate, eventTrigger } = payload || {};
    if (!eventTrigger) return; // Do not trigger event if eventTrigger is false

    const entities = denormalisedResponseEntities(response);
    if (entities.length !== 1) {
      throw new Error('Expected a resource in the sdk.currentUser.updateProfile response');
    }

    const currentUser = entities[0];
    const userType = getUserType(currentUser);
    const isCreator = userType == CREATOR_USER_TYPE;
    const { displayName, userId } = extractUserData(currentUser);
    const eventName = isCreator
      ? (!isUpdate ? 'creator_profile_completion' : 'creator_profile_update')
      : (!isUpdate ? 'user_profile_completion' : 'user_profile_update');

    this.pushToDataLayer({
      event: eventName,
      user_id: userId,
      creator_id: userId,
      by_creator: displayName,
      timestamp: moment().toISOString(),
    });
  }

  // Creator Content Upload
  trackCreatorContentUpload({ payload, currentUser }) {
    const {
      title,
      listingType,
      listingId,
      state,
      price
    } = extractListingData(payload?.data);
    const { displayName, firstName, lastName } = extractUserData(currentUser);
    const acceptedStates = [LISTING_STATE_PUBLISHED, LISTING_STATE_PENDING_APPROVAL];
    if (!acceptedStates.includes(state)) {
      return null;
    }
    this.pushToDataLayer({
      event: 'content_upload',
      content_id: listingId,
      content_title: title,
      category: listingType,
      timestamp: moment().toISOString(),
      price: price?.amount,
      currency: price?.currency,
      by_creator: displayName || `${firstName} ${lastName}`,
    });
  }
}


export class KlaviyoAnalyticsHandler {
  // creator events

  trackCreatorContentUpload({ payload, currentUser }) {
    const {
      title,
      state,
      listingUrl,
      listingId,
      thumbnailUrl
    } = extractListingData(payload?.data);
    const { userId, email, firstName, lastName } = extractUserData(currentUser);

    const acceptedStates = [LISTING_STATE_PUBLISHED, LISTING_STATE_PENDING_APPROVAL];
    if (!acceptedStates.includes(state)) {
      return null;
    };

    const eventDetails = {
      creator_id: userId,
      content_id: listingId,
      content_title: title,
      content_url: listingUrl,
      upload_timestamp: new Date().toISOString(),
      uploaded_content: listingUrl,
      thumbnail_url: thumbnailUrl
    }

    createKlaviyoEvent(
      prepareEventData({
        metricName: UPLOAD_COMPLETE,
        profile: { email, firstName, lastName, userId },
        eventDetails,
      })
    );
  }

  // common events
  trackUserSignUp(payload) {
    const { email, firstName, lastName, publicData } = payload || {};
    const { userType } = publicData || {};
    const onboardingPage = `${process.env.REACT_APP_MARKETPLACE_ROOT_URL}/profile-settings`;
    const signup_timestamp = new Date().toISOString();

    const isUserTypeCreator = userType == CREATOR_USER_TYPE;
    const metricName = isUserTypeCreator ? CREATOR_ACCOUNT_SIGNS_UP : USER_SIGN_UP;
    const eventDetails = isUserTypeCreator
      ? {
        creator_name: firstName + ' ' + lastName,
        creator_email: email,
        signup_timestamp,
        onboardingPage,
      }
      : {
        user_name: firstName + lastName,
        user_email: email,
        signup_timestamp,
        onboardingPage,
      };

    createKlaviyoEvent(
      prepareEventData({
        metricName,
        profile: { email, firstName, lastName },
        eventDetails,
      })
    );
  }

  trackProfileEvent(payload) {
    const { response, updatedAttributes = {}, isUpdate, eventTrigger } = payload || {};
    if (!eventTrigger) return; // Do not trigger event if eventTrigger is false
    const entities = denormalisedResponseEntities(response);
    if (entities.length !== 1) {
      throw new Error('Expected a resource in the sdk.currentUser.updateProfile response');
    }

    const currentUser = entities[0];
    const userType = getUserType(currentUser);
    const isUserTypeCreator = userType == CREATOR_USER_TYPE;

    const { id, attributes } = currentUser;
    const { profile, email } = attributes;
    const { firstName, lastName, publicData } = profile;
    const { userName } = publicData || {};
    const objectID = id.uuid;
    const creatorProfileUrl = `${process.env.REACT_APP_MARKETPLACE_ROOT_URL}/creator/${userName}/${objectID}`;
    const userProfilePage = `${process.env.REACT_APP_MARKETPLACE_ROOT_URL}/profile-settings`;

    const updated_fields = { ...updatedAttributes, ...(updatedAttributes?.publicData || {}) };
    delete updated_fields?.publicData;

    if (!Object.keys(updatedAttributes).length) {
      return;
    }

    const metricName = isUserTypeCreator
      ? (isUpdate ? CREATOR_UPDATES_PROFILE : CREATOR_PROFILE_COMPLETED)
      : (isUpdate ? USER_UPDATES_PROFILE : USER_PROFILE_COMPLETED);
    const updateTimestamp = new Date().toISOString();
    const eventDetails = isUserTypeCreator
      ? {
        creator_id: objectID,
        update_timestamp: updateTimestamp,
        profile_page: creatorProfileUrl,
        updated_fields,
      }
      : {
        user_id: objectID,
        update_timestamp: updateTimestamp,
        profile_page: userProfilePage,
        updated_fields,
      };

    createKlaviyoEvent(
      prepareEventData({
        metricName,
        profile: { email, firstName, lastName, userId: objectID },
        eventDetails
      })
    );
  }

  trackPasswordRecoveryRequest({ payload }) {
    const { email } = payload || {};

    const eventDetails = {
      email,
      request_timestamp: new Date().toISOString()
    }

    createKlaviyoEvent(
      prepareEventData({
        metricName: RESET_PASSWORD_REQUESTED,
        profile: { email },
        eventDetails
      })
    );
  }

  // user events
  trackUserAddsCreatorToWishlist({ payload, currentUser }) {
    const { profileUrl, userId } = extractUserData(payload?.user);

    const {
      userId: customerUserId,
      email: customerEmail,
      firstName: customerFirstName,
      lastName: customerLastName,
    } = extractUserData(currentUser);

    const eventDetails = {
      user_id: customerUserId,
      creator_id: userId,
      follow_timestamp: new Date().toISOString(),
      creator_profile: profileUrl
    };

    createKlaviyoEvent(
      prepareEventData({
        metricName: USER_FOLLOWED_CREATOR,
        profile: {
          userId: customerUserId,
          email: customerEmail,
          firstName: customerFirstName,
          lastName: customerLastName,
        },
        eventDetails,
      })
    );
  }

  trackUserMakesAPurchase({ payload, currentUser }) {
    const { orderId, listing, orderTotal = 0 } = payload || {};

    if (!orderId || !listing) {
      console.log('trackUserMakesAPurchase event -> payload or listing is missing!');
      return null;
    }

    const {
      title,
      price,
      listingId,
      thumbnailUrl
    } = extractListingData(listing);
    const {
      userId: customerUserId,
      email: customerEmail,
      firstName: customerFirstName,
      lastName: customerLastName,
      userId
    } = extractUserData(currentUser);

    const eventDetails = {
      user_id: userId,
      order_id: orderId,
      product_details: {
        product_id: listingId,
        name: title,
        price,
        thumbnail_url: thumbnailUrl
      },
      total_amount: orderTotal,
      purchase_timestamp: new Date().toISOString(),
      order_summary: `${process.env.REACT_APP_MARKETPLACE_ROOT_URL}/order/${orderId}`,
      thumbnail_url: thumbnailUrl
    }

    createKlaviyoEvent(
      prepareEventData({
        metricName: PURCHASE_COMPLETED,
        profile: {
          userId: customerUserId,
          email: customerEmail,
          firstName: customerFirstName,
          lastName: customerLastName,
        },
        eventDetails,
      })
    );
  }


  trackCreatorFirstSale({ payload, currentUser }) {
    const { orderId, listing } = payload || {};
    if (!orderId || !listing) {
      return null;
    }

    isFirstSaleForSeller({ id: listing.author?.id.uuid }).then(response => {
      if (response?.isFirstSale) {
        const {
          title,
          price,
          listingType,
          duration,
          thumbnailUrl,
          listingUrl,
          episodeCount,
          primary_genre,
          author,
        } = extractListingData(listing);
        const { firstName: customerFirstName, lastName: customerLastName } = extractUserData(currentUser);
        const { email, firstName, lastName } = extractUserData(author);

        createKlaviyoEvent(
          prepareEventData({
            metricName: CREATOR_SALE,
            profile: { email, firstName, lastName },
            eventDetails: {
              contentName: title,
              contentType: listingType,
              ...(listingType === LISTING_TYPE_FILMS ? { duration } : { episodeCount }),
              genre: primary_genre.join(', '),
              price: price?.amount ? price.amount / 100 : 0,
              listingUrl,
              timestamp: new Date(),
              thumbnail_url: thumbnailUrl,
              customerFirstName,
              customerLastName,
            },
          })
        );
      }
    })
  }

  trackUserBrowsesAProduct({ payload, currentUser }) {
    // guest user can browse a product. In that case, stop right here as we do not have any email to find/create a profile on klaviyo
    if (!currentUser) return null;

    const { listing } = payload || {};
    const {
      title,
      description,
      price,
      listingType,
      episodeCount,
      primary_genre,
      duration,
      thumbnailUrl,
      listingUrl,
      author,
    } = extractListingData(listing);

    const { displayName } = extractUserData(author);
    const {
      userId: customerUserId,
      email: customerEmail,
      firstName: customerFirstName,
      lastName: customerLastName,
    } = extractUserData(currentUser);

    createKlaviyoEvent(
      prepareEventData({
        metricName: VIEWED_PRODUCT,
        profile: {
          userId: customerUserId,
          email: customerEmail,
          firstName: customerFirstName,
          lastName: customerLastName,
        },
        eventDetails: {
          contentName: title,
          contentType: listingType,
          ...(listingType === LISTING_TYPE_FILMS ? { duration } : { episodeCount }),
          genre: primary_genre?.join(', '),
          price: price?.amount ? price.amount / 100 : 0,
          listingUrl,
          timestamp: new Date(),
          thumbnail_url: thumbnailUrl,
          description,
          creatorName: displayName,
        },
      })
    );
  }

  trackUserAddsItemToWishlist({ payload, currentUser }) {
    const {
      title,
      description,
      price,
      listingType,
      episodeCount,
      primary_genre,
      duration,
      thumbnailUrl,
      listingUrl,
      author,
    } = extractListingData(payload?.listing || {});

    const { displayName } = extractUserData(author);
    const {
      userId: customerUserId,
      email: customerEmail,
      firstName: customerFirstName,
      lastName: customerLastName,
    } = extractUserData(currentUser);

    createKlaviyoEvent(
      prepareEventData({
        metricName: ADDED_TO_WISHLIST,
        profile: {
          userId: customerUserId,
          email: customerEmail,
          firstName: customerFirstName,
          lastName: customerLastName,
        },
        eventDetails: {
          contentName: title,
          contentType: listingType,
          ...(listingType === LISTING_TYPE_FILMS ? { duration } : { episodeCount }),
          genre: primary_genre.join(', '),
          price: price?.amount ? price.amount / 100 : 0,
          listingUrl,
          thumbnail_url: thumbnailUrl,
          description,
          creatorName: displayName,
          timestamp: new Date(),
        },
      })
    );
  }


  trackAbandonedCart({ payload, currentUser }) {
    const {
      title,
      description,
      price,
      listingType,
      episodeCount,
      primary_genre,
      duration,
      thumbnailUrl,
      listingUrl,
      author,
    } = extractListingData(payload?.listing || {});
    const { displayName } = extractUserData(author);
    const {
      userId,
      email,
      firstName,
      lastName,
    } = extractUserData(currentUser);

    createKlaviyoEvent(
      prepareEventData({
        metricName: ABANDONED_CART,
        profile: { email, firstName, lastName, userId },
        eventDetails: {
          contentName: title,
          contentType: listingType,
          ...(listingType === LISTING_TYPE_FILMS ? { duration } : { episodeCount }),
          genre: primary_genre?.join(', '),
          price: price?.amount ? price.amount / 100 : 0,
          listingUrl,
          thumbnail_url: thumbnailUrl,
          description,
          creatorName: displayName,
          timestamp: new Date(),
        }
      })
    );
  }
}


export class ProductFruitsEventHandler {

  // Profile Event
  trackProfileEvent(payload) {
    const { response, isUpdate, eventTrigger } = payload || {};
    if (!eventTrigger) return; // Do not trigger event if eventTrigger is false

    const entities = denormalisedResponseEntities(response);
    if (entities.length !== 1) {
      throw new Error('Expected a resource in the sdk.currentUser.updateProfile response');
    }
    const creator = entities[0];
    const { displayName, userId } = extractUserData(creator);
    const eventName = !isUpdate ? 'Complete Profile' : 'Update Profile';
    if (typeof window !== 'undefined' && window.productFruits && window.productFruits.api) {
      window.productFruits.api.events.track(eventName, {
        event: eventName,
        user_id: userId,
        username: displayName,
        timestamp: moment().toISOString(),
      }, { forwardToIntegrations: true });
    }
  }

  // Add First Film
  trackPublishFilm({ payload, currentUser }) {
    const {
      title,
      state,
      listingType,
      listingId,
    } = extractListingData(payload?.data);

    const { displayName, totalFilms } = extractUserData(currentUser);
    const acceptedStates = [LISTING_STATE_PUBLISHED, LISTING_STATE_PENDING_APPROVAL];
    if (!acceptedStates.includes(state)) {
      return null;
    };
    const eventName = totalFilms === 0 ? 'Add First Film' : 'Publish Draft Film';
    if (typeof window !== 'undefined' && window.productFruits && window.productFruits.api && (listingType === LISTING_TYPE_FILMS)) {
      window.productFruits.api.events.track(eventName, {
        event: eventName,
        content_id: listingId,
        content_title: title,
        category: listingType,
        timestamp: moment().toISOString(),
        username: displayName,
        by_creator: displayName,
      }, { forwardToIntegrations: true });
    }
  }

  // Add First Series
  trackPublishSeries({ payload, currentUser }) {
    const {
      title,
      state,
      listingType,
      listingId,
    } = extractListingData(payload?.data);
    
    const { displayName, totalSeries } = extractUserData(currentUser);
    const acceptedStates = [LISTING_STATE_PUBLISHED, LISTING_STATE_PENDING_APPROVAL];
    if (!acceptedStates.includes(state)) {
      return null;
    };
    const eventName = totalSeries === 0 ? 'Add First Series' : 'Publish Draft Series';
    if (typeof window !== 'undefined' && window.productFruits && window.productFruits.api && (listingType === LISTING_TYPE_SERIES)) {
      window.productFruits.api.events.track(eventName, {
        event: eventName,
        content_id: listingId,
        content_title: title,
        category: listingType,
        timestamp: moment().toISOString(),
        username: displayName,
        by_creator: displayName,
      }, { forwardToIntegrations: true });
    }
  }

  // First Sale
  trackCreatorFirstSale({ payload, currentUser }) {
    const { orderId, listing } = payload || {};
    if (!orderId || !listing) {
      return null;
    }

    if (typeof window !== 'undefined' && window.productFruits && window.productFruits.api) {
      isFirstSaleForSeller({ id: listing.author?.id.uuid }).then(response => {
        if (response?.isFirstSale) {
          const {
            title,
            price,
            listingType,
            author,
          } = extractListingData(listing);
          const { email, firstName, lastName } = extractUserData(author);
          const eventName = 'Earn First Sale';
          window.productFruits.api.events.track(eventName, {
            order_id: orderId,
            user_id: listing.author?.id.uuid,
            username: `${firstName} ${lastName}`,
            email,
            price: price?.amount ? price.amount / 100 : 0,
            title,
            listingType,
          });
        }
      })
    }
  }

  // Search For Content
  trackUserBrowsesAProduct({ payload, currentUser }) {
    // Guest user can browse a product. In that case, stop right here.
    if (!currentUser) return null;
    const { listing } = payload || {};
    const { title, listingType, listingId } = extractListingData(listing);
    const eventName = 'Search For Content';
    if (typeof window !== 'undefined' && window.productFruits && window.productFruits.api) {
      window.productFruits.api.events.track(eventName, {
        product_id: listingId,
        product_name: title,
        category: listingType,
        timestamp: moment().toISOString(),
      }, { forwardToIntegrations: true });
    }
  }


  // Purchase
  trackUserMakesAPurchase({ payload }) {
    const { orderId, listing, orderTotal = 0, isFirstPurchase } = payload || {};
    const { title, listingType, listingId, author, price } = extractListingData(listing);
    const { displayName } = extractUserData(author);
    const eventName = isFirstPurchase ? 'First Purchased Content' : 'Purchased Content';

    if (typeof window !== 'undefined' && window.productFruits && window.productFruits.api) {
      window.productFruits.api.events.track(eventName, {
        event: eventName,
        order_id: orderId,
        product_ids: [listingId],
        total_amount: orderTotal,
        currency: price?.currency,
        by_creator: displayName,
        product_name: title,
        category: listingType,
        timestamp: moment().toISOString(),
      }, { forwardToIntegrations: true });
    }
  }

   // first film watched
  trackUserFirstFilmWatched({ payload }) {
    const { response, listing } = payload || {};
    const { id } = response.data.data || {};
    const { title, listingType, listingId, price } = extractListingData(listing);
    const eventName = 'First Film Watched';
    if (typeof window !== 'undefined' && window.productFruits && window.productFruits.api) {
      window.productFruits.api.events.track(eventName, {
        event: eventName,
        order_id: id.uuid,
        category: listingType,
        product_ids: [listingId],
        product_name: title,
        currency: price?.currency,
        timestamp: moment().toISOString(),
      }, { forwardToIntegrations: true });
    }
  }
}