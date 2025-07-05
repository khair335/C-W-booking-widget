import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

// Import configs and util modules
import { FormattedMessage } from '../../../../util/reactIntl';
import { LISTING_STATE_DRAFT, ROLE } from '../../../../util/types';
import { types as sdkTypes } from '../../../../util/sdkLoader';

// Import shared components
import { H3, ListingLink } from '../../../../components';

// Import modules from this directory
import css from './EditListingCreditsPanel.module.css';
import EditListingCreditsForm from './EditListingCreditsForm';
import { pickCategoryFields } from '../../../../util/fieldHelpers';
import Swal from 'sweetalert2';
import { LISTING_STATE_PUBLISHED } from '../../../../constants';

const { Money } = sdkTypes;

const getInitialValues = params => {
  const { listing } = params;
  const { price, publicData } = listing?.attributes || {};
  const { castAndCrews } = publicData || {};

  return { price, castAndCrews };
};

const EditListingCreditsPanel = props => {
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
    listingAssetsStatus
  } = props;

  const classes = classNames(rootClassName || css.root, className);
  const initialValues = getInitialValues(props);
  const priceCurrencyValid =
    marketplaceCurrency && initialValues.price instanceof Money
      ? initialValues.price.currency === marketplaceCurrency
      : !!marketplaceCurrency;
  const unitType = listing?.attributes?.publicData?.unitType;

  const { publicData, state } = listing?.attributes || {};
  const { listingType, markAsDraft, deletedListing } = publicData || {};
  const listingFields = config.listing.listingFields;
  const listingCategories = config.categoryConfiguration.categories;
  const categoryKey = config.categoryConfiguration.key;

  const canCreateNew = (state === LISTING_STATE_PUBLISHED) && (listingAssetsStatus?.isReady === true) && !deletedListing && !markAsDraft;
  return (
    <div className={classes}>
      <H3 as="h1" className={css.heading}>
        {/* {isPublished ? (
          <FormattedMessage
            id="EditListingPricingPanel.title"
            values={{ listingTitle: <ListingLink listing={listing} />, lineBreak: <br /> }}
          />
        ) : ( */}
        <FormattedMessage
          id="EditListingCreditsPanel.createListingTitle"
          values={{ lineBreak: <br /> }}
        />
        {/* )} */}
      </H3>
      <div className={css.subHeading}>
        <span>
          <FormattedMessage id="EditListingCreditsPanel.subTitle" />
        </span>
      </div>
      {priceCurrencyValid ? (
        <EditListingCreditsForm
          className={css.form}
          initialValues={initialValues}
          onSubmit={values => {
            const { castAndCrews } = values;

            // New values for listing attributes
            const updateValues = {
              publicData: {
                castAndCrews,
                makeOptional: castAndCrews?.length > 0 ? "no" : "yes"
              },
            };
            if (canCreateNew) {
              let newVersion = false;
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
              }).then((val) => {
                if (val.isConfirmed) {
                  newVersion = true;
                };
                onSubmit({ ...updateValues, newVersion });
              });
            } else {
              onSubmit(updateValues);
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
          listingType={listingType}
          listingFieldsConfig={listingFields}
          selectableCategories={listingCategories}
          categoryPrefix={categoryKey}
          pickSelectedCategories={values =>
            pickCategoryFields(values, categoryKey, 1, listingCategories)
          }
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

EditListingCreditsPanel.defaultProps = {
  className: null,
  rootClassName: null,
  listing: null,
};

EditListingCreditsPanel.propTypes = {
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

export default EditListingCreditsPanel;
