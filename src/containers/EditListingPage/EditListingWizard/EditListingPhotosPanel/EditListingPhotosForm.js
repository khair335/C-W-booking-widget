import React, { useState } from 'react';
import { bool, func, object, shape, string } from 'prop-types';
import { compose } from 'redux';
import { ARRAY_ERROR } from 'final-form';
import { Form as FinalForm, Field } from 'react-final-form';
import arrayMutators from 'final-form-arrays';
import { FieldArray } from 'react-final-form-arrays';
import isEqual from 'lodash/isEqual';
import classNames from 'classnames';

// Import configs and util modules
import { FormattedMessage, intlShape, injectIntl } from '../../../../util/reactIntl';
import { FILM_PRODUCTS, propTypes } from '../../../../util/types';
import { nonEmptyArray, composeValidators } from '../../../../util/validators';
import { isUploadImageOverLimitError } from '../../../../util/errors';

// Import shared components
import { Button, Form, AspectRatioWrapper, DragAndDrop, IconSpinner } from '../../../../components';

// Import modules from this directory
import ListingImage from './ListingImage';
import css from './EditListingPhotosForm.module.css';
import IconCollection from '../../../../components/IconCollection/IconCollection';
import { ASSET_CATEGORY_FILM, ASSET_FILM_VIDEO, ERRORED_STATUS, GUMLET_ASSET, GUMLET_PROCESSING_STATUS, STATUS_APPROVED, STATUS_DOWNLOADING, STATUS_GENERATING_SUBTITLE, STATUS_PENDING_APPROVAL, STATUS_PROCESSING, STATUS_UPLOAD_PENDING, STATUS_UPLOAD_READY, STATUS_VALIDATED, STATUS_VALIDATING } from '../../../../constants';
import ReactPlayer from 'react-player';
import { RemoveImageButton } from '../EditListingMarketingPanel/EditListingMarketingForm';
import { formatLabel } from '../../../../util/dataExtractor';
import { getLanguageCodes } from '../../../../util/data';
import Swal from 'sweetalert2';

// const ACCEPT_IMAGES = 'image/*';
const ACCEPT_VIDEOS = 'video/*';

const gumletProcessingStatus = GUMLET_PROCESSING_STATUS;

const pendingApproval = [STATUS_PENDING_APPROVAL, STATUS_UPLOAD_READY];
const videoReady = [STATUS_APPROVED, STATUS_GENERATING_SUBTITLE, STATUS_PENDING_APPROVAL];


const ImageUploadError = props => {
  return props.uploadOverLimit ? (
    <p className={css.error}>
      <FormattedMessage id="EditListingPhotosForm.imageUploadFailed.uploadOverLimit" />
    </p>
  ) : props.uploadImageError ? (
    <p className={css.error}>
      <FormattedMessage id="EditListingPhotosForm.imageUploadFailed.uploadFailed" />
    </p>
  ) : null;
};

// NOTE: PublishListingError and ShowListingsError are here since Photos panel is the last visible panel
// before creating a new listing. If that order is changed, these should be changed too.
// Create and show listing errors are shown above submit button
const PublishListingError = props => {
  return props.error ? (
    <p className={css.error}>
      <FormattedMessage id="EditListingPhotosForm.publishListingFailed" />
    </p>
  ) : null;
};

const ShowListingsError = props => {
  return props.error ? (
    <p className={css.error}>
      <FormattedMessage id="EditListingPhotosForm.showListingFailed" />
    </p>
  ) : null;
};

// Field component that uses file-input to allow user to select images.
export const FieldAddImage = props => {
  const { formApi, onImageUploadHandler, aspectWidth = 1, aspectHeight = 1, ...rest } = props;
  return (
    <Field form={null} {...rest}>
      {fieldprops => {
        const { accept, input, label, disabled: fieldDisabled } = fieldprops;
        const { name, type } = input;
        const onChange = e => {
          onImageUploadHandler(e.target.files[0],
            ASSET_FILM_VIDEO,
            GUMLET_ASSET, formApi);
        };
        const inputProps = { accept, id: name, name, onChange, type };
        return (
          <div className={css.addImageWrapper}>
            <AspectRatioWrapper width={aspectWidth} height={aspectHeight}>
              {fieldDisabled ? null : <input {...inputProps} className={css.addImageInput} />}
              <label htmlFor={name} className={css.addImage}>
                {label}
              </label>
            </AspectRatioWrapper>
          </div>
        );
      }}
    </Field>
  );
};

// Component that shows listing images from "images" field array
const FieldListingImage = props => {
  const { name, intl, onRemoveImage, aspectWidth, aspectHeight, variantPrefix } = props;
  return (
    <Field name={name}>
      {fieldProps => {
        const { input } = fieldProps;
        const image = input.value;
        return image ? (
          <ListingImage
            image={image}
            key={image?.id?.uuid || image?.id}
            className={css.thumbnail}
            savedImageAltText={intl.formatMessage({
              id: 'EditListingPhotosForm.savedImageAltText',
            })}
            onRemoveImage={() => onRemoveImage(image?.id)}
            aspectWidth={aspectWidth}
            aspectHeight={aspectHeight}
            variantPrefix={variantPrefix}
          />
        ) : null;
      }}
    </Field>
  );
};

export const EditListingPhotosFormComponent = props => {
  const [state, setState] = useState({ imageUploadRequested: false });
  const [submittedImages, setSubmittedImages] = useState([]);

  const onImageUploadHandler = file => {
    const { listingImageConfig, onImageUpload, listingType } = props;

    if (file) {
      // Create a video element to check resolution and duration
      const video = document.createElement('video');
      const url = URL.createObjectURL(file);

      video.src = url;

      video.onloadedmetadata = () => {
        // Extract video resolution and duration
        const { videoWidth, videoHeight, duration } = video;

        // Ensure resolution is between 1080p and 4k
        const isValidResolution = (videoWidth >= 1920 && videoWidth <= 3840 && videoHeight >= 1080 && videoHeight <= 2160);

        // Ensure video duration is between 25 minutes (1500 seconds) and 3 hours 59 minutes (14340 seconds)
        const isValidDuration = listingType == FILM_PRODUCTS ? (duration >= 1500 && duration <= 14340) : (duration >= 600 && duration <= 3540);

        if (isValidResolution && isValidDuration) {
          // Valid file - proceed with upload
          setState({ imageUploadRequested: true });

          onImageUpload({ id: `${file.name}_${Date.now()}`, file }, listingImageConfig)
            .then(() => {
              setState({ imageUploadRequested: false });
            })
            .catch(() => {
              setState({ imageUploadRequested: false });
            });
        } else {
          // Invalid file - show an error
          if (!isValidResolution) {
            // alert('Please upload a video with a resolution between 1080p and 4k.');
            return Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'Please upload a video with a resolution between 1080p and 4k.',
              customClass: {
                confirmButton: `${css.confirmButton}`,
              }
            });
          };
        }

        // Revoke the URL after checking video metadata
        URL.revokeObjectURL(url);
      };
    }
  };


  const handleFileChange = (file, assetName, assetType, form) => {
    // const { listing, onCreateFilmGumletAsset } = props;
    const { listing, onCreateFilmGumletAsset } = props;
    const listingId = listing && listing?.id?.uuid;
    const listingTitle = (listing && listing.id && listing.attributes.title) || '';
    const subtitleLanguages = listing?.attributes?.publicData?.subtitle_selection || [];
    const codedSubtitleLanguages = getLanguageCodes(subtitleLanguages);

    if (assetName === ASSET_FILM_VIDEO) {
      const videoElement = document.createElement('video');
      videoElement.src = URL.createObjectURL(file);

      videoElement.onloadedmetadata = () => {
        const videoWidth = videoElement.videoWidth;
        const videoHeight = videoElement.videoHeight;
        const videoDuration = videoElement.duration;

        // Ensure resolution is between 1080p (Full HD) and 4K (UHD)
        const isValidResolution =
          videoWidth >= 1920 && videoWidth <= 4096 && videoHeight >= 1080 && videoHeight <= 2160;

        // Ensure duration is between 45 minutes and 3 hours 59 minutes (converted to seconds)
        const minDuration = 25 * 60; // 45 minutes in seconds
        const maxDuration = 3 * 60 * 60 + 59 * 60; // 3 hours 59 minutes in seconds
        const isValidDuration = videoDuration >= minDuration && videoDuration <= maxDuration;

        // Check if resolution and duration meet the requirements
        if (!isValidResolution) {
          // alert(
          //   'Please upload a video with a resolution between 1080p and 4K (1920x1080 to 3840x2160).'
          // );
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Please upload a video with a resolution between 1080p and 4K (1920x1080 to 3840x2160).',
            customClass: {
              confirmButton: `${css.confirmButton}`,
            }
          });
          return;
        }

        if (!isValidDuration) {
          // alert(
          //   'Please upload a video with a duration between 25 minutes and 3 hours 59 minutes.'
          // );
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Please upload a video with a duration between 25 minutes and 3 hours 59 minutes.',
            customClass: {
              confirmButton: `${css.confirmButton}`,
            }
          });
          return;
        }

        // If both conditions are met, call 
        onCreateFilmGumletAsset({
          file,
          assetType,
          assetName,
          listingId,
          listingType: FILM_PRODUCTS,
          assetTitle: formatLabel(listingTitle),
          assetCategory: ASSET_CATEGORY_FILM,
          listingTitle,
          subtitleLanguages: codedSubtitleLanguages
        });
      };
    }
  };

  return (
    <FinalForm
      {...props}
      keepDirtyOnReinitialize={true}
      mutators={{ ...arrayMutators }}
      render={formRenderProps => {
        const {
          form,
          className,
          fetchErrors,
          handleSubmit,
          intl,
          invalid,
          onRemoveImage,
          disabled,
          ready,
          saveActionMsg,
          updated,
          updateInProgress,
          touched,
          errors,
          values,
          listingImageConfig,
          listingFilmAssetInProgress,
          listingFilmAssetError,
          onDeleteFilmAsset,
          listing,
          listingDeleteFilmAssetInProgress,
          listingDeleteFilmAssetError,
          isQueued,
          hasTransaction,
          isPublished,
          history
        } = formRenderProps;

        const { filmVideo } = values || {};
        // console.log(values);
        const images = values.images;
        const { aspectWidth = 1, aspectHeight = 1, variantPrefix } = listingImageConfig;

        const { publishListingError, showListingsError, updateListingError, uploadImageError } =
          fetchErrors || {};
        const uploadOverLimit = isUploadImageOverLimitError(uploadImageError);

        // imgs can contain added images (with temp ids) and submitted images with uniq ids.
        const arrayOfImgIds = imgs => imgs.map(i => (typeof i.id === 'string' ? i.imageId : i.id));
        const imageIdsFromProps = arrayOfImgIds(images);
        const imageIdsFromPreviousSubmit = arrayOfImgIds(submittedImages);
        const imageArrayHasSameImages = isEqual(imageIdsFromProps, imageIdsFromPreviousSubmit);
        const submittedOnce = submittedImages.length > 0;
        const pristineSinceLastSubmit = submittedOnce && imageArrayHasSameImages;

        const submitReady = (updated && pristineSinceLastSubmit) || ready;
        const submitInProgress = updateInProgress;
        const submitDisabled =
          invalid || disabled || submitInProgress || state.imageUploadRequested || ready || (!isQueued && !listingFilmAssetInProgress && !filmVideo?.asset_id);
        const imagesError = touched.images && errors?.images && errors.images[ARRAY_ERROR];

        const classes = classNames(css.root, className);


        const dragAndDropHandler = (file, formApi, fileUploadHandler) => {
          fileUploadHandler(file, ASSET_FILM_VIDEO, GUMLET_ASSET, formApi);
        };

        const isProcessing = () => {
          return gumletProcessingStatus.includes(filmVideo?.status);
        };

        const isPendingApproval = () => {
          return pendingApproval.includes(filmVideo?.status);
        };

        const handleDeleteAsset = (data, formApi) => {
          onDeleteFilmAsset(data)
          // .then(res => {
          //   if (!!res) {
          //     formApi.change('filmVideo', null)
          //   }
          // });
        };

        return (
          <Form
            className={classes}
            onSubmit={e => {
              setSubmittedImages(images);
              handleSubmit(e);
            }}
          >
            {updateListingError || listingFilmAssetError ? (
              <p className={css.error}>
                <FormattedMessage id="EditListingPhotosForm.updateFailed" />
              </p>
            ) : null}

            <div className={css.imagesFieldArray}>
              <div className={css.filmVideoContainer}>
                {filmVideo && filmVideo.asset_id ? (
                  <RemoveImageButton
                    className={css.removeBtn}
                    onClick={() => {
                      if (!listingFilmAssetInProgress && !listingDeleteFilmAssetInProgress) {
                        handleDeleteAsset({
                          // assetName: ASSET_FILM_VIDEO,
                          assetId: filmVideo.asset_id,
                          listingId: listing.id.uuid,
                          // assetType: GUMLET_ASSET
                        }, form)
                      }
                    }}
                  />) : null}
                {isQueued && !listingFilmAssetInProgress && !listingFilmAssetError ? (
                  <div className={css.episodeFile}>
                    <FormattedMessage id='EditListingEpisodesForm.queuedToUpload' />
                  </div>
                ) : listingFilmAssetInProgress || listingDeleteFilmAssetInProgress ? (
                  <div className={css.episodeFile}>
                      {listingFilmAssetInProgress?.progress >= 0 ? (
                        <FormattedMessage id='EditListingPhotosForm.inProgress' values={{ progress: listingFilmAssetInProgress?.progress }} />
                      ) : <IconSpinner />}
                  </div>
                ) : isProcessing() ? (
                  <div className={css.episodeFile}>
                        <FormattedMessage
                          id="EditListingEpisodesForm.processingVideo"
                          values={{ status: filmVideo?.status === STATUS_UPLOAD_PENDING ? 'uploadPending' : 'processing' }}
                        />
                  </div>
                ) : (filmVideo?.status == ERRORED_STATUS) ? (
                  <div className={css.episodeFile}>
                    <FormattedMessage id="EditListingEpisodesForm.ErrorVideo" />
                  </div>
                ) : isPendingApproval() ? (
                  <div className={css.pendingApproval}>
                    <ReactPlayer
                      url={filmVideo && filmVideo.playback_url}
                      controls
                      width="100%"
                      height="100%"
                    />
                  </div>) :
                  <DragAndDrop
                    acceptedFileType="video"
                    handleDrop={files => {
                      dragAndDropHandler(files[0], form, handleFileChange)
                    }}
                  >
                    <FieldAddImage
                      id="filmVideo"
                      name="filmVideo"
                      accept={ACCEPT_VIDEOS}
                      label={
                        <span className={css.chooseImageText}>
                          <IconCollection icon="icon-upload" />
                          <span className={css.chooseImage}>
                            <FormattedMessage id="EditListingPhotosForm.chooseImage" />
                          </span>
                          <span className={css.imageTypes}>
                            <FormattedMessage id="EditListingPhotosForm.imageTypes" />
                          </span>
                        </span>
                      }
                      type="file"
                      disabled={state.imageUploadRequested}
                      formApi={form}
                      onImageUploadHandler={handleFileChange}
                      aspectWidth={aspectWidth}
                      aspectHeight={aspectHeight}
                    />
                  </DragAndDrop>}

              </div>
            </div>

            {listingFilmAssetError ? (
              <div className={css.arrayError}>{listingFilmAssetError}</div>
            ) : listingDeleteFilmAssetError ? (
              <div className={css.arrayError}>{listingDeleteFilmAssetError}</div>
            ) : null}

            <ImageUploadError
              uploadOverLimit={uploadOverLimit}
              uploadImageError={uploadImageError}
            />

            {/* <p className={css.tip}>
              <FormattedMessage id="EditListingPhotosForm.addImagesTip" />
            </p> */}

            <PublishListingError error={publishListingError} />
            <ShowListingsError error={showListingsError} />

            <div className={css.buttonsGroup}>
              {!isPublished ? <Button
                type="button"
                // disabled={disableSubmit}
                // inProgress={saveDraftInProgress}
                className={css.saveDraftButton}
                onClick={() => {
                  // we don't want to set any value as assets are already saved.
                  history.push('/listings');
                }}
              >
                <FormattedMessage id='EditListingPhotosForm.draftButton' />
              </Button> : null}

              <Button
                className={css.submitButton}
                type="submit"
                inProgress={submitInProgress}
                disabled={submitDisabled}
                ready={submitReady}
              >
                {saveActionMsg}
              </Button>
            </div>
          </Form>
        );
      }}
    />
  );
};

EditListingPhotosFormComponent.defaultProps = { fetchErrors: null };

EditListingPhotosFormComponent.propTypes = {
  fetchErrors: shape({
    publishListingError: propTypes.error,
    showListingsError: propTypes.error,
    uploadImageError: propTypes.error,
    updateListingError: propTypes.error,
  }),
  intl: intlShape.isRequired,
  onImageUpload: func.isRequired,
  onSubmit: func.isRequired,
  saveActionMsg: string.isRequired,
  disabled: bool.isRequired,
  ready: bool.isRequired,
  updated: bool.isRequired,
  updateInProgress: bool.isRequired,
  onRemoveImage: func.isRequired,
  listingImageConfig: object.isRequired,
};

export default compose(injectIntl)(EditListingPhotosFormComponent);
