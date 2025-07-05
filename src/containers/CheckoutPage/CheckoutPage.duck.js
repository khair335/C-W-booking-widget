import pick from 'lodash/pick';
import { createTransactionDB, initiatePrivileged, transitionPrivileged, updateAuthorListing } from '../../util/api';
import { denormalisedResponseEntities, preparePreferenceConfig } from '../../util/data';
import { storableError } from '../../util/errors';
import * as log from '../../util/log';
import { fetchCurrentUserHasOrdersSuccess, fetchCurrentUser, listingPreferencesSelector } from '../../ducks/user.duck';
import { updateProfile } from '../ProfileSettingsPage/ProfileSettingsPage.duck';

// ================ Action types ================ //

export const SET_INITIAL_VALUES = 'app/CheckoutPage/SET_INITIAL_VALUES';

export const INITIATE_ORDER_REQUEST = 'app/CheckoutPage/INITIATE_ORDER_REQUEST';
export const INITIATE_ORDER_SUCCESS = 'app/CheckoutPage/INITIATE_ORDER_SUCCESS';
export const INITIATE_ORDER_ERROR = 'app/CheckoutPage/INITIATE_ORDER_ERROR';

export const CONFIRM_PAYMENT_REQUEST = 'app/CheckoutPage/CONFIRM_PAYMENT_REQUEST';
export const CONFIRM_PAYMENT_SUCCESS = 'app/CheckoutPage/CONFIRM_PAYMENT_SUCCESS';
export const CONFIRM_PAYMENT_ERROR = 'app/CheckoutPage/CONFIRM_PAYMENT_ERROR';

export const SPECULATE_TRANSACTION_REQUEST = 'app/CheckoutPage/SPECULATE_TRANSACTION_REQUEST';
export const SPECULATE_TRANSACTION_SUCCESS = 'app/CheckoutPage/SPECULATE_TRANSACTION_SUCCESS';
export const SPECULATE_TRANSACTION_ERROR = 'app/CheckoutPage/SPECULATE_TRANSACTION_ERROR';

export const STRIPE_CUSTOMER_REQUEST = 'app/CheckoutPage/STRIPE_CUSTOMER_REQUEST';
export const STRIPE_CUSTOMER_SUCCESS = 'app/CheckoutPage/STRIPE_CUSTOMER_SUCCESS';
export const STRIPE_CUSTOMER_ERROR = 'app/CheckoutPage/STRIPE_CUSTOMER_ERROR';

export const INITIATE_INQUIRY_REQUEST = 'app/CheckoutPage/INITIATE_INQUIRY_REQUEST';
export const INITIATE_INQUIRY_SUCCESS = 'app/CheckoutPage/INITIATE_INQUIRY_SUCCESS';
export const INITIATE_INQUIRY_ERROR = 'app/CheckoutPage/INITIATE_INQUIRY_ERROR';

export const CHECKOUT_ABANDONED = 'app/CheckoutPage/CHECKOUT_ABANDONED';

// ================ Reducer ================ //

const initialState = {
  listing: null,
  orderData: null,
  speculateTransactionInProgress: false,
  speculateTransactionError: null,
  speculatedTransaction: null,
  isClockInSync: false,
  transaction: null,
  initiateOrderError: null,
  confirmPaymentError: null,
  stripeCustomerFetched: false,
  initiateInquiryInProgress: false,
  initiateInquiryError: null,
};

export default function checkoutPageReducer(state = initialState, action = {}) {
  const { type, payload } = action;
  switch (type) {
    case SET_INITIAL_VALUES:
      return { ...initialState, ...payload };

    case SPECULATE_TRANSACTION_REQUEST:
      return {
        ...state,
        speculateTransactionInProgress: true,
        speculateTransactionError: null,
        speculatedTransaction: null,
      };
    case SPECULATE_TRANSACTION_SUCCESS: {
      // Check that the local devices clock is within a minute from the server
      const lastTransitionedAt = payload.transaction?.attributes?.lastTransitionedAt;
      const localTime = new Date();
      const minute = 60000;
      return {
        ...state,
        speculateTransactionInProgress: false,
        speculatedTransaction: payload.transaction,
        isClockInSync: Math.abs(lastTransitionedAt?.getTime() - localTime.getTime()) < minute,
      };
    }
    case SPECULATE_TRANSACTION_ERROR:
      console.error(payload); // eslint-disable-line no-console
      return {
        ...state,
        speculateTransactionInProgress: false,
        speculateTransactionError: payload,
      };

    case INITIATE_ORDER_REQUEST:
      return { ...state, initiateOrderError: null };
    case INITIATE_ORDER_SUCCESS:
      return { ...state, transaction: payload };
    case INITIATE_ORDER_ERROR:
      console.error(payload); // eslint-disable-line no-console
      return { ...state, initiateOrderError: payload };

    case CONFIRM_PAYMENT_REQUEST:
      return { ...state, confirmPaymentError: null };
    case CONFIRM_PAYMENT_SUCCESS:
      return state;
    case CONFIRM_PAYMENT_ERROR:
      console.error(payload); // eslint-disable-line no-console
      return { ...state, confirmPaymentError: payload };

    case STRIPE_CUSTOMER_REQUEST:
      return { ...state, stripeCustomerFetched: false };
    case STRIPE_CUSTOMER_SUCCESS:
      return { ...state, stripeCustomerFetched: true };
    case STRIPE_CUSTOMER_ERROR:
      console.error(payload); // eslint-disable-line no-console
      return { ...state, stripeCustomerFetchError: payload };

    case INITIATE_INQUIRY_REQUEST:
      return { ...state, initiateInquiryInProgress: true, initiateInquiryError: null };
    case INITIATE_INQUIRY_SUCCESS:
      return { ...state, initiateInquiryInProgress: false };
    case INITIATE_INQUIRY_ERROR:
      return { ...state, initiateInquiryInProgress: false, initiateInquiryError: payload };

    default:
      return state;
  }
}

// ================ Selectors ================ //

// ================ Action creators ================ //

export const setInitialValues = initialValues => ({
  type: SET_INITIAL_VALUES,
  payload: pick(initialValues, Object.keys(initialState)),
});

const initiateOrderRequest = () => ({ type: INITIATE_ORDER_REQUEST });

const initiateOrderSuccess = order => ({
  type: INITIATE_ORDER_SUCCESS,
  payload: order,
});

const initiateOrderError = e => ({
  type: INITIATE_ORDER_ERROR,
  error: true,
  payload: e,
});

const confirmPaymentRequest = () => ({ type: CONFIRM_PAYMENT_REQUEST });

const confirmPaymentSuccess = payload => ({
  type: CONFIRM_PAYMENT_SUCCESS,
  payload: payload,
});

const confirmPaymentError = e => ({
  type: CONFIRM_PAYMENT_ERROR,
  error: true,
  payload: e,
});

export const speculateTransactionRequest = () => ({ type: SPECULATE_TRANSACTION_REQUEST });

export const speculateTransactionSuccess = transaction => ({
  type: SPECULATE_TRANSACTION_SUCCESS,
  payload: { transaction },
});

export const speculateTransactionError = e => ({
  type: SPECULATE_TRANSACTION_ERROR,
  error: true,
  payload: e,
});

export const stripeCustomerRequest = () => ({ type: STRIPE_CUSTOMER_REQUEST });
export const stripeCustomerSuccess = () => ({ type: STRIPE_CUSTOMER_SUCCESS });
export const stripeCustomerError = e => ({
  type: STRIPE_CUSTOMER_ERROR,
  error: true,
  payload: e,
});

export const initiateInquiryRequest = () => ({ type: INITIATE_INQUIRY_REQUEST });
export const initiateInquirySuccess = () => ({ type: INITIATE_INQUIRY_SUCCESS });
export const initiateInquiryError = e => ({
  type: INITIATE_INQUIRY_ERROR,
  error: true,
  payload: e,
});

export const checkoutAbandoned = payload => ({ type: CHECKOUT_ABANDONED, payload });

/* ================ Thunks ================ */

export const initiateOrder = (
  orderParams,
  processAlias,
  transactionId,
  transitionName,
  isPrivilegedTransition
) => (dispatch, getState, sdk) => {
  dispatch(initiateOrderRequest());

  // If we already have a transaction ID, we should transition, not
  // initiate.
  const isTransition = !!transactionId;

  const { deliveryMethod, quantity, bookingDates, ...otherOrderParams } = orderParams;
  const quantityMaybe = quantity ? { stockReservationQuantity: quantity } : {};
  const bookingParamsMaybe = bookingDates || {};

  // Parameters only for client app's server
  const orderData = deliveryMethod ? { deliveryMethod } : {};

  // Parameters for Marketplace API
  const transitionParams = {
    ...quantityMaybe,
    ...bookingParamsMaybe,
    ...otherOrderParams,
  };

  const bodyParams = isTransition
    ? {
      id: transactionId,
      transition: transitionName,
      params: transitionParams,
    }
    : {
      processAlias,
      transition: transitionName,
      params: transitionParams,
    };
  const queryParams = {
    include: ['booking', 'provider'],
    expand: true,
  };

  const handleSucces = response => {
    const entities = denormalisedResponseEntities(response);
    const order = entities[0];
    dispatch(initiateOrderSuccess(order));
    dispatch(fetchCurrentUserHasOrdersSuccess(true));
    return order;
  };

  const handleError = e => {
    dispatch(initiateOrderError(storableError(e)));
    const transactionIdMaybe = transactionId ? { transactionId: transactionId.uuid } : {};
    log.error(e, 'initiate-order-failed', {
      ...transactionIdMaybe,
      listingId: orderParams.listingId.uuid,
      ...quantityMaybe,
      ...bookingParamsMaybe,
      ...orderData,
    });
    throw e;
  };

  if (isTransition && isPrivilegedTransition) {
    // transition privileged
    return transitionPrivileged({ isSpeculative: false, orderData, bodyParams, queryParams })
      .then(handleSucces)
      .catch(handleError);
  } else if (isTransition) {
    // transition non-privileged
    return sdk.transactions
      .transition(bodyParams, queryParams)
      .then(handleSucces)
      .catch(handleError);
  } else if (isPrivilegedTransition) {
    // initiate privileged
    return initiatePrivileged({ isSpeculative: false, orderData, bodyParams, queryParams })
      .then(handleSucces)
      .catch(handleError);
  } else {
    // initiate non-privileged
    return sdk.transactions
      .initiate(bodyParams, queryParams)
      .then(handleSucces)
      .catch(handleError);
  }
};

export const confirmPayment = (transactionId, transitionName, transitionParams = {}, listingId) => (
  dispatch,
  getState,
  sdk
) => {
  dispatch(confirmPaymentRequest());

  const bodyParams = {
    id: transactionId,
    transition: transitionName,
    params: {},
  };
  const queryParams = {
    include: ['booking', 'provider', 'customer'],
    expand: true,
  };

  return sdk.transactions
    .transition(bodyParams, queryParams)
    .then(response => {
      const order = response.data.data;
      const { listing } = transitionParams || {};
      const { id, attributes } = order || {};
      const orderTotal = attributes?.payinTotal?.amount ? (attributes?.payinTotal?.amount / 100) : 0;

      // Need to check if it is first purchase
      return sdk.transactions.query({
        only: "order"
      }).then(response => {
        const { data } = response;
        const { data: orders } = data;
        const isFirstPurchase = orders.length === 1;
        dispatch(confirmPaymentSuccess({ orderId: id?.uuid, listing, orderTotal, isFirstPurchase }));

        if (order) {
          const { title, description, price, publicData } = listing?.attributes || {};

          const mongoData = {
            transactionId: order.id.uuid,
            listingsId: listingId?.uuid,
            buyerUserId: order?.relationships?.customer?.data?.id?.uuid,
            listingData: {
              title,
              description,
              price,
              ...publicData
            },
            paymentStatus: "Done",
          };

          // Define the two promises
          const updateListingPromise = updateAuthorListing({
            id: listingId,
            publicData: { hasTransaction: true },
          });
          const createTransactionPromise = createTransactionDB(mongoData);

          // Execute both promises concurrently with Promise.all
          Promise.all([updateListingPromise, createTransactionPromise])
            .then(([updateListingResult, createTransactionResult]) => {
              const { primary_genre = [], listingType, series_primary_genre = [] } = publicData;
              const listing_preferences = listingPreferencesSelector(getState());
              const preferencePayload = preparePreferenceConfig(
                listing_preferences,
                listingType,
                primary_genre.length ? primary_genre : series_primary_genre
              );

              dispatch(updateProfile(preferencePayload));

              console.log('Update and transaction creation successful:', {
                updateListingResult,
                createTransactionResult,
              });
            })
            .catch(error => {
              console.error('An error occurred in update or transaction creation:', error);
            });
        }
        
        return order;
      }).catch(error => {
        console.log(error);
      })
    })
    .catch(e => {
      dispatch(confirmPaymentError(storableError(e)));
      const transactionIdMaybe = transactionId ? { transactionId: transactionId.uuid } : {};
      log.error(e, 'initiate-order-failed', {
        ...transactionIdMaybe,
      });
      throw e;
    });
};

export const sendMessage = params => (dispatch, getState, sdk) => {
  const message = params.message;
  const orderId = params.id;

  if (message) {
    return sdk.messages
      .send({ transactionId: orderId, content: message })
      .then(() => {
        return { orderId, messageSuccess: true };
      })
      .catch(e => {
        log.error(e, 'initial-message-send-failed', { txId: orderId });
        return { orderId, messageSuccess: false };
      });
  } else {
    return Promise.resolve({ orderId, messageSuccess: true });
  }
};

/**
 * Initiate transaction against default-inquiry process
 * Note: At this point inquiry transition is made directly against Marketplace API.
 *       So, client app's server is not involved here unlike with transitions including payments.
 *
 * @param {*} inquiryParams contains listingId and protectedData
 * @param {*} processAlias 'default-inquiry/release-1'
 * @param {*} transitionName 'transition/inquire-without-payment'
 * @returns
 */
export const initiateInquiryWithoutPayment = (inquiryParams, processAlias, transitionName) => (
  dispatch,
  getState,
  sdk
) => {
  dispatch(initiateInquiryRequest());

  if (!processAlias) {
    const error = new Error('No transaction process attached to listing');
    log.error(error, 'listing-process-missing', {
      listingId: listing?.id?.uuid,
    });
    dispatch(initiateInquiryError(storableError(error)));
    return Promise.reject(error);
  }

  const bodyParams = {
    transition: transitionName,
    processAlias,
    params: inquiryParams,
  };
  const queryParams = {
    include: ['provider'],
    expand: true,
  };

  return sdk.transactions
    .initiate(bodyParams, queryParams)
    .then(response => {
      const transactionId = response.data.data.id;
      dispatch(initiateInquirySuccess());
      return transactionId;
    })
    .catch(e => {
      dispatch(initiateInquiryError(storableError(e)));
      throw e;
    });
};

/**
 * Initiate or transition the speculative transaction with the given
 * booking details
 *
 * The API allows us to do speculative transaction initiation and
 * transitions. This way we can create a test transaction and get the
 * actual pricing information as if the transaction had been started,
 * without affecting the actual data.
 *
 * We store this speculative transaction in the page store and use the
 * pricing info for the booking breakdown to get a proper estimate for
 * the price with the chosen information.
 */
export const speculateTransaction = (
  orderParams,
  processAlias,
  transactionId,
  transitionName,
  isPrivilegedTransition
) => (dispatch, getState, sdk) => {
  dispatch(speculateTransactionRequest());

  // If we already have a transaction ID, we should transition, not
  // initiate.
  const isTransition = !!transactionId;

  const { deliveryMethod, quantity, bookingDates, ...otherOrderParams } = orderParams;
  const quantityMaybe = quantity ? { stockReservationQuantity: quantity } : {};
  const bookingParamsMaybe = bookingDates || {};

  // Parameters only for client app's server
  const orderData = deliveryMethod ? { deliveryMethod } : {};

  // Parameters for Marketplace API
  const transitionParams = {
    ...quantityMaybe,
    ...bookingParamsMaybe,
    ...otherOrderParams,
    cardToken: 'CheckoutPage_speculative_card_token',
  };

  const bodyParams = isTransition
    ? {
      id: transactionId,
      transition: transitionName,
      params: transitionParams,
    }
    : {
      processAlias,
      transition: transitionName,
      params: transitionParams,
    };

  const queryParams = {
    include: ['booking', 'provider'],
    expand: true,
  };

  const handleSuccess = response => {
    const entities = denormalisedResponseEntities(response);
    if (entities.length !== 1) {
      throw new Error('Expected a resource in the speculate response');
    }
    const tx = entities[0];
    dispatch(speculateTransactionSuccess(tx));
  };

  const handleError = e => {
    log.error(e, 'speculate-transaction-failed', {
      listingId: transitionParams.listingId.uuid,
      ...quantityMaybe,
      ...bookingParamsMaybe,
      ...orderData,
    });
    return dispatch(speculateTransactionError(storableError(e)));
  };

  if (isTransition && isPrivilegedTransition) {
    // transition privileged
    return transitionPrivileged({ isSpeculative: true, orderData, bodyParams, queryParams })
      .then(handleSuccess)
      .catch(handleError);
  } else if (isTransition) {
    // transition non-privileged
    return sdk.transactions
      .transitionSpeculative(bodyParams, queryParams)
      .then(handleSuccess)
      .catch(handleError);
  } else if (isPrivilegedTransition) {
    // initiate privileged
    return initiatePrivileged({ isSpeculative: true, orderData, bodyParams, queryParams })
      .then(handleSuccess)
      .catch(handleError);
  } else {
    // initiate non-privileged
    return sdk.transactions
      .initiateSpeculative(bodyParams, queryParams)
      .then(handleSuccess)
      .catch(handleError);
  }
};

// StripeCustomer is a relantionship to currentUser
// We need to fetch currentUser with correct params to include relationship
export const stripeCustomer = () => (dispatch, getState, sdk) => {
  dispatch(stripeCustomerRequest());
  const fetchCurrentUserOptions = {
    callParams: { include: ['stripeCustomer.defaultPaymentMethod'] },
    updateHasListings: false,
    updateNotifications: false,
  };

  return dispatch(fetchCurrentUser(fetchCurrentUserOptions))
    .then(response => {
      dispatch(stripeCustomerSuccess());
    })
    .catch(e => {
      dispatch(stripeCustomerError(storableError(e)));
    });
};
