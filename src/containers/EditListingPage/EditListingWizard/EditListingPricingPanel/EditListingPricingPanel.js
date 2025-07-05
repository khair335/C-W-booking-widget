import React, { useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

// Import configs and util modules
import { FormattedMessage } from '../../../../util/reactIntl';
import { LISTING_STATE_DRAFT, PRICES, REFUND_POLICY } from '../../../../util/types';
import { types as sdkTypes } from '../../../../util/sdkLoader';

// Import shared components
import { H3, ListingLink } from '../../../../components';

// Import modules from this directory
import EditListingPricingForm from './EditListingPricingForm';
import { LISTING_STATE_PUBLISHED, PRICE_TYPE_OWN } from '../../../../constants';
import { pickCategoryFields } from '../../../../util/fieldHelpers';
import css from './EditListingPricingPanel.module.css';
import Swal from 'sweetalert2';

const { Money } = sdkTypes;

const getInitialValues = params => {
  const { listing } = params;
  const { price, publicData } = listing?.attributes || {};
  const { listingType, refundPolicy, ownPrice, priceType } = publicData || {};

  return {
    price,
    // listingType,
    // ownPrice: (ownPrice ? new Money(ownPrice * 100, price.currency) : null),
    // priceType: !!priceType ? priceType : PRICE_TYPE_OWN,
    refundPolicy
  };
};

const EditListingPricingPanel = props => {
  const [saveDraftInProgress, setSaveDraftInProgress] = useState(false);
  const {
    className,
    rootClassName,
    listing,
    marketplaceCurrency,
    listingMinimumPriceSubUnits,
    disabled,
    ready,
    onSubmit,
    submitButtonText,
    panelUpdated,
    updateInProgress,
    errors,
    config,
    history,
    listingAssetsStatus
  } = props;

  const { id, attributes } = listing || {};
  const { publicData, state } = attributes || {};
  const { unitType, markAsDraft, deletedListing } = publicData;
  const classes = classNames(rootClassName || css.root, className);
  const initialValues = getInitialValues(props);
  const isPublished = id && state !== LISTING_STATE_DRAFT;
  const priceCurrencyValid =
    marketplaceCurrency && initialValues.price instanceof Money
      ? initialValues.price.currency === marketplaceCurrency
      : !!marketplaceCurrency;
  const listingFields = config.listing.listingFields;
  const categoryKey = config.categoryConfiguration.key;
  const canCreateNew = (state === LISTING_STATE_PUBLISHED) && (listingAssetsStatus?.isReady === true) && !markAsDraft && !deletedListing;
  const onUpdatedValues = (values, saveAsDrat = false, newVersion) => {
    // const suggestedPrice = 3999; //in cents replace with suggested price When available
    // const { ownPrice, priceType, refundPolicy } = values;
    const { price, refundPolicy } = values;

    const stockUpdateMaybe = {
      stockUpdate: {
        oldTotal: null,
        newTotal: 1,
      },
    };

    // const finalPrice = priceType === PRICE_TYPE_OWN ? ownPrice : new Money(suggestedPrice, config.currency);
    const updateValues = {
      price,
      publicData: {
        // suggestedPrice: suggestedPrice,
        // ...(ownPrice?.amount ? { ownPrice: ownPrice.amount / 100 } : {}),
        // priceType,
        refundPolicy
      },
      newVersion,
      ...stockUpdateMaybe
    };

    onSubmit(updateValues).then(() => {
      if (saveAsDrat) {
        history.push('/listings')
      }
    })
  };

  return (
    <div className={classes}>
      <H3 as="h1" className={css.title}>
        {isPublished ? (
          <FormattedMessage
            id="EditListingPricingPanel.title"
            values={{ listingTitle: <ListingLink listing={listing} />, lineBreak: <br /> }}
          />
        ) : (
          <FormattedMessage
            id="EditListingPricingPanel.createListingTitle"
            values={{ lineBreak: <br /> }}
          />
        )}
      </H3>

      {priceCurrencyValid ? (
        <EditListingPricingForm
          className={css.form}
          initialValues={initialValues}
          onSubmit={values => {
            if (canCreateNew) {
              Swal.fire({
                title: "Want to create a new version?",
                text: "Are you sure you want to create a new version?",
                showCancelButton: true,
                confirmButtonText: "Create New Version",
                cancelButtonText: "Update Existing Version",
                customClass: {
                  confirmButton: `${css.confirmButton}`,
                  cancelButton: `${css.cancelButton}`,
                },
              }).then((result) => {
                if (result.isConfirmed) {
                  onUpdatedValues(values, false, true);
                } else {
                  onUpdatedValues(values);
                }
              })
            } else {
              onUpdatedValues(values);
            }
          }}
          marketplaceCurrency={marketplaceCurrency}
          unitType={unitType}
          listingMinimumPriceSubUnits={listingMinimumPriceSubUnits}
          saveActionMsg={submitButtonText}
          disabled={disabled}
          ready={ready}
          updated={panelUpdated}
          updateInProgress={updateInProgress}
          fetchErrors={errors}
          listingFieldsConfig={listingFields.filter((e) => [PRICES, REFUND_POLICY].includes(e.key))}
          pickSelectedCategories={values =>
            pickCategoryFields(values, categoryKey, 1, [])
          }
          onCreateDraftListing={values => {
            onUpdatedValues(values, true);
          }}
          setSaveDraftInProgress={setSaveDraftInProgress}
          saveDraftInProgress={saveDraftInProgress}
          isPublished={isPublished}
        />
      ) : (
        <div className={css.priceCurrencyInvalid}>
          <FormattedMessage
            id="EditListingPricingPanel.listingPriceCurrencyInvalid"
            values={{ marketplaceCurrency }}
          />
        </div>
      )}
    </div>
  );
};

const { func, object, string, bool } = PropTypes;

EditListingPricingPanel.defaultProps = {
  className: null,
  rootClassName: null,
  listing: null,
};

EditListingPricingPanel.propTypes = {
  className: string,
  rootClassName: string,

  // We cannot use propTypes.listing since the listing might be a draft.
  listing: object,

  disabled: bool.isRequired,
  ready: bool.isRequired,
  onSubmit: func.isRequired,
  submitButtonText: string.isRequired,
  panelUpdated: bool.isRequired,
  updateInProgress: bool.isRequired,
  errors: object.isRequired,
};

export default EditListingPricingPanel;
