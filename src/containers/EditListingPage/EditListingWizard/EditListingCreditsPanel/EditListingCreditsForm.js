import React, { useState } from 'react';
import { bool, func, number, shape, string } from 'prop-types';
import { compose } from 'redux';
import { Form as FinalForm } from 'react-final-form';
import classNames from 'classnames';

// Import configs and util modules
import { intlShape, injectIntl, FormattedMessage } from '../../../../util/reactIntl';
import { CUSTOM_ROLE, propTypes } from '../../../../util/types';
import * as validators from '../../../../util/validators';
import { formatMoney } from '../../../../util/currency';
import { types as sdkTypes } from '../../../../util/sdkLoader';

// Import shared components
import { Button, Form, FieldCurrencyInput, FieldTextInput } from '../../../../components';

// Import modules from this directory
import css from './EditListingCreditsForm.module.css';
import { FieldSelectCategory } from '../EditListingDetailsPanel/EditListingDetailsForm';
import IconCollection from '../../../../components/IconCollection/IconCollection';
import { getLabel } from '../../../../util/dataExtractor';

const NAME_MAX_LENGTH = 100;
const NAME_MIN_LENGTH = 2;

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

export const EditListingCreditsFormComponent = props => (
  <FinalForm
    {...props}
    render={formRenderProps => {
      const {
        formId,
        className,
        disabled,
        ready,
        handleSubmit,
        intl,
        invalid,
        pristine,
        saveActionMsg,
        updated,
        updateInProgress,
        fetchErrors,
        values,
        form,
        selectableCategories,
        categoryPrefix,
        autofocus,
      } = formRenderProps;

      const { name, mainRole, subRole, customRole, castAndCrews } = values || {};
      const [castCrews, setcastCrews] = useState(castAndCrews?.length ? castAndCrews : []);
      const [allCategoriesChosen, setAllCategoriesChosen] = useState(false);
      const classes = classNames(css.root, className);
      const submitReady = (updated && pristine) || ready;
      const submitInProgress = updateInProgress;
      const submitDisabled = invalid || disabled || submitInProgress;
      const { updateListingError, showListingsError } = fetchErrors || {};

      const maxLengthMessage = intl.formatMessage(
        { id: 'EditListingDetailsForm.maxLength' },
        {
          maxLength: NAME_MAX_LENGTH,
        }
      );
      const maxLength60Message = validators.maxLength(maxLengthMessage, NAME_MAX_LENGTH);

      const minLengthMessage = intl.formatMessage(
        { id: 'EditListingDetailsForm.minLength' },
        {
          minLength: NAME_MIN_LENGTH,
        }
      );
      const minLength60Message = validators.minLength(minLengthMessage, NAME_MIN_LENGTH);

      return (
        <Form onSubmit={handleSubmit} >
          <div className={classes}>

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
            <div>
              <h5 className={css.heading}>
                <FormattedMessage id="EditListingCreditsForm.heading" />
              </h5>
              <div className={css.addForm}>

                <FieldTextInput
                  id={`${formId}name`}
                  name="name"
                  className={css.description}
                  type="text"
                  label={intl.formatMessage({ id: 'EditListingCreditsForm.name' })}
                  maxLength={NAME_MAX_LENGTH}
                  minLength={NAME_MIN_LENGTH}
                  validate={(subRole && autofocus) ? validators.composeValidators(maxLength60Message, minLength60Message) : null}
                />


                <FieldSelectCategory
                  values={values}
                  prefix={categoryPrefix}
                  listingCategories={selectableCategories}
                  formApi={form}
                  intl={intl}
                  allCategoriesChosen={allCategoriesChosen}
                  setAllCategoriesChosen={setAllCategoriesChosen}
                  tab={'credits'}
                />

                <Button type="button" disabled={!name || !subRole || (subRole == CUSTOM_ROLE && (!customRole || customRole.length < NAME_MIN_LENGTH)) || (name.length < NAME_MIN_LENGTH) || submitDisabled} onClick={() => {
                  setcastCrews((previous) => [
                    ...previous,
                    { name, roles: { mainRole, subRole: subRole == CUSTOM_ROLE ? customRole : subRole } }
                  ]);

                  form.batch(() => {
                    form.change('castAndCrews', [...castCrews, { name, roles: { mainRole, subRole: subRole == CUSTOM_ROLE ? customRole : subRole } }]);
                    form.change('name', null);
                    form.change('subRole', null);
                  })
                }}
                  className={css.addButton}
                >
                  <IconCollection icon="icon-plus" />
                </Button>
              </div>

              {subRole == CUSTOM_ROLE &&
                <FieldTextInput
                  id={`${formId}customRole`}
                  name="customRole"
                  className={css.description}
                  type="text"
                  label={intl.formatMessage({ id: 'EditListingCreditsForm.customRole' })}
                  maxLength={NAME_MAX_LENGTH}
                  validate={validators.composeValidators(maxLength60Message, minLength60Message)}
                />}

              <div className={css.castCrews}>
                {castCrews && castCrews.length > 0 && castCrews.map((crew, index) => (
                  <div className={css.castCrewItem}>
                    <span className={css.point}></span>
                    <span key={index} className={css.castCrewName}>
                      {crew.name} | {getLabel(selectableCategories, crew.roles.subRole)}
                    </span>
                    <span onClick={() => {
                      const updatedCastCrews = castCrews.filter((_, i) => i !== index);
                      setcastCrews(updatedCastCrews);
                      const {name, roles} = castCrews[index] || {};
                      form.batch(() => {
                        form.change('name', name);
                        form.change('subRole', roles.subRole);
                        form.change('castAndCrews', updatedCastCrews);
                      });
                    }}
                      className={css.closeButton}
                    >
                      <IconCollection icon="icon-edit" />
                    </span>
                    <span onClick={() => {
                      const updatedCastCrews = castCrews.filter((_, i) => i !== index);
                      setcastCrews(updatedCastCrews);
                      form.change('castAndCrews', updatedCastCrews);
                    }}
                      className={css.closeButton}
                    >
                      <IconCollection icon="icon-close-white" />
                    </span>
                  </div>
                ))}
              </div>

            </div>
          </div>
          <Button
            className={css.submitButton}
            type="submit"
            inProgress={submitInProgress}
            disabled={submitDisabled}
            ready={submitReady}
          >
            <span>{saveActionMsg}</span>
          </Button>
        </Form>
      );
    }}
  />
);

EditListingCreditsFormComponent.defaultProps = {
  fetchErrors: null,
  listingMinimumPriceSubUnits: 0,
  formId: 'EditListingPricingForm',
};

EditListingCreditsFormComponent.propTypes = {
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

export default compose(injectIntl)(EditListingCreditsFormComponent);
