import React, { useState } from 'react';
import { bool, func, object, string } from 'prop-types';
import classNames from 'classnames';

// Import util modules
import { FormattedMessage } from '../../../../util/reactIntl';
import {
  EXTENDED_DATA_SCHEMA_TYPES,
  LISTING_STATE_DRAFT,
  PRICES,
  PUB_PRIMARY_GENRE,
  PUB_SERIES_PRIMARY_GENRE,
  PUB_SERIES_SUB_GENRE,
  PUB_SUB_GENRE,
  REFUND_POLICY,
  ROLE,
  SCHEMA_TYPE_ENUM,
} from '../../../../util/types';
import {
  isFieldForCategory,
  isFieldForListingType,
  pickCategoryFields,
} from '../../../../util/fieldHelpers';
import { isBookingProcessAlias } from '../../../../transactions/transaction';

// Import shared components
import { H3, ListingLink } from '../../../../components';

// Import modules from this directory
import ErrorMessage from './ErrorMessage';
import EditListingDetailsForm from './EditListingDetailsForm';
import css from './EditListingDetailsPanel.module.css';
import { LISTING_STATE_PUBLISHED, LISTING_TYPE_FILMS, LISTING_TYPE_SERIES } from '../../../../constants';
import { omit } from 'lodash';



const getGenres = (values, listingTypes) => {
  const primary_genre = Array.isArray(values[PUB_PRIMARY_GENRE])
    ? values[PUB_PRIMARY_GENRE].map(e => e.key)
    : (typeof values[PUB_PRIMARY_GENRE] === 'object' && values[PUB_PRIMARY_GENRE] !== null)
      ? values[PUB_PRIMARY_GENRE].key
      : values[PUB_PRIMARY_GENRE];

  const primary_genre_series = Array.isArray(values[PUB_SERIES_PRIMARY_GENRE])
    ? values[PUB_SERIES_PRIMARY_GENRE].map(e => e.key)
    : (typeof values[PUB_SERIES_PRIMARY_GENRE] === 'object' && values[PUB_SERIES_PRIMARY_GENRE] !== null)
      ? values[PUB_SERIES_PRIMARY_GENRE].key
      : values[PUB_SERIES_PRIMARY_GENRE];

  const sub_genre_ = Array.isArray(values[PUB_SUB_GENRE])
    ? values[PUB_SUB_GENRE].map(e => e.key)
    : (typeof values[PUB_SUB_GENRE] === 'object' && values[PUB_SUB_GENRE] !== null)
      ? values[PUB_SUB_GENRE].key
      : values[PUB_SUB_GENRE];

  const sub_genre_series = Array.isArray(values[PUB_SERIES_SUB_GENRE])
    ? values[PUB_SERIES_SUB_GENRE].map(e => e.key)
    : (typeof values[PUB_SERIES_SUB_GENRE] === 'object' && values[PUB_SERIES_SUB_GENRE] !== null)
      ? values[PUB_SERIES_SUB_GENRE].key
      : values[PUB_SERIES_SUB_GENRE];

  return listingTypes === LISTING_TYPE_FILMS
    ? {
      primary_genre: primary_genre,
      sub_genre: sub_genre_
    }
    : listingTypes === LISTING_TYPE_SERIES
      ? {
        primary_genre: primary_genre_series,
        sub_genre: sub_genre_series,
        series_primary_genre: primary_genre_series
      }
      : {}
};
import { formatLabel } from '../../../../util/dataExtractor';
import { getLanguageCodes } from '../../../../util/data';
import Swal from 'sweetalert2';

/**
 * Get listing configuration. For existing listings, it is stored to publicData.
 * For new listings, the data needs to be figured out from listingTypes configuration.
 *
 * In the latter case, we select first type in the array. However, EditListingDetailsForm component
 * gets 'selectableListingTypes' prop, which it uses to provide a way to make selection,
 * if multiple listing types are available.
 *
 * @param {Array} listingTypes
 * @param {Object} existingListingTypeInfo
 * @returns an object containing mainly information that can be stored to publicData.
 */
const getTransactionInfo = (listingTypes, existingListingTypeInfo = {}, inlcudeLabel = false) => {
  const { listingType, transactionProcessAlias, unitType } = existingListingTypeInfo;

  if (listingType && transactionProcessAlias && unitType) {
    return { listingType, transactionProcessAlias, unitType };
  } else if (listingTypes.length === 1) {
    const { listingType: type, label, transactionType } = listingTypes[0];
    const { alias, unitType: configUnitType } = transactionType;
    const labelMaybe = inlcudeLabel ? { label: label || type } : {};
    return {
      listingType: type,
      transactionProcessAlias: alias,
      unitType: configUnitType,
      ...labelMaybe,
    };
  }
  return {};
};

/**
 * Check if listingType has already been set.
 *
 * If listing type (incl. process & unitType) has been set, we won't allow change to it.
 * It's possible to make it editable, but it becomes somewhat complex to modify following panels,
 * for the different process. (E.g. adjusting stock vs booking availability settings,
 * if process has been changed for existing listing.)
 *
 * @param {Object} publicData JSON-like data stored to listing entity.
 * @returns object literal with to keys: { hasExistingListingType, existingListingTypeInfo }
 */
const hasSetListingType = publicData => {
  const { listingType, transactionProcessAlias, unitType } = publicData;
  const existingListingTypeInfo = { listingType, transactionProcessAlias, unitType };

  return {
    hasExistingListingType: !!listingType && !!transactionProcessAlias && !!unitType,
    existingListingTypeInfo,
  };
};

/**
 * Pick extended data fields from given form data.
 * Picking is based on extended data configuration for the listing and target scope and listing type.
 *
 * This expects submit data to be namespaced (e.g. 'pub_') and it returns the field without that namespace.
 * This function is used when form submit values are restructured for the actual API endpoint.
 *
 * Note: This returns null for those fields that are managed by configuration, but don't match target listing type.
 *       These might exists if provider swaps between listing types before saving the draft listing.
 *
 * @param {Object} data values to look through against listingConfig.js and util/configHelpers.js
 * @param {String} targetScope Check that the scope of extended data the config matches
 * @param {String} targetListingType Check that the extended data is relevant for this listing type.
 * @param {Object} listingFieldConfigs an extended data configurtions for listing fields.
 * @returns Array of picked extended data fields from submitted data.
 */
const pickListingFieldsData = (
  data,
  targetScope,
  targetListingType,
  targetCategories,
  listingFieldConfigs
) => {
  const targetCategoryIds = Object.values(targetCategories);

  return listingFieldConfigs.reduce((fields, fieldConfig) => {
    const { key, scope = 'public', schemaType } = fieldConfig || {};
    const namespacePrefix = scope === 'public' ? `pub_` : `priv_`;
    const namespacedKey = `${namespacePrefix}${key}`;

    const isKnownSchemaType = EXTENDED_DATA_SCHEMA_TYPES.includes(schemaType);
    const isTargetScope = scope === targetScope;
    const isTargetListingType = isFieldForListingType(targetListingType, fieldConfig);
    const isTargetCategory = isFieldForCategory(targetCategoryIds, fieldConfig);

    if (isKnownSchemaType && isTargetScope && isTargetListingType && isTargetCategory) {
      const fieldValue = data[namespacedKey] != null ? data[namespacedKey] : null;
      return {
        ...fields,
        [key]: Array.isArray(fieldValue)
          ? fieldValue.map(e => e.key)
          : (typeof fieldValue === 'object' && fieldValue !== null)
            ? fieldValue.key
            : fieldValue
      };

    } else if (isKnownSchemaType && isTargetScope) {
      // Note: this clears extra custom fields
      // These might exists if provider swaps between listing types before saving the draft listing.
      return { ...fields, [key]: null };
    }
    return fields;
  }, {});
};

/**
 * Pick extended data fields from given extended data of the listing entity.
 * Picking is based on extended data configuration for the listing and target scope and listing type.
 *
 * This returns namespaced (e.g. 'pub_') initial values for the form.
 *
 * @param {Object} data extended data values to look through against listingConfig.js and util/configHelpers.js
 * @param {String} targetScope Check that the scope of extended data the config matches
 * @param {String} targetListingType Check that the extended data is relevant for this listing type.
 * @param {Object} listingFieldConfigs an extended data configurtions for listing fields.
 * @returns Array of picked extended data fields
 */
const initialValuesForListingFields = (
  data,
  targetScope,
  targetListingType,
  targetCategories,
  listingFieldConfigs
) => {
  const targetCategoryIds = Object.values(targetCategories);

  return listingFieldConfigs.reduce((fields, fieldConfig) => {
    const { key, scope = 'public', schemaType, enumOptions } = fieldConfig || {};
    const namespacePrefix = scope === 'public' ? `pub_` : `priv_`;
    const namespacedKey = `${namespacePrefix}${key}`;

    const isKnownSchemaType = EXTENDED_DATA_SCHEMA_TYPES.includes(schemaType);
    const isEnumSchemaType = schemaType === SCHEMA_TYPE_ENUM;
    const shouldHaveValidEnumOptions =
      !isEnumSchemaType ||
      (isEnumSchemaType && !!enumOptions?.find(conf => conf.option === data?.[key]));
    const isTargetScope = scope === targetScope;
    const isTargetListingType = isFieldForListingType(targetListingType, fieldConfig);
    const isTargetCategory = isFieldForCategory(targetCategoryIds, fieldConfig);

    if (
      isKnownSchemaType &&
      isTargetScope &&
      isTargetListingType &&
      isTargetCategory &&
      shouldHaveValidEnumOptions
    ) {
      const fieldValue = data?.[key] != null ? data[key] : null;
      return {
        ...fields,
        [namespacedKey]: Array.isArray(fieldValue)
          ? fieldValue.map(e => ({
            key: e,
            label: formatLabel(e),
          }))
          : typeof fieldValue === 'string'
            ? { key: fieldValue, label: formatLabel(fieldValue) }
            : {}
      };

    }
    return fields;
  }, {});
};

/**
 * If listing represents something else than a bookable listing, we set availability-plan to seats=0.
 * Note: this is a performance improvement since the API is backwards compatible.
 *
 * @param {string} processAlias selected for this listing
 * @returns availabilityPlan without any seats available for the listing
 */
const setNoAvailabilityForUnbookableListings = processAlias => {
  return isBookingProcessAlias(processAlias)
    ? {}
    : {
      availabilityPlan: {
        type: 'availability-plan/time',
        timezone: 'Etc/UTC',
        entries: [
          // Note: "no entries" is the same as seats=0 for every entry.
          // { dayOfWeek: 'mon', startTime: '00:00', endTime: '00:00', seats: 0 },
          // { dayOfWeek: 'tue', startTime: '00:00', endTime: '00:00', seats: 0 },
          // { dayOfWeek: 'wed', startTime: '00:00', endTime: '00:00', seats: 0 },
          // { dayOfWeek: 'thu', startTime: '00:00', endTime: '00:00', seats: 0 },
          // { dayOfWeek: 'fri', startTime: '00:00', endTime: '00:00', seats: 0 },
          // { dayOfWeek: 'sat', startTime: '00:00', endTime: '00:00', seats: 0 },
          // { dayOfWeek: 'sun', startTime: '00:00', endTime: '00:00', seats: 0 },
        ],
      },
    };
};

/**
 * Get initialValues for the form. This function includes
 * title, description, listingType, transactionProcessAlias, unitType,
 * and those publicData & privateData fields that are configured through
 * config.listing.listingFields.
 *
 * @param {object} props
 * @param {object} existingListingTypeInfo info saved to listing's publicData
 * @param {object} listingTypes app's configured types (presets for listings)
 * @param {object} listingFields those extended data fields that are part of configurations
 * @returns initialValues object for the form
 */
const getInitialValues = (
  props,
  existingListingTypeInfo,
  listingTypes,
  listingFields,
  listingCategories,
  categoryKey
) => {
  const { description, title, publicData, privateData } = props?.listing?.attributes || {};
  const { listingType, primary_genre, sub_genre, numberOfEpisodes } = publicData;


  const generes = listingType === LISTING_TYPE_SERIES
    ? {
      pub_series_primary_genre: Array.isArray(primary_genre)
        ? (primary_genre).map(e => ({
          key: e,
          label: formatLabel(e),
        }))
        : {},
      pub_series_sub_genre: Array.isArray((sub_genre))
        ? (sub_genre).map(e => ({
          key: e,
          label: formatLabel(e),
        }))
        : {}
    }
    : {};

  const nestedCategories = pickCategoryFields(publicData, categoryKey, 1, listingCategories);

  const numberOfEpisodesMaybe = !!numberOfEpisodes ? { pub_numberOfEpisodes: numberOfEpisodes } : {};

  // Initial values for the form
  return {
    title,
    description,
    ...nestedCategories,
    // Transaction type info: listingType, transactionProcessAlias, unitType
    ...getTransactionInfo(listingTypes, existingListingTypeInfo),
    ...initialValuesForListingFields(
      publicData,
      'public',
      listingType,
      nestedCategories,
      listingFields
    ),
    ...initialValuesForListingFields(
      privateData,
      'private',
      listingType,
      nestedCategories,
      listingFields
    ),
    ...generes,
    ...numberOfEpisodesMaybe
  };
};

const EditListingDetailsPanel = props => {
  const [saveDraftInProgress, setSaveDraftInProgress] = useState(false);
  const {
    className,
    rootClassName,
    listing,
    disabled,
    ready,
    onSubmit,
    onListingTypeChange,
    submitButtonText,
    panelUpdated,
    updateInProgress,
    errors,
    config,
    onCreateListingDraft,
    history,
    params,
    createListingDraftInProgress,
    listingAssetsStatus
  } = props;

  const { listingType } = params || {};
  const classes = classNames(rootClassName || css.root, className);
  const { publicData, state } = listing?.attributes || {};
  const listingTypes = config.listing.listingTypes;
  const listingFields = config.listing.listingFields;
  const listingCategories = config.categoryConfiguration.categories;
  const categoryKey = config.categoryConfiguration.key;
  const selectedListingType = config.listing.listingTypes.find(config => config.listingType === listingType);

  const { alias, unitType } = selectedListingType.transactionType || {};

  const { hasExistingListingType, existingListingTypeInfo } = hasSetListingType(publicData);
  const hasValidExistingListingType =
    hasExistingListingType &&
    !!listingTypes.find(conf => {
      const listinTypesMatch = conf.listingType === existingListingTypeInfo.listingType;
      const unitTypesMatch = conf.transactionType?.unitType === existingListingTypeInfo.unitType;
      return listinTypesMatch && unitTypesMatch;
    });

  const initialValues = getInitialValues(
    props,
    existingListingTypeInfo,
    listingTypes,
    listingFields,
    listingCategories,
    categoryKey
  );

  const noListingTypesSet = listingTypes?.length === 0;
  const hasListingTypesSet = listingTypes?.length > 0;
  const canShowEditListingDetailsForm =
    hasListingTypesSet && (!hasExistingListingType || hasValidExistingListingType);
  const isPublished = listing?.id && state !== LISTING_STATE_DRAFT;

  const { markAsDraft, deletedListing } = publicData || {};
  const canCreateNew = (state === LISTING_STATE_PUBLISHED) && (listingAssetsStatus?.isReady === true) && !deletedListing && !markAsDraft;
  return (
    <div className={classes}>
      <H3 as="h1" className={css.title}>
        {isPublished ? (
          <FormattedMessage
            id="EditListingDetailsPanel.title"
            values={{ listingTitle: <ListingLink listing={listing} />, lineBreak: <br /> }}
          />
        ) : (
          <FormattedMessage
            id="EditListingDetailsPanel.createListingTitle"
            values={{ lineBreak: <br /> }}
          />
        )}
      </H3>

      {canShowEditListingDetailsForm ? (
        <EditListingDetailsForm
          className={css.form}
          initialValues={{ ...initialValues, listingType: selectedListingType.listingType, transactionProcessAlias: alias, unitType }}
          saveActionMsg={submitButtonText}
          onSubmit={values => {
            const {
              title,
              description,
              listingType,
              transactionProcessAlias,
              unitType,
              ...rest
            } = values;

            const nestedCategories = pickCategoryFields(rest, categoryKey, 1, listingCategories);
            // Remove old categories by explicitly saving null for them.
            const cleanedNestedCategories = {
              ...[1, 2, 3].reduce((a, i) => ({ ...a, [`${categoryKey}${i}`]: null }), {}),
              ...nestedCategories,
            };

            // We need to remove series genres, so we can extract them separately
            const updatedRest = omit(rest, [PUB_SERIES_PRIMARY_GENRE, PUB_SERIES_SUB_GENRE]);

            const publicListingFields = pickListingFieldsData(
              updatedRest,
              'public',
              listingType,
              nestedCategories,
              listingFields
            );
            const privateListingFields = pickListingFieldsData(
              updatedRest,
              'private',
              listingType,
              nestedCategories,
              listingFields
            );

            const subtitleLanguages = values?.pub_subtitle_selection.map((e) => e.key) || [];
            const combinedSubtitle = subtitleLanguages.map((label, index) => ({
              label,
              key: getLanguageCodes(subtitleLanguages)[index],
            }));

            // New values for listing attributes
            const updateValues = {
              title: title.trim(),
              description,
              publicData: {
                listingType,
                transactionProcessAlias,
                unitType,
                ...cleanedNestedCategories,
                ...publicListingFields,
                ...getGenres(values, listingType),
                markAsDraft: publicData?.markAsDraft ? true : false,
                deletedListing: false,
                subtitle_ln_code: combinedSubtitle
              },
              privateData: privateListingFields,
              ...setNoAvailabilityForUnbookableListings(transactionProcessAlias),
            };

            // Show the sweet alert to confirm the action
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
            };
          }}
          selectableListingTypes={listingTypes.map(conf => getTransactionInfo([conf], {}, true))}
          hasExistingListingType={hasExistingListingType}
          selectableCategories={[]}
          pickSelectedCategories={values =>
            pickCategoryFields(values, categoryKey, 1, [])
          }
          categoryPrefix={categoryKey}
          onListingTypeChange={onListingTypeChange}
          listingFieldsConfig={listingFields.filter((e) => ![ROLE, PRICES, REFUND_POLICY].includes(e.key))}
          marketplaceCurrency={config.currency}
          disabled={disabled}
          ready={ready}
          updated={panelUpdated}
          updateInProgress={updateInProgress}
          fetchErrors={errors}
          onCreateDraftListing={(values) => {
            const {
              title,
              description,
              listingType,
              transactionProcessAlias,
              unitType,
              ...rest
            } = values;

            const nestedCategories = pickCategoryFields(rest, categoryKey, 1, listingCategories);
            // Remove old categories by explicitly saving null for them.
            const cleanedNestedCategories = {
              ...[1, 2, 3].reduce((a, i) => ({ ...a, [`${categoryKey}${i}`]: null }), {}),
              ...nestedCategories,
            };

            // We need to remove series genres so that we can extract them separately
            const updatedRest = omit(rest, [PUB_SERIES_PRIMARY_GENRE, PUB_SERIES_SUB_GENRE]);
            const publicListingFields = pickListingFieldsData(
              updatedRest,
              'public',
              listingType,
              nestedCategories,
              listingFields
            );
            const privateListingFields = pickListingFieldsData(
              updatedRest,
              'private',
              listingType,
              nestedCategories,
              listingFields
            );

            const subtitleLanguages = values?.pub_subtitle_selection?.map((e) => e.key) || [];
            const combinedSubtitle = subtitleLanguages.map((label, index) => ({
              label,
              key: getLanguageCodes(subtitleLanguages)[index],
            }));

            // New values for listing attributes
            const updateValues = {
              title: title.trim(),
              description,
              publicData: {
                listingType,
                transactionProcessAlias,
                unitType,
                ...cleanedNestedCategories,
                ...publicListingFields,
                ...getGenres(values, listingType),
                markAsDraft: publicData?.markAsDraft ? true : false,
                deletedListing: false,
                subtitle_ln_code: combinedSubtitle
              },
              privateData: privateListingFields,
              ...setNoAvailabilityForUnbookableListings(transactionProcessAlias),
            };
            if (listing && listing.id) {
              onSubmit(updateValues).then(() => history.push('/listings'))
            } else {
              onCreateListingDraft(updateValues, config).then(() => history.push('/listings'))
            }
          }}
          config={config}
          setSaveDraftInProgress={setSaveDraftInProgress}
          saveDraftInProgress={saveDraftInProgress}
          createListingDraftInProgress={createListingDraftInProgress}
          autoFocus
          publicData={publicData}
          isPublished={isPublished}
        />
      ) : (
        <ErrorMessage
          marketplaceName={config.marketplaceName}
          noListingTypesSet={noListingTypesSet}
          invalidExistingListingType={!hasValidExistingListingType}
        />
      )}
    </div>
  );
};

EditListingDetailsPanel.defaultProps = {
  className: null,
  rootClassName: null,
  errors: null,
  listing: null,
};

EditListingDetailsPanel.propTypes = {
  className: string,
  rootClassName: string,

  // We cannot use propTypes.listing since the listing might be a draft.
  listing: object,

  disabled: bool.isRequired,
  ready: bool.isRequired,
  onSubmit: func.isRequired,
  onListingTypeChange: func.isRequired,
  submitButtonText: string.isRequired,
  panelUpdated: bool.isRequired,
  updateInProgress: bool.isRequired,
  errors: object.isRequired,
};

export default EditListingDetailsPanel;
