import React from 'react';
import { bool, func, oneOf, shape, string } from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import classNames from 'classnames';

import { useRouteConfiguration } from '../../context/routeConfigurationContext';
import { FormattedMessage, intlShape, injectIntl } from '../../util/reactIntl';
import { createResourceLocatorString, findRouteByRouteName } from '../../util/routes';
import {
  propTypes,
} from '../../util/types';
import { createSlug } from '../../util/urlHelpers';
import {
  TX_TRANSITION_ACTOR_CUSTOMER as CUSTOMER,
  TX_TRANSITION_ACTOR_PROVIDER as PROVIDER,
  resolveLatestProcessName,
  getProcess,
} from '../../transactions/transaction';

import { getMarketplaceEntities } from '../../ducks/marketplaceData.duck';
import { isScrollingDisabled } from '../../ducks/ui.duck';

import {
  IconSpinner,
  Page,
  LayoutSingleColumn,
} from '../../components';

import TopbarContainer from '../../containers/TopbarContainer/TopbarContainer';
import css from './VideoViewerPage.module.css';
import VideoViewPanel from './VideoViewerPanel/VideoViewerPanel.js';
import { userStartedWatchingPaidContent } from '../ListingPage/ListingPage.duck';
import { updateMetadata } from '../MyLibraryPage/MyLibraryPage.duck';
import { reviewNotificationToUser } from '../TransactionPage/TransactionPage.duck';
import { updateTheWatchlist } from './TransactionPage.duck.js';


// TransactionPage handles data loading for Sale and Order views to transaction pages in Inbox.
export const VideoViewerComponent = props => {
  const routeConfiguration = useRouteConfiguration();
  const {
    fetchTransactionError,
    history,
    intl,
    scrollingDisabled,
    transaction,
    transactionRole,
    callSetInitialValues,
    onInitializeCardPaymentData,
    transactionCollection,
    fetchTransactionCollectionInProgress,
    fetchTransactionCollectionError,
    transitionInProgress,
    onUserWatchingPaidContent,
    onUpdateMetadata,
    onReviewNotificationToUser,
    onUpdateTheWatchlist
  } = props;

  const { listing } = transaction || {};
  const isCustomerRole = transactionRole === CUSTOMER;

  const processName = resolveLatestProcessName(transaction?.attributes?.processName);
  let process = null;
  try {
    process = processName ? getProcess(processName) : null;
  } catch (error) {
    // Process was not recognized!
  }

  const isTxOnPaymentPending = tx => {
    return process ? process.getState(tx) === process.states.PENDING_PAYMENT : null;
  };

  const redirectToCheckoutPageWithInitialValues = (initialValues, currentListing) => {
    // Customize checkout page state with current listing and selected bookingDates
    const { setInitialValues } = findRouteByRouteName('CheckoutPage', routeConfiguration);
    callSetInitialValues(setInitialValues, initialValues);

    // Clear previous Stripe errors from store if there is any
    onInitializeCardPaymentData();

    // Redirect to CheckoutPage
    history.push(
      createResourceLocatorString(
        'CheckoutPage',
        routeConfiguration,
        { id: currentListing.id.uuid, slug: createSlug(currentListing.attributes.title) },
        {}
      )
    );
  };

  // If payment is pending, redirect to CheckoutPage
  if (
    transaction?.id &&
    isTxOnPaymentPending(transaction) &&
    isCustomerRole &&
    transaction.attributes.lineItems
  ) {

    const initialValues = {
      listing,
      // Transaction with payment pending should be passed to CheckoutPage
      transaction,
      // Original orderData content is not available,
      // but it is already saved since tx is in state: payment-pending.
      orderData: {},
    };

    redirectToCheckoutPageWithInitialValues(initialValues, listing);
  }


  const detailsClassName = classNames(css.tabContent, css.tabContentVisible);

  const fetchErrorMessage = isCustomerRole
    ? 'TransactionPage.fetchOrderFailed'
    : 'TransactionPage.fetchSaleFailed';
  const loadingMessage = isCustomerRole
    ? 'TransactionPage.loadingOrderData'
    : 'TransactionPage.loadingSaleData';


  return (
    <Page
      title={intl.formatMessage({ id: 'TransactionPage.schemaTitle' }, { title: listing?.attributes?.title })}
      scrollingDisabled={scrollingDisabled}
    >
      <LayoutSingleColumn topbar={<TopbarContainer />} mainColumnClassName={css.mainColumn}>
        <div className={css.root}>
          {(fetchTransactionCollectionInProgress || transitionInProgress) ? <div className={css.loading}>
            <FormattedMessage id={`${loadingMessage}`} />
            <IconSpinner />
          </div> : (fetchTransactionError || fetchTransactionCollectionError) ? (
            <p className={css.error}>
              <FormattedMessage id={`${fetchErrorMessage}`} />
            </p>
          ) : <VideoViewPanel
            className={detailsClassName}
            transactionCollection={transactionCollection}
            transaction={transaction}
            onUserWatchingPaidContent={onUserWatchingPaidContent}
            onUpdateMetadata={onUpdateMetadata}
            onReviewNotificationToUser={onReviewNotificationToUser}
            onUpdateTheWatchlist={onUpdateTheWatchlist}
          />}
        </div>
      </LayoutSingleColumn>
    </Page>
  );
};

VideoViewerComponent.defaultProps = {
  currentUser: null,
  fetchTransactionError: null,
  transitionInProgress: null,
  transitionError: null,
  transaction: null,
};

VideoViewerComponent.propTypes = {
  params: shape({ id: string }).isRequired,
  transactionRole: oneOf([PROVIDER, CUSTOMER]).isRequired,
  currentUser: propTypes.currentUser,
  fetchTransactionError: propTypes.error,
  transitionInProgress: string,
  scrollingDisabled: bool.isRequired,
  transaction: propTypes.transaction,
  // from withRouter
  history: shape({
    push: func.isRequired,
  }).isRequired,
  location: shape({
    search: string,
  }).isRequired,

  // from injectIntl
  intl: intlShape.isRequired,
};

const mapStateToProps = state => {
  const {
    fetchTransactionError,
    transactionRef,
    transactionCollection,
    fetchTransactionCollectionInProgress,
    fetchTransactionCollectionError,
    transitionInProgress
  } = state.TransactionPage;
  const { currentUser } = state.user;

  const transactions = getMarketplaceEntities(state, transactionRef ? [transactionRef] : []);
  const transaction = transactions.length > 0 ? transactions[0] : null;

  return {
    currentUser,
    fetchTransactionError,
    scrollingDisabled: isScrollingDisabled(state),
    transaction,
    transactionCollection,
    fetchTransactionCollectionInProgress,
    fetchTransactionCollectionError,
    transitionInProgress
  };
};

const mapDispatchToProps = dispatch => ({
  onUserWatchingPaidContent: (params) => dispatch(userStartedWatchingPaidContent(params)),
  onUpdateMetadata: (params) => dispatch(updateMetadata(params)),
  onReviewNotificationToUser: (params) => dispatch(reviewNotificationToUser(params)),
  onUpdateTheWatchlist: (params) => dispatch(updateTheWatchlist(params)),
});


const VideoViewerPage = compose(
  withRouter,
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
  injectIntl
)(VideoViewerComponent);

export default VideoViewerPage;
