import React from 'react';
import { bool, func, number, shape, string } from 'prop-types';
import { compose } from 'redux';
import { Form as FinalForm } from 'react-final-form';
import classNames from 'classnames';

// Import configs and util modules
import appSettings from '../../../../config/settings';
import { intlShape, injectIntl, FormattedMessage } from '../../../../util/reactIntl';
import { propTypes } from '../../../../util/types';
import * as validators from '../../../../util/validators';
import { formatMoney } from '../../../../util/currency';
import { types as sdkTypes } from '../../../../util/sdkLoader';

// Import shared components
import { Button, Form, FieldCurrencyInput, FieldRadioButton, FieldCheckbox } from '../../../../components';

// Import modules from this directory
import css from './EditListingPricingForm.module.css';
import { PRICE_TYPE_OWN, PRICE_TYPE_SUGGESTED } from '../../../../constants';
import IconCollection from '../../../../components/IconCollection/IconCollection';
import { Tooltip } from 'react-tooltip';

const { Money } = sdkTypes;

const getPriceValidators = (listingMinimumPriceSubUnits, marketplaceCurrency, intl) => {
  const priceRequiredMsgId = { id: 'EditListingPricingForm.priceRequired' };
  const priceRequiredMsg = intl.formatMessage(priceRequiredMsgId);
  const priceRequired = validators.required(priceRequiredMsg);

  const minPriceRaw = new Money(listingMinimumPriceSubUnits, marketplaceCurrency);
  const minPrice = formatMoney(intl, minPriceRaw);
  const priceTooLowMsgId = { id: 'EditListingPricingForm.priceTooLow' };
  const priceTooLowMsg = intl.formatMessage(priceTooLowMsgId, { minPrice });
  const minPriceRequired = validators.moneySubUnitAmountAtLeast(
    priceTooLowMsg,
    listingMinimumPriceSubUnits
  );

  return listingMinimumPriceSubUnits
    ? validators.composeValidators(priceRequired, minPriceRequired)
    : priceRequired;
};

export const EditListingPricingFormComponent = props => (
  <FinalForm
    {...props}
    keepDirtyOnReinitialize={true}
    render={formRenderProps => {
      const {
        formId,
        autoFocus,
        className,
        disabled,
        ready,
        handleSubmit,
        marketplaceCurrency,
        unitType,
        listingMinimumPriceSubUnits,
        intl,
        invalid,
        pristine,
        saveActionMsg,
        updated,
        updateInProgress,
        fetchErrors,
        listingFieldsConfig,
        values,
        pickSelectedCategories,
        onCreateDraftListing,
        setSaveDraftInProgress,
        saveDraftInProgress,
        isPublished
      } = formRenderProps;

      const { priceType, ownPrice, refundPolicy } = values;

      const addedOwnPrice = !!ownPrice && ownPrice.amount && ownPrice.currency;
      const selectedSuggestedPrice = priceType === PRICE_TYPE_SUGGESTED;

      const priceValidators = getPriceValidators(
        listingMinimumPriceSubUnits,
        marketplaceCurrency,
        intl,
      );

      const classes = classNames(css.root, className);
      const submitReady = (updated && pristine) || ready;
      const submitInProgress = updateInProgress;
      const { updateListingError, showListingsError } = fetchErrors || {};
      const submitDisabled = invalid || disabled || submitInProgress || refundPolicy?.length < 1;


      const priceLabel = (
        <div className={css.priceLabel}>
          <span><FormattedMessage id='EditListingPricingForm.priceInputLabel' /></span>
          <div>
            <div data-tooltip-id="priceTooltip" className={css.tooltip}>
              <IconCollection icon="icon-info" width="16px" height="16px" />
            </div>
            <Tooltip
              id="priceTooltip"
              place="right"
              content={intl.formatMessage({ id: "EditListingPricingForm.tooltipText" })}
            />
          </div>
        </div>
      );

      return (
        <Form onSubmit={handleSubmit} className={classes}>
          {updateListingError ? (
            <p className={css.error}>
              <FormattedMessage id="EditListingPricingForm.updateFailed" />
            </p>
          ) : null}
          {showListingsError ? (
            <p className={css.error}>
              <FormattedMessage id="EditListingPricingForm.showListingFailed" />
            </p>
          ) : null}
          {/* <div className={css.priceContainer}>
            <div>
              <p className={css.label}>
                <FormattedMessage id="EditListingPricingForm.suggestedPriceHeading" />
              </p>
              <FieldRadioButton
                id="suggested"
                name="priceType"
                label="$39.99"
                value={PRICE_TYPE_SUGGESTED}
                className={css.radioButton}
              />
            </div>
            <div>
              <p className={css.label}>
                <FormattedMessage id='EditListingPricingForm.customPriceHeading' />
              </p>
              <div className={css.radioButtonWithInput}>

                <FieldRadioButton
                  id="ownn"
                  name="priceType"
                  label=""
                  value={PRICE_TYPE_OWN}

                />
                <FieldCurrencyInput
                  id={`${formId}ownPrice`}
                  name="ownPrice"
                  autoFocus={autoFocus}
                  label={null}
                  placeholder={intl.formatMessage({ id: 'EditListingPricingForm.priceInputPlaceholder' })}
                  currencyConfig={appSettings.getCurrencyFormatting(marketplaceCurrency)}
                  // validate={(!values.pub_suggested_prices ? priceValidators : null)}
                  disabled={priceType === PRICE_TYPE_SUGGESTED}
                />
                <span className={css.editIcon}>
                  <IconCollection icon="icon-edit-input" />
                </span>
              </div>
            </div>
          </div> */}

          <div className={css.priceBox}>
            <FieldCurrencyInput
              id={`${formId}price`}
              name="price"
              autoFocus={autoFocus}
              label={priceLabel}
              placeholder={intl.formatMessage({ id: 'EditListingPricingForm.priceInputPlaceholder' })}
              currencyConfig={appSettings.getCurrencyFormatting(marketplaceCurrency)}
              validate={priceValidators}
            />
          </div>
          <div>
            <p className={css.refundPolicyHeading}> <FormattedMessage id='EditListingPricingForm.refunPolicyHeading' /></p>
            <div className={css.refundPolicyContainer}>
              <p className={css.refundPolicySubHeading}> <FormattedMessage id='EditListingPricingForm.refundPolicySubHeading' /> </p>
              <p className={css.refundPolicyText}> <FormattedMessage id='EditListingPricingForm.refundPolicyText' /> </p>
              <FieldCheckbox
                className={css.refundPolicyCheckbox}
                id="refundPolicy"
                name="refundPolicy"
                label={intl.formatMessage({ id: "EditListingPricingForm.refundFieldLabel" })}
                value="accepted"
                validate={validators.required(
                  intl.formatMessage({ id: "EditListingPricingForm.refundRequired" })
                )}
                variant="yellow"
              />
            </div>
          </div>
          <div className={css.buttonsGroup}>

            {!isPublished ? (
              <Button
                className={css.saveDraftButton}
                type="button"
                inProgress={saveDraftInProgress}
                disabled={submitDisabled}
                ready={submitReady}
                onClick={() => {
                  setSaveDraftInProgress(true)
                  onCreateDraftListing(values)
                }}
              >
                <FormattedMessage id="EditListingDetailsForm.saveAsDraft" />
              </Button>
            ) : null}

            <Button
              className={css.submitButton}
              type="submit"
              inProgress={submitInProgress && !saveDraftInProgress}
              disabled={submitDisabled}
              ready={submitReady}
            >
              <span>{saveActionMsg}</span>
            </Button>
          </div>
        </Form>
      );
    }}
  />
);

EditListingPricingFormComponent.defaultProps = {
  fetchErrors: null,
  listingMinimumPriceSubUnits: 0,
  formId: 'EditListingPricingForm',
};

EditListingPricingFormComponent.propTypes = {
  formId: string,
  intl: intlShape.isRequired,
  onSubmit: func.isRequired,
  marketplaceCurrency: string.isRequired,
  unitType: string.isRequired,
  listingMinimumPriceSubUnits: number,
  saveActionMsg: string.isRequired,
  disabled: bool.isRequired,
  ready: bool.isRequired,
  updated: bool.isRequired,
  updateInProgress: bool.isRequired,
  fetchErrors: shape({
    showListingsError: propTypes.error,
    updateListingError: propTypes.error,
  }),
};

export default compose(injectIntl)(EditListingPricingFormComponent);
