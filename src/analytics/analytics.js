import { CHECKOUT_ABANDONED, CONFIRM_PAYMENT_SUCCESS, SET_INITIAL_VALUES as SET_CHECKOUT_INITIAL_VALUES } from '../containers/CheckoutPage/CheckoutPage.duck';
import { PUBLISH_LISTING_SUCCESS } from '../containers/EditListingPage/EditListingPage.duck';
import { ADD_CREATOR_TO_WISHLIST, ADD_LISTING_TO_WISHLIST, FILM_WATCHED_SUCCESS } from '../containers/MyLibraryPage/MyLibraryPage.duck';
import { RECOVERY_REQUEST } from '../containers/PasswordRecoveryPage/PasswordRecoveryPage.duck';
import { UPDATE_PROFILE_SUCCESS } from '../containers/ProfileSettingsPage/ProfileSettingsPage.duck';
import { SHOW_LISTINGS_SUCCESS } from '../containers/ListingPage/ListingPage.duck';
import { SIGNUP_SUCCESS } from '../ducks/auth.duck';
import { LOCATION_CHANGED } from '../ducks/routing.duck';
import { currentUserSelector } from '../ducks/user.duck';
import { purchasedObjectIDs } from '../util/searchInsight';
import { PURCHASE_COMPLETED } from '../constants';

// Create a Redux middleware from the given analytics handlers. Each
// handler should have the following methods:
//
// - trackPageView(canonicalPath, previousPath): called when the URL is changed
export const createMiddleware = handlers => store => next => action => {
  const { type, payload = {} } = action;
  const currentUser = currentUserSelector(store.getState());

  switch (type) {
    case LOCATION_CHANGED:
      const { canonicalPath } = payload;
      processHandler(handlers, 'trackPageView', canonicalPath);
      break;

    case SIGNUP_SUCCESS:
      processHandler(handlers, 'trackUserSignUp', payload);
      break;

    case UPDATE_PROFILE_SUCCESS:
      processHandler(handlers, 'trackProfileEvent', payload);
      break;

    case PUBLISH_LISTING_SUCCESS:
      processHandler(handlers, 'trackCreatorContentUpload', {
        payload,
        currentUser,
      });
      processHandler(handlers, 'trackPublishFilm', {
        payload,
        currentUser,
      });

      processHandler(handlers, 'trackPublishSeries', {
        payload,
        currentUser,
      });
      break;

    case SHOW_LISTINGS_SUCCESS:
      processHandler(handlers, 'trackUserBrowsesAProduct', {
        payload,
        currentUser,
      });
      break;

    case CONFIRM_PAYMENT_SUCCESS:
      processHandler(handlers, 'trackCreatorFirstSale', {
        payload,
        currentUser,
      });
      processHandler(handlers, 'trackUserMakesAPurchase', {
        payload,
        currentUser,
      });
      purchasedObjectIDs({
        userToken: currentUser?.id?.uuid,
        eventName: PURCHASE_COMPLETED,
        indexName: process.env.REACT_APP_ALGOLIA_LISTINGS_INDEX,
        objectIDs: [payload?.listing?.id?.uuid],
        value: payload?.listing?.attributes?.price?.amount,
        currency: payload?.listing?.attributes?.price?.currency,
      });
      break;

    case ADD_LISTING_TO_WISHLIST:
      processHandler(handlers, 'trackUserAddsItemToWishlist', {
        payload,
        currentUser,
      });
      break;

    case ADD_CREATOR_TO_WISHLIST:
      processHandler(handlers, 'trackUserAddsCreatorToWishlist', {
        payload,
        currentUser,
      });
      break;

    case RECOVERY_REQUEST:
      processHandler(handlers, 'trackPasswordRecoveryRequest', {
        payload,
        currentUser,
      });
      break;

    case CHECKOUT_ABANDONED:
      processHandler(handlers, 'trackAbandonedCart', {
        payload,
        currentUser,
      });
      break;

    case SET_CHECKOUT_INITIAL_VALUES:
      processHandler(handlers, 'trackBeginCheckout', {
        payload,
        currentUser,
      });
      break;

    case FILM_WATCHED_SUCCESS:
      processHandler(handlers, 'trackUserFirstFilmWatched', {
        payload,
        currentUser,
      });
      break;

    default:
      break;
  }

  next(action);
};

const processHandler = (handlers, handleFunc, payload) => {
  return handlers.forEach(handler => {
    if (typeof handler?.[handleFunc] === 'function') {
      handler[handleFunc](payload);
    }
  });
};
