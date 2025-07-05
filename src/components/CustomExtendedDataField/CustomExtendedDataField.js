import React from 'react';

// Import config and utils
import { useIntl } from '../../util/reactIntl';
import {
  SCHEMA_TYPE_ENUM,
  SCHEMA_TYPE_MULTI_ENUM,
  SCHEMA_TYPE_TEXT,
  SCHEMA_TYPE_LONG,
  SCHEMA_TYPE_BOOLEAN,
  PRICES,
  REFUND_POLICY,
  PUB_SUBTITLE_SELECTION,
  PUB_SUB_GENRE,
  PUB_SERIES_PRIMARY_GENRE,
  PUB_SERIES_SUB_GENRE,
  urlsFieldName,
  PUB_CONTENT_TYPE,
  PUB_PRIMARY_GENRE,
} from '../../util/types';

import { required, nonEmptyArray, validateInteger, composeValidators, maxArrayLength, minimumArrLength, urlFormatValid, minLength, maxLength, subtitleValidator, urlPathValidator } from '../../util/validators';


// Import shared components
import { FieldTextInput, FieldBoolean, FieldRadioButton } from '../../components';
// Import modules from this directory
import css from './CustomExtendedDataField.module.css';
import FieldMultiSelect from '../FieldMultiSelect/FieldMultiSelect';
import { suggestedPrices } from '../../config/configListing';
import classNames from 'classnames';
import { LISTING_TYPE_SERIES, VALID_SOCIAL_MEDIA_PLATFORMS, WEBSITE } from '../../constants';
import IconCollection from '../IconCollection/IconCollection';
import { Tooltip } from 'react-tooltip';

const CONTENT_MAX_LENGTH = 50;
const CONTEN_MIN_LENGTH = 3;

const createFilterOptions = options => options.map(o => ({ key: `${o.option}`, label: o.label }));

const getLabel = fieldConfig => fieldConfig?.saveConfig?.label || fieldConfig?.label;

const CustomFieldEnum = props => {
  const { name, fieldConfig, defaultRequiredMessage, formId, intl } = props;
  const { enumOptions = [], saveConfig } = fieldConfig || {};
  const { placeholderMessage, isRequired, requiredMessage } = saveConfig || {};
  const validateMaybe = isRequired
    ? { validate: required(requiredMessage || defaultRequiredMessage) }
    : {};
  const placeholder =
    placeholderMessage ||
    intl.formatMessage({ id: 'CustomExtendedDataField.placeholderSingleSelect' });
  const filterOptions = createFilterOptions(enumOptions);

  const label = getLabel(fieldConfig);

  return filterOptions ? (
    <FieldMultiSelect
      className={css.customField}
      name={name}
      id={formId ? `${formId}.${name}` : name}
      label={label}
      options={filterOptions}
      isMulti={false}
      {...validateMaybe}
    />
  ) : null;
};


const CustomPricesFieldEnum = props => {
  const { name, fieldConfig, defaultRequiredMessage, values } = props;
  const { enumOptions = [], saveConfig, key } = fieldConfig || {};
  const { isRequired, requiredMessage } = saveConfig || {};
  const validateMaybe = isRequired && !values.ownPrice && key == PRICES
    ? { validate: required(requiredMessage || defaultRequiredMessage) }
    : isRequired && key == REFUND_POLICY
      ? { validate: required(requiredMessage || defaultRequiredMessage) }
      : {};

  const filterOptions = createFilterOptions(enumOptions);

  const label = getLabel(fieldConfig);

  return filterOptions ? (
    <div>
      <label className={css.label}>
        {label}
      </label>
      <div className={classNames(key == PRICES ? css.customRadioField : key == REFUND_POLICY && css.customRadioFieldRefundPolicy)}>
        {(key == PRICES ? suggestedPrices : filterOptions).map((type) => (
          <FieldRadioButton
            key={type.key}
            className={css.customField}
            id={type.key}
            name={name}
            label={type.label}
            value={type.key}
            options={filterOptions}
            description={type.description}
            {...validateMaybe}
          />
        ))}
      </div>

    </div>
  ) : null;
};

const CustomFieldMultiEnum = props => {
  const { name, fieldConfig, defaultRequiredMessage, formId, intl, listingType, isPublished } = props;
  const { enumOptions = [], saveConfig } = fieldConfig || {};
  const { isRequired, requiredMessage } = saveConfig || {};
  const label = getLabel(fieldConfig);

  const isSeriesSubTitle = (listingType == LISTING_TYPE_SERIES) && (name === PUB_SUBTITLE_SELECTION);
  const minimumLength = (name === PUB_SERIES_PRIMARY_GENRE)
    || (name === PUB_PRIMARY_GENRE)
    || isSeriesSubTitle
    ? 1
    : 1; //other fields may have same or different

  const minimumLengthMessage = intl.formatMessage({ id: "EditListingDetailsForm.minimumSelection" }, { minimumLength });
  const minimumLengthValidator = minimumArrLength(minimumLengthMessage, minimumLength);

  const maxLengths = name == PUB_SUBTITLE_SELECTION
    ? 4
    : (name == PUB_SERIES_SUB_GENRE) || (name === PUB_SUB_GENRE)
      ? 2
      : name === PUB_PRIMARY_GENRE
        ? 1
        : Infinity; //other may have different values

  const maxLengthMessage = intl.formatMessage(
    { id: 'EditListingDetailsForm.maxArrLength' },
    {
      maxLength: maxLengths,
    }
  );

  const maxLength60Message = maxArrayLength(maxLengthMessage, maxLengths);
  const validateMaybe = name === PUB_PRIMARY_GENRE
    ? { validate: composeValidators(minimumLengthValidator, maxLength60Message) }
    : name === PUB_SERIES_PRIMARY_GENRE
      ? { validate: minimumLengthValidator }
      : isRequired && (name == PUB_SUBTITLE_SELECTION)
        ? { validate: composeValidators(required(requiredMessage || defaultRequiredMessage), subtitleValidator('invalid subtitles')) }
        : (name == PUB_SERIES_SUB_GENRE) || (name === PUB_SUB_GENRE)
          ? { validate: maxLength60Message }
          : isRequired
            ? { validate: nonEmptyArray(requiredMessage || defaultRequiredMessage) }
            : !isRequired && ((name == PUB_SERIES_SUB_GENRE) || (name == PUB_SUB_GENRE))
              ? { validate: composeValidators(maxLength60Message) }
              : {};

  const disabled = (name == PUB_SUBTITLE_SELECTION && isPublished) ? { disabled: true } : { disabled: false };
  const fieldLabel = name === PUB_SUBTITLE_SELECTION ? ((
    <div className={css.subtitleLabel}>
      <span>{label}</span>
      <div>
        <div data-tooltip-id="subtitleTooltip" className={css.tooltip}>
          <IconCollection icon="icon-info" width="16px" height="16px" />
        </div>
        <Tooltip
          id="subtitleTooltip"
          place="right"
          content={intl.formatMessage({ id: "EditListingDetailsForm.subtitleTooltipText" })}
        />
      </div>
    </div>
  )) : label;

  return enumOptions ? (
    <FieldMultiSelect
      isMulti={true}
      isRequired={true}
      className={css.customField}
      id={formId ? `${formId}.${name}` : name}
      name={name}
      label={fieldLabel}
      options={createFilterOptions(enumOptions.sort((a, b) => a.option.localeCompare(b.option)))}
      {...disabled}
      {...validateMaybe}
    />
  ) : null;
};

const CustomFieldText = props => {
  const { name, fieldConfig, defaultRequiredMessage, formId, intl } = props;
  const { placeholderMessage, isRequired, requiredMessage } = fieldConfig?.saveConfig || {};
  const label = getLabel(fieldConfig);

  const urlValid = urlFormatValid(
    intl.formatMessage({
      id: 'ProfileSettingsForm.urlInvalid',
    })
  );

  const maxLengthMessage = intl.formatMessage(
    { id: 'EditListingDetailsForm.maxLength' },
    {
      maxLength: CONTENT_MAX_LENGTH,
    }
  );
  const maxLength50Message = maxLength(maxLengthMessage, CONTENT_MAX_LENGTH);

  const minLengthMessage = intl.formatMessage(
    { id: 'EditListingDetailsForm.minLength' },
    {
      minLength: CONTEN_MIN_LENGTH,
    }
  );
  const minLength3Message = minLength(minLengthMessage, CONTEN_MIN_LENGTH);

  const validateMaybe = isRequired
    ? { validate: required(requiredMessage || defaultRequiredMessage) }
    : [`pub_${WEBSITE}`].includes(name)
      ? { validate: composeValidators(urlValid) }
      : urlsFieldName.includes(name)
        ? { validate: urlPathValidator('path must start with /') }
        : {};

  const maxLengthChar = name == PUB_CONTENT_TYPE ? { maxLength: 50 } : {};
  const minLengthChar = name == PUB_CONTENT_TYPE ? { minLength: 3 } : {};

  const placeholder = VALID_SOCIAL_MEDIA_PLATFORMS.includes(name.replace('pub_', ''))
    ? intl.formatMessage({ id: 'CustomExtendedDataField.socialMediaFieldPlaceholder' }, { name })
    : !!placeholderMessage?.trim()
      ? placeholderMessage
      : intl.formatMessage({ id: 'CustomExtendedDataField.placeholderText' });
  
  return (
    <FieldTextInput
      className={css.customField}
      id={formId ? `${formId}.${name}` : name}
      name={name}
      type="text"
      label={label}
      placeholder={placeholder}
      {...maxLengthChar}
      {...minLengthChar}
      {...validateMaybe}
    />
  );
};

const CustomFieldLong = props => {
  const { name, fieldConfig, defaultRequiredMessage, formId, intl } = props;
  const { minimum, maximum, saveConfig } = fieldConfig;
  const { placeholderMessage, isRequired, requiredMessage } = saveConfig || {};
  const label = getLabel(fieldConfig);
  const placeholder =
    placeholderMessage || intl.formatMessage({ id: 'CustomExtendedDataField.placeholderLong' });
  const numberTooSmallMessage = intl.formatMessage(
    { id: 'CustomExtendedDataField.numberTooSmall' },
    { min: minimum }
  );
  const numberTooBigMessage = intl.formatMessage(
    { id: 'CustomExtendedDataField.numberTooBig' },
    { max: maximum }
  );

  // Field with schema type 'long' will always be validated against min & max
  const validate = (value, min, max) => {
    const requiredMsg = requiredMessage || defaultRequiredMessage;
    return isRequired && value == null
      ? requiredMsg
      : validateInteger(value, max, min, numberTooSmallMessage, numberTooBigMessage);
  };

  return (
    <FieldTextInput
      className={css.customField}
      id={formId ? `${formId}.${name}` : name}
      name={name}
      type="number"
      step="1"
      parse={value => {
        const parsed = Number.parseInt(value, 10);
        return Number.isNaN(parsed) ? null : parsed;
      }}
      label={label}
      placeholder={placeholder}
      validate={value => validate(value, minimum, maximum)}
    />
  );
};

const CustomFieldBoolean = props => {
  const { name, fieldConfig, defaultRequiredMessage, formId, intl } = props;
  const { placeholderMessage, isRequired, requiredMessage } = fieldConfig?.saveConfig || {};
  const label = getLabel(fieldConfig);
  const validateMaybe = isRequired
    ? { validate: required(requiredMessage || defaultRequiredMessage) }
    : {};
  const placeholder =
    placeholderMessage || intl.formatMessage({ id: 'CustomExtendedDataField.placeholderBoolean' });

  return (
    <FieldBoolean
      className={css.customField}
      id={formId ? `${formId}.${name}` : name}
      name={name}
      label={label}
      placeholder={placeholder}
      {...validateMaybe}
    />
  );
};

/**
 * Return Final Form field for each configuration according to schema type.
 *
 * These custom extended data fields are for generating input fields from configuration defined
 * in marketplace-custom-config.js. Other panels in EditListingWizard might add more extended data
 * fields (e.g. shipping fee), but these are independently customizable.
 *
 * @param {Object} props should contain fieldConfig that defines schemaType, enumOptions?, and
 * saveConfig for the field.
 */
const CustomExtendedDataField = props => {
  const intl = useIntl();
  const { enumOptions = [], schemaType, key } = props?.fieldConfig || {};
  const renderFieldComponent = (FieldComponent, props) => <FieldComponent {...props} intl={intl} />;

  return schemaType === SCHEMA_TYPE_ENUM && enumOptions && ![PRICES, REFUND_POLICY].includes(key)
    ? renderFieldComponent(CustomFieldEnum, props)
    : schemaType === SCHEMA_TYPE_MULTI_ENUM && enumOptions
      ? renderFieldComponent(CustomFieldMultiEnum, props)
      : schemaType === SCHEMA_TYPE_TEXT
        ? renderFieldComponent(CustomFieldText, props)
        : schemaType === SCHEMA_TYPE_LONG
          ? renderFieldComponent(CustomFieldLong, props)
          : schemaType === SCHEMA_TYPE_BOOLEAN
            ? renderFieldComponent(CustomFieldBoolean, props)
            : schemaType === SCHEMA_TYPE_ENUM && enumOptions && [PRICES, REFUND_POLICY].includes(key)
              ? renderFieldComponent(CustomPricesFieldEnum, props)
              : null;
};

export default CustomExtendedDataField;
