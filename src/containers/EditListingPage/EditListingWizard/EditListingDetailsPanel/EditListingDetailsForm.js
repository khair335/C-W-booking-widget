import React, { useState, useEffect } from 'react';
import { arrayOf, bool, func, shape, string } from 'prop-types';
import { compose } from 'redux';
import { Field, Form as FinalForm } from 'react-final-form';
import arrayMutators from 'final-form-arrays';
import classNames from 'classnames';

// Import util modules
import { intlShape, injectIntl, FormattedMessage } from '../../../../util/reactIntl';
import { CREDITS, EXTENDED_DATA_SCHEMA_TYPES, PROFILE, propTypes } from '../../../../util/types';
import { isFieldForCategory, isFieldForListingType } from '../../../../util/fieldHelpers';
import { maxLength, required, composeValidators, minLength } from '../../../../util/validators';

// Import shared components
import {
  Form,
  Button,
  FieldSelect,
  FieldTextInput,
  Heading,
  CustomExtendedDataField,
  ValidationError,
} from '../../../../components';
// Import modules from this directory
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // import styles for react-quill

import css from './EditListingDetailsForm.module.css';
import { getLabel } from '../../../../util/dataExtractor';

import { NUMBER_OF_EPISODES, LISTING_TYPE_FILMS, LISTING_TYPE_SERIES } from '../../../../constants';

const TITLE_MAX_LENGTH = 100;
const TITLE_MIN_LENGTH = 1;
const DESCRIPTION_MAX_LENGTH = 500;
const DESCRIPTION_MIN_LENGTH = 50;
const SERIES_DESCRIPTION_MIN_LENGTH = 50;
const SERIES_DESCRIPTION_MAX_LENGTH = 1000;


function moveEpisodesToLast(array) {
  // Separate episodes and non-episodes
  const episodes = array.filter(item => item.key === NUMBER_OF_EPISODES);
  const nonEpisodes = array.filter(item => item.key !== NUMBER_OF_EPISODES);

  // Concatenate non-episodes with episodes
  return [...nonEpisodes, ...episodes];
}

// Show various error messages
const ErrorMessage = props => {
  const { fetchErrors } = props;
  const { updateListingError, createListingDraftError, showListingsError } = fetchErrors || {};
  const errorMessage = updateListingError ? (
    <FormattedMessage id="EditListingDetailsForm.updateFailed" />
  ) : createListingDraftError ? (
    <FormattedMessage id="EditListingDetailsForm.createListingDraftError" />
  ) : showListingsError ? (
    <FormattedMessage id="EditListingDetailsForm.showListingFailed" />
  ) : null;

  if (errorMessage) {
    return <p className={css.error}>{errorMessage}</p>;
  }
  return null;
};

// Hidden input field
const FieldHidden = props => {
  const { name } = props;
  return (
    <Field id={name} name={name} type="hidden" className={css.unitTypeHidden}>
      {fieldRenderProps => <input {...fieldRenderProps?.input} />}
    </Field>
  );
};

// Field component that either allows selecting listing type (if multiple types are available)
// or just renders hidden fields:
// - listingType              Set of predefined configurations for each listing type
// - transactionProcessAlias  Initiate correct transaction against Marketplace API
// - unitType                 Main use case: pricing unit
const FieldSelectListingType = props => {
  const {
    name,
    listingTypes,
    hasExistingListingType,
    onListingTypeChange,
    formApi,
    formId,
    intl,
  } = props;
  const hasMultipleListingTypes = listingTypes?.length > 1;

  const handleOnChange = value => {
    const selectedListingType = listingTypes.find(config => config.listingType === value);
    formApi.change('transactionProcessAlias', selectedListingType.transactionProcessAlias);
    formApi.change('unitType', selectedListingType.unitType);

    if (onListingTypeChange) {
      onListingTypeChange(selectedListingType);
    }
  };
  const getListingTypeLabel = listingType => {
    const listingTypeConfig = listingTypes.find(config => config.listingType === listingType);
    return listingTypeConfig ? listingTypeConfig.label : listingType;
  };

  return hasMultipleListingTypes && !hasExistingListingType ? (
    <>
      <FieldSelect
        id={formId ? `${formId}.${name}` : name}
        name={name}
        className={css.listingTypeSelect}
        label={intl.formatMessage({ id: 'EditListingDetailsForm.listingTypeLabel' })}
        validate={required(
          intl.formatMessage({ id: 'EditListingDetailsForm.listingTypeRequired' })
        )}
        onChange={handleOnChange}
      >
        <option disabled value="">
          {intl.formatMessage({ id: 'EditListingDetailsForm.listingTypePlaceholder' })}
        </option>
        {listingTypes.map(config => {
          const type = config.listingType;
          return (
            <option key={type} value={type}>
              {config.label}
            </option>
          );
        })}
      </FieldSelect>
      <FieldHidden name="transactionProcessAlias" />
      <FieldHidden name="unitType" />
    </>
  ) : hasMultipleListingTypes && hasExistingListingType ? (
    <div className={css.listingTypeSelect}>
      <Heading as="h5" rootClassName={css.selectedLabel}>
        {intl.formatMessage({ id: 'EditListingDetailsForm.listingTypeLabel' })}
      </Heading>
      <p className={css.selectedValue}>{getListingTypeLabel(formApi.getFieldState(name)?.value)}</p>
      <FieldHidden name={name} />
      <FieldHidden name="transactionProcessAlias" />
      <FieldHidden name="unitType" />
    </div>
  ) : (
    <>
      <FieldHidden name={name} />
      <FieldHidden name="transactionProcessAlias" />
      <FieldHidden name="unitType" />
    </>
  );
};

// Finds the correct subcategory within the given categories array based on the provided categoryIdToFind.
const findCategoryConfig = (categories, categoryIdToFind) => {
  return categories?.find(category => category.id === categoryIdToFind);
};

/**
 * Recursively render subcategory field inputs if there are subcategories available.
 * This function calls itself with updated props to render nested category fields.
 * The select field is used for choosing a category or subcategory.
 */
const CategoryField = props => {
  const { currentCategoryOptions, level, values, prefix, handleCategoryChange, intl, tab, isRoleSelected, setIsRoleSelected, formApi } = props;

  const currentCategoryKey = `${prefix}${level}`;

  const categoryConfig = findCategoryConfig(currentCategoryOptions, values[`${prefix}${level}`]);

  return (
    <>
      {
        ([CREDITS, PROFILE].includes(tab)) ?
          <div className={css.creditsSelectWrapper}>
            <label>{tab == CREDITS ? <FormattedMessage id="EditListingDetailsForm.label1" /> : <FormattedMessage id="ProfileSettingsForm.professionalRoleLabel" />}</label>
            <div className={classNames(css.creditsSelect, values && values.subRole && css.textSelected)} onClick={() => {
              setIsRoleSelected(!isRoleSelected);
            }}>
              {values && values.subRole ? <span>{getLabel(currentCategoryOptions, values.subRole)}</span> : <span >
                select
              </span>}
            </div>
            {isRoleSelected ? <div onClick={() => {
              setIsRoleSelected(false);
            }} className={css.creditsSelectDropdown}>
              {currentCategoryOptions && currentCategoryOptions.map((category, index) => {
                return (
                  <div key={index} className={css.creditsSelectDropdownItem}>
                    <span>{category.name}</span>

                    <div className={css.creditsSelectDropdownItemSub}>
                      {category.subcategories && category.subcategories.map((subcategory, subIndex) => (
                        <><span key={subIndex} onClick={() => {
                          formApi.change('mainRole', category.id)
                          formApi.change('subRole', subcategory.id)
                        }}
                          className={classNames(values && values.subRole == subcategory.id ? css.active : null
                          )}
                        >{subcategory.name}</span>
                        </>
                      ))}
                    </div>
                    <br />
                  </div>
                );
              })}
              <sapn></sapn>
            </div>
              :
              null}
          </div> :
          <>
            {currentCategoryOptions ? (
              <FieldSelect
                key={currentCategoryKey}
                id={currentCategoryKey}
                name={currentCategoryKey}
                className={css.listingTypeSelect}
                onChange={event => handleCategoryChange(event, level, currentCategoryOptions)}
                label={intl.formatMessage(
                  { id: 'EditListingDetailsForm.categoryLabel' },
                  { categoryLevel: currentCategoryKey }
                )}
                validate={required(
                  intl.formatMessage(
                    { id: 'EditListingDetailsForm.categoryRequired' },
                    { categoryLevel: currentCategoryKey }
                  )
                )}
              >
                <option disabled value="">
                  {intl.formatMessage(
                    { id: 'EditListingDetailsForm.categoryPlaceholder' },
                    { categoryLevel: currentCategoryKey }
                  )}
                </option>

                {currentCategoryOptions.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </FieldSelect>
            ) : null}

            {categoryConfig?.subcategories?.length > 0 ? (
              <CategoryField
                currentCategoryOptions={categoryConfig.subcategories}
                level={level + 1}
                values={values}
                prefix={prefix}
                handleCategoryChange={handleCategoryChange}
                intl={intl}
              />
            ) : null}
          </>
      }
    </>
  );
};

export const FieldSelectCategory = props => {
  useEffect(() => {
    checkIfInitialValuesExist();
  }, []);

  const [isRoleSelected, setIsRoleSelected] = useState(false);

  const { prefix, listingCategories, formApi, intl, setAllCategoriesChosen, values, tab } = props;

  // Counts the number of selected categories in the form values based on the given prefix.
  const countSelectedCategories = () => {
    return Object.keys(values).filter(key => key.startsWith(prefix)).length;
  };

  // Checks if initial values exist for categories and sets the state accordingly.
  // If initial values exist, it sets `allCategoriesChosen` state to true; otherwise, it sets it to false
  const checkIfInitialValuesExist = () => {
    const count = countSelectedCategories(values, prefix);
    setAllCategoriesChosen(count > 0);
  };

  // If a parent category changes, clear all child category values
  const handleCategoryChange = (category, level, currentCategoryOptions) => {
    const selectedCatLenght = countSelectedCategories();
    if (level < selectedCatLenght) {
      for (let i = selectedCatLenght; i > level; i--) {
        formApi.change(`${prefix}${i}`, null);
      }
    }
    const categoryConfig = findCategoryConfig(currentCategoryOptions, category).subcategories;
    setAllCategoriesChosen(!categoryConfig || categoryConfig.length === 0);
  };

  return (
    <CategoryField
      currentCategoryOptions={listingCategories}
      level={1}
      values={values}
      prefix={prefix}
      handleCategoryChange={handleCategoryChange}
      intl={intl}
      tab={tab}
      setIsRoleSelected={setIsRoleSelected}
      isRoleSelected={isRoleSelected}
      formApi={formApi}
    />
  );
};

// Add collect data for listing fields (both publicData and privateData) based on configuration
export const AddListingFields = props => {
  const { listingType, listingFieldsConfig, selectedCategories, formId, intl, values, isDetailTab = false, isPublished } = props;
  const targetCategoryIds = Object.values(selectedCategories);

  // Custom order for the fields
  const updatedConfig = moveEpisodesToLast(listingFieldsConfig)

  const fields = updatedConfig.reduce((pickedFields, fieldConfig) => {
    const { key, schemaType, scope } = fieldConfig || {};
    const namespacedKey = scope === 'public' ? `pub_${key}` : `priv_${key}`;

    const isKnownSchemaType = EXTENDED_DATA_SCHEMA_TYPES.includes(schemaType);
    const isProviderScope = ['public', 'private'].includes(scope);
    const isTargetListingType = isFieldForListingType(listingType, fieldConfig);
    const isTargetCategory = isFieldForCategory(targetCategoryIds, fieldConfig);

    return isKnownSchemaType && isProviderScope && isTargetListingType && isTargetCategory
      ? [
        ...pickedFields,
        <div key={namespacedKey} className={classNames(isDetailTab && css.fieldContainer, key === NUMBER_OF_EPISODES ? css.episodeCount : '')}>
          <CustomExtendedDataField
            listingType={listingType}
            name={namespacedKey}
            fieldConfig={fieldConfig}
            defaultRequiredMessage={intl.formatMessage({
              id: 'EditListingDetailsForm.defaultRequiredMessage',
            })}
            formId={formId}
            intl={intl}
            values={values}
            isPublished={isPublished}
          />
        </div>
      ]
      : pickedFields;
  }, []);

  return <div className={classNames(isDetailTab && css.gridLayout)}>{fields}</div>;
};



// Form that asks title, description, transaction process and unit type for pricing
// In addition, it asks about custom fields according to marketplace-custom-config.js
const EditListingDetailsFormComponent = props => (
  <FinalForm
    {...props}
    keepDirtyOnReinitialize={true}
    mutators={{ ...arrayMutators }}
    render={formRenderProps => {
      const {
        autoFocus,
        className,
        disabled,
        ready,
        formId,
        form: formApi,
        handleSubmit,
        onListingTypeChange,
        intl,
        invalid,
        pristine,
        selectableListingTypes,
        selectableCategories,
        hasExistingListingType,
        pickSelectedCategories,
        categoryPrefix,
        saveActionMsg,
        updated,
        updateInProgress,
        fetchErrors,
        listingFieldsConfig,
        values,
        onCreateDraftListing,
        setSaveDraftInProgress,
        saveDraftInProgress,
        createListingDraftInProgress,
        publicData,
        isPublished
      } = formRenderProps;


      const { listingType, transactionProcessAlias, unitType } = values;

      const titleRequiredMessage = intl.formatMessage({
        id: 'EditListingDetailsForm.titleRequired',
      });
      const maxLengthMessage = intl.formatMessage(
        { id: 'EditListingDetailsForm.maxLength' },
        {
          maxLength: TITLE_MAX_LENGTH,
        }
      );
      const maxLength60Message = maxLength(maxLengthMessage, TITLE_MAX_LENGTH);

      const minLengthMessage = intl.formatMessage(
        { id: 'EditListingDetailsForm.minLength' },
        {
          minLength: TITLE_MIN_LENGTH,
        }
      );
      const minLength60Message = minLength(minLengthMessage, TITLE_MIN_LENGTH);

      const descriptionMaxLength = listingType === LISTING_TYPE_SERIES
        ? SERIES_DESCRIPTION_MAX_LENGTH
        : DESCRIPTION_MAX_LENGTH;

      const descriptionMinimumLength = listingType === LISTING_TYPE_SERIES
        ? SERIES_DESCRIPTION_MIN_LENGTH
        : DESCRIPTION_MIN_LENGTH;

      const maxDescriptionMessage = intl.formatMessage(
        { id: 'EditListingDetailsForm.maxLength' },
        {
          maxLength: descriptionMaxLength,
        }
      );
      const minDescriptionMessage = intl.formatMessage(
        { id: 'EditListingDetailsForm.desMinLength' },
        {
          minLength: descriptionMinimumLength,
        }
      );
      const maxDescriptionValidator = maxLength(maxDescriptionMessage, descriptionMaxLength);

      const minDescriptionValidator = minLength(minDescriptionMessage, descriptionMinimumLength);

      const hasCategories = selectableCategories && selectableCategories.length > 0;
      const showCategories = listingType && hasCategories;

      const showTitle = hasCategories ? allCategoriesChosen : listingType;
      const showDescription = hasCategories ? allCategoriesChosen : listingType;
      const showListingFields = hasCategories ? allCategoriesChosen : listingType;

      const classes = classNames(css.root, className);
      const submitReady = (updated && pristine) || ready;
      const submitInProgress = updateInProgress;
      const hasMandatoryListingTypeData = listingType && transactionProcessAlias && unitType;
      const submitDisabled = invalid || disabled || submitInProgress || !hasMandatoryListingTypeData;

      const listingTitleLabel = listingType === LISTING_TYPE_SERIES
        ? 'Series Name*'
        : LISTING_TYPE_FILMS
          ? 'Film Name*'
          : '';

      const listingDesLabel = listingType === LISTING_TYPE_SERIES
        ? 'Series Description*'
        : LISTING_TYPE_FILMS
          ? 'Film Description*'
          : '';

      const listingTitlePlaceholder = listingType === LISTING_TYPE_SERIES
        ? 'type the name of your series here'
        : LISTING_TYPE_FILMS
          ? 'type the name of your film here'
          : '';

      const descriptionValidators = composeValidators(minDescriptionValidator, maxDescriptionValidator);

      return (
        <Form className={classes} onSubmit={handleSubmit}>
          <ErrorMessage fetchErrors={fetchErrors} />

          {showTitle ? (
            <FieldTextInput
              id={`${formId}title`}
              name="title"
              className={css.title}
              type="text"
              label={listingTitleLabel}
              placeholder={listingTitlePlaceholder}
              maxLength={TITLE_MAX_LENGTH}
              validate={composeValidators(required(titleRequiredMessage), maxLength60Message, minLength60Message)}
              autoFocus={autoFocus}
              // disabled={publicData?.hasTransaction ? true : false}
            />
          ) : null}

          {showListingFields ? (
            <AddListingFields
              listingType={listingType}
              listingFieldsConfig={listingFieldsConfig}
              selectedCategories={pickSelectedCategories(values)}
              formId={formId}
              intl={intl}
              values={values}
              isDetailTab={true}
              isPublished={isPublished}
            />
          ) : null}

          {showDescription ? (
            <Field name="description" validate={descriptionValidators}>
              {({ input, meta }) => {
                return (
                  <div className={css.description}>
                    <label>{listingDesLabel}</label>
                    <ReactQuill
                      value={input.value || ''}
                      onChange={input.onChange}
                      {...input}
                      placeholder={intl.formatMessage({
                        id: 'EditListingDetailsForm.descriptionPlaceholder',
                      })}
                    />
                    <ValidationError fieldMeta={meta} />
                  </div>
                )
              }}
            </Field>
          ) : null}
          <div className={css.buttonsGroup}>
            {!isPublished ? (
              <Button
                className={css.saveDraftButton}
                type="button"
                inProgress={saveDraftInProgress && createListingDraftInProgress}
                disabled={submitDisabled}
                ready={submitReady}
                onClick={() => {
                  setSaveDraftInProgress(true);
                  onCreateDraftListing(values);
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
              <span> {saveActionMsg}</span>
            </Button>
          </div>
        </Form>
      );
    }}
  />
);

EditListingDetailsFormComponent.defaultProps = {
  className: null,
  formId: 'EditListingDetailsForm',
  fetchErrors: null,
  hasExistingListingType: false,
  listingFieldsConfig: [],
};

EditListingDetailsFormComponent.propTypes = {
  className: string,
  formId: string,
  intl: intlShape.isRequired,
  onSubmit: func.isRequired,
  onListingTypeChange: func.isRequired,
  saveActionMsg: string.isRequired,
  disabled: bool.isRequired,
  ready: bool.isRequired,
  updated: bool.isRequired,
  updateInProgress: bool.isRequired,
  fetchErrors: shape({
    createListingDraftError: propTypes.error,
    showListingsError: propTypes.error,
    updateListingError: propTypes.error,
  }),
  pickSelectedCategories: func.isRequired,
  selectableListingTypes: arrayOf(
    shape({
      listingType: string.isRequired,
      transactionProcessAlias: string.isRequired,
      unitType: string.isRequired,
    })
  ).isRequired,
  hasExistingListingType: bool,
  listingFieldsConfig: propTypes.listingFields,
};

export default compose(injectIntl)(EditListingDetailsFormComponent);
