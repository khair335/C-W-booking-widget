import React from 'react';
import { array, bool, func, object, string } from 'prop-types';
import classNames from 'classnames';

// Import configs and util modules
import { FormattedMessage } from '../../../../util/reactIntl';
import { LISTING_STATE_DRAFT } from '../../../../util/types';

// Import shared components
import { H3, ListingLink } from '../../../../components';

// Import modules from this directory
import EditListingPhotosForm from './EditListingPhotosForm';
import css from './EditListingPhotosPanel.module.css';
import { getUploadKey } from '../../../../util/data';
import { ASSET_CATEGORY_FILM, CODE_PROCESSING_MARKETING, CODE_PROCESSING_SERIES, LISTING_STATE_PUBLISHED, STATUS_PENDING_APPROVAL } from '../../../../constants';
import Swal from 'sweetalert2';

const getInitialValues = (params) => {
  const { listingFilmAsset, listing, deletedAssetIds } = params;
  const { filmVideo } = (listing && listing.id && listing.attributes.publicData) || {};
  const filmAsset = (listingFilmAsset && listingFilmAsset.asset_id) ? listingFilmAsset : filmVideo
  return { images: [], 
    filmVideo: deletedAssetIds?.includes(filmAsset?.asset_id) ? null : filmAsset
   };
};

const canCreateNewVersion = (filmAsset) => {
  return (filmAsset && filmAsset?.asset_id && filmAsset?.status !== STATUS_PENDING_APPROVAL) || filmAsset?.inProgress; 
}

const EditListingPhotosPanel = props => {
  const {
    className,
    rootClassName,
    errors,
    disabled,
    ready,
    listing,
    onImageUpload,
    submitButtonText,
    panelUpdated,
    updateInProgress,
    onSubmit,
    onRemoveImage,
    listingImageConfig,
    onCreateFilmGumletAsset,
    uploadQueue,
    filmGumletAsset,
    filmGumletAssetInProgress,
    filmGumletAssetError,
    deleteFilmAssetInProgress,
    deleteFilmAssetError,
    onDeleteFilmAsset,
    history,
    deletedAssetIds,
    listingAssetsStatus
  } = props;

  const { id, attributes } = listing || {};
  const { publicData, state } = attributes || {};
  const listingFilmAsset = filmGumletAsset;
  const listingFilmAssetError = filmGumletAssetError[id?.uuid];
  const listingFilmAssetInProgress = filmGumletAssetInProgress[id?.uuid];

  const listingDeleteFilmAssetInProgress = deleteFilmAssetInProgress[id?.uuid];
  const listingDeleteFilmAssetError = deleteFilmAssetError[id?.uuid];

  const rootClass = rootClassName || css.root;
  const classes = classNames(rootClass, className);
  const isPublished = id && state !== LISTING_STATE_DRAFT;
  const { listingType, hasTransaction, markAsDraft, deletedListing } = publicData || {};

  const uploadKey = getUploadKey({ listingId: id?.uuid, assetCategory: ASSET_CATEGORY_FILM });
  const isQueued = !!uploadQueue.find(task => task.uploadKey === uploadKey);

  const allowCreateNewVersion = canCreateNewVersion(listingFilmAsset) &&
    ![CODE_PROCESSING_MARKETING, CODE_PROCESSING_SERIES].includes(listingAssetsStatus?.code);

  const canCreateNew = (state === LISTING_STATE_PUBLISHED) && allowCreateNewVersion && !markAsDraft && !deletedListing;

  return (
    <div className={classes}>
      <H3 as="h1" className={css.title}>
        {/* {isPublished ? (
          <FormattedMessage
            id="EditListingPhotosPanel.title"
            values={{ listingTitle: <ListingLink listing={listing} />, lineBreak: <br /> }}
          />
        ) : ( */}
        <FormattedMessage
          id="EditListingPhotosPanel.createListingTitle"
          values={{ lineBreak: <br /> }}
        />
        {/* )} */}
      </H3>
      <h5 className={css.subHeading}>
        <FormattedMessage id="EditListingPhotosPanel.heading" />
      </h5>
      <p className={css.subHeading1}>
        <FormattedMessage id="EditListingPhotosPanel.subHeading1" />
      </p>
      <p className={css.subHeading2}>
        <FormattedMessage id="EditListingPhotosPanel.subHeading2" values={{ days: <u>days</u> }} />
      </p>
      <p className={css.warning}>
        <FormattedMessage id="EditListingPhotosPanel.reloadWarning" />
      </p>

      <EditListingPhotosForm
        className={css.form}
        disabled={disabled}
        ready={ready}
        fetchErrors={errors}
        initialValues={getInitialValues({ listing, listingFilmAsset, deletedAssetIds })}
        onImageUpload={onImageUpload}
        onSubmit={values => {
          const { filmVideo, ...updateValues } = values;

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
                onSubmit({ ...updateValues, newVersion: true });
              } else {
                onSubmit({ ...updateValues });
              }
            })
          } else {
            onSubmit({ ...updateValues });
          }
        }}
        onRemoveImage={onRemoveImage}
        saveActionMsg={submitButtonText}
        updated={panelUpdated}
        updateInProgress={updateInProgress}
        listingImageConfig={listingImageConfig}
        listingType={listingType}
        listing={listing}
        submitButtonText={submitButtonText}
        onCreateFilmGumletAsset={onCreateFilmGumletAsset}
        onDeleteFilmAsset={onDeleteFilmAsset}
        listingFilmAsset={listingFilmAsset}
        listingFilmAssetInProgress={listingFilmAssetInProgress}
        listingFilmAssetError={listingFilmAssetError}
        listingDeleteFilmAssetInProgress={listingDeleteFilmAssetInProgress}
        listingDeleteFilmAssetError={listingDeleteFilmAssetError}
        isQueued={isQueued}
        hasTransaction={hasTransaction}
        isPublished={isPublished}
        history={history}
      />
    </div>
  );
};

EditListingPhotosPanel.defaultProps = {
  className: null,
  rootClassName: null,
  errors: null,
  images: [],
  listing: null,
};

EditListingPhotosPanel.propTypes = {
  className: string,
  rootClassName: string,
  errors: object,
  disabled: bool.isRequired,
  ready: bool.isRequired,
  images: array,

  // We cannot use propTypes.listing since the listing might be a draft.
  listing: object,

  onImageUpload: func.isRequired,
  onSubmit: func.isRequired,
  submitButtonText: string.isRequired,
  panelUpdated: bool.isRequired,
  updateInProgress: bool.isRequired,
  onRemoveImage: func.isRequired,
  listingImageConfig: object.isRequired,
};

export default EditListingPhotosPanel;
