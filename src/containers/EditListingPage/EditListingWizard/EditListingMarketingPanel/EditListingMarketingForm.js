import React, { useState } from 'react';
import { Form, Field } from 'react-final-form';
import { injectIntl, FormattedMessage } from '../../../../util/reactIntl';
import css from './EditListingMarketingForm.module.css';
import { compose } from 'redux';
import {
  ASSET_MARKETING__BANNER,
  ASSET_MARKETING_POSTER,
  ASSET_MARKETING_TRAILER,
  ERRORED_STATUS,
  GUMLET_ACCEPTED_VIDEO_FORMATS,
  GUMLET_ASSET,
  GUMLET_PROCESSING_STATUS,
  LISTING_STATE_PUBLISHED,
  LISTING_TYPE_FILMS,
  LISTING_TYPE_SERIES,
  STATUS_DELETED,
  STATUS_DOWNLOADING,
  STATUS_GENERATING_SUBTITLE,
  STATUS_PENDING_APPROVAL,
  STATUS_PROCESSING,
  STATUS_QUEUED,
  STATUS_UPLOAD_PENDING,
  STATUS_UPLOAD_READY,
  STATUS_VALIDATED,
  WASABI_ASSET
} from '../../../../constants';
import IconCollection from '../../../../components/IconCollection/IconCollection';
import classNames from 'classnames';
import { Button, FieldCheckbox, IconSpinner, ResponsiveImage, VideoPlayer } from '../../../../components';
import { SERIES_PRODUCTS } from '../../../../util/types';
import { formatLabel } from '../../../../util/dataExtractor';
import { getLanguageCodes, wasabiImageData } from '../../../../util/data';
import Swal from 'sweetalert2';


const gumletProcessingStatus = GUMLET_PROCESSING_STATUS;
const pendingApproval = [STATUS_PENDING_APPROVAL, STATUS_UPLOAD_READY, STATUS_GENERATING_SUBTITLE];

const posterMinimumWidth = 720;
const posterMinimumHeight = 1280;
const bannerMinimumWidth = 1920;
const bannerMinimumHeight = 1080;

const sourceUrl = process.env.REACT_APP_GUMLET_SOURCE_URL;

export const RemoveImageButton = props => {
  const { className, rootClassName, onClick } = props;
  const classes = classNames(rootClassName || css.removeImage, className);
  return (
    <button className={classes} onClick={onClick} type='button'>

      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M16.5 0H1.5C1.10218 0 0.720644 0.158035 0.43934 0.43934C0.158035 0.720644 0 1.10218 0 1.5V16.5C0 16.8978 0.158035 17.2794 0.43934 17.5607C0.720644 17.842 1.10218 18 1.5 18H16.5C16.8978 18 17.2794 17.842 17.5607 17.5607C17.842 17.2794 18 16.8978 18 16.5V1.5C18 1.10218 17.842 0.720644 17.5607 0.43934C17.2794 0.158035 16.8978 0 16.5 0ZM14.0306 12.9694C14.1003 13.0391 14.1556 13.1218 14.1933 13.2128C14.231 13.3039 14.2504 13.4015 14.2504 13.5C14.2504 13.5985 14.231 13.6961 14.1933 13.7872C14.1556 13.8782 14.1003 13.9609 14.0306 14.0306C13.9609 14.1003 13.8782 14.1556 13.7872 14.1933C13.6961 14.231 13.5985 14.2504 13.5 14.2504C13.4015 14.2504 13.3039 14.231 13.2128 14.1933C13.1218 14.1556 13.0391 14.1003 12.9694 14.0306L9 10.0603L5.03063 14.0306C4.88989 14.1714 4.69902 14.2504 4.5 14.2504C4.30098 14.2504 4.11011 14.1714 3.96937 14.0306C3.82864 13.8899 3.74958 13.699 3.74958 13.5C3.74958 13.301 3.82864 13.1101 3.96937 12.9694L7.93969 9L3.96937 5.03063C3.82864 4.88989 3.74958 4.69902 3.74958 4.5C3.74958 4.30098 3.82864 4.11011 3.96938 3.96938C4.11011 3.82864 4.30098 3.74958 4.5 3.74958C4.69902 3.74958 4.88989 3.82864 5.03063 3.96937L9 7.93969L12.9694 3.96937C13.1101 3.82864 13.301 3.74958 13.5 3.74958C13.699 3.74958 13.8899 3.82864 14.0306 3.96937C14.1714 4.11011 14.2504 4.30098 14.2504 4.5C14.2504 4.69902 14.1714 4.88989 14.0306 5.03063L10.0603 9L14.0306 12.9694Z" fill="white" />
      </svg>
    </button>
  );
};

const EditListingMarketingForm = (props) => {
  const {
    params,
    submitButtonText,
    listing,
    onCreateMarketingAssets,
    onDeleteMarketingAsset,
    deleteMarketingAssetsInProgress,
    deleteMarketingAssetsError,
    updateInProgress,
    onSubmit,
    initialValues,
    onSaveDraft,
    saveDraftInProgress,
    intl,
    isPublished,
    allowCreateNewVersion
  } = props;
  const [playing, setPlaying] = useState(false);
  const { listingType } = params || {};
  const { attributes } = listing || {};
  const { state, publicData, title = '' } = attributes || {};
  const listingTitle = title;
  const { markAsDraft, deletedListing } = publicData || {};
  const canCreateNew = (state === LISTING_STATE_PUBLISHED) && allowCreateNewVersion && !deletedListing && !markAsDraft;

  const handleFormSubmit = (e) => {
    // we don't want to set any value as assets are already saved.
    const { freeEpisode, marketingPoster, marketingBanner, marketingTrailer } = e || {};

    const freeEpisodeMaybe = freeEpisode && freeEpisode.length > 0
      ? { freeEpisode: true }
      : { freeEpisode: false };


    if (!marketingPoster || !marketingBanner || (!marketingTrailer?.inProgress && !marketingTrailer?.isQueued && !marketingTrailer?.asset_id)) {
      // return alert('please define all the fields')
      return Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Please define all the fields',
        customClass: {
          confirmButton: `${css.confirmButton}`,
        },
      })
    };

    const publicData = {
      ...freeEpisodeMaybe,
      marketingPoster: wasabiImageData(marketingPoster),
      marketingBanner: wasabiImageData(marketingBanner)
    };

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
          onSubmit({ publicData, newVersion: true });
        } else {
          onSubmit({ publicData });
        }
      })
    } else {
      onSubmit({ publicData });
    }
  };

  const listignTypeInCamelCase = listingType === LISTING_TYPE_SERIES
    ? 'seriesProducts'
    : listingType === LISTING_TYPE_FILMS
      ? 'filmProducts'
      : '';

  const handleImageFileUpload = async (event, assetName, formApi) => {
    const file = event.target.files[0]; // Get the uploaded file

    // Check if a file was selected
    if (!file) {
      console.log("No file selected.");
      return;
    }

    // Check if the file is an image by inspecting the MIME type
    const validImageTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!validImageTypes.includes(file.type)) {
      console.log("The selected file is not an image.");
      // Handle the case where the file is not an image
      // alert('Please upload an Image file');
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Please upload an Image file',
        customClass: {
          confirmButton: `${css.confirmButton}`,
        },
      })
      return;
    };

    // Validate the resolutions.
    const imageElement = document.createElement('img');
    imageElement.src = URL.createObjectURL(file);

    // Use the correct event 'onload' to ensure image is fully loaded before checking dimensions
    imageElement.onload = () => {
      const imageWidth = imageElement.naturalWidth;
      const imageHeight = imageElement.naturalHeight;

      if (assetName === ASSET_MARKETING_POSTER) {
        if (imageWidth < posterMinimumWidth || imageHeight < posterMinimumHeight) {
          // alert(`Please upload a image with a minimum of ${posterMinimumWidth} * ${posterMinimumHeight} resolution.`);
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: `Please upload a image with a minimum of ${posterMinimumWidth} * ${posterMinimumHeight} resolution.`,
            customClass: {
              confirmButton: `${css.confirmButton}`,
            },
          })
          return;
        };
      }

      if (assetName === ASSET_MARKETING__BANNER) {
        if (imageWidth < bannerMinimumWidth || imageHeight < bannerMinimumHeight) {
          // alert(`Please upload a image with a minimum of ${bannerMinimumWidth} * ${bannerMinimumHeight}  resolution.`);
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: `Please upload a image with a minimum of ${bannerMinimumWidth} * ${bannerMinimumHeight}  resolution.`,
            customClass: {
              confirmButton: `${css.confirmButton}`,
            },
          })
          return;
        };
      }

      onCreateMarketingAssets({ file, listingId: listing.id.uuid, assetName, listingTitle, assetTitle: formatLabel(listingTitle) })
        .then(data => {
          if (!!data) {
            formApi.change(assetName, data)
          }
        })

    };
  };


  const handleVideoFileUpload = async (event, assetName, formApi) => {

    const file = event.target.files[0];

    const assetTitle = formatLabel(listingTitle) + " " + "(trailer)";
    const subtitleLanguages = listing?.attributes?.publicData?.subtitle_selection || [];
    const codedSubtitleLanguages = getLanguageCodes(subtitleLanguages);

    if (!GUMLET_ACCEPTED_VIDEO_FORMATS.includes(file.type)) {
      // alert(`Please upload a video in ${GUMLET_ACCEPTED_VIDEO_FORMATS.join(", ")}`);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: `Please upload a video in ${GUMLET_ACCEPTED_VIDEO_FORMATS.join(", ")}`,
        customClass: {
          confirmButton: `${css.confirmButton}`,
        },
      })
      return;
    }

    const videoElement = document.createElement('video');
    videoElement.src = URL.createObjectURL(file);

    videoElement.onloadedmetadata = () => {
      const videoWidth = videoElement.videoWidth;
      const videoHeight = videoElement.videoHeight;
      const videoDuration = videoElement.duration;

      // 1920 x 1080 pixels (also known as 1080p Full HD): This means the video has 1920 pixels horizontally and 1080 pixels vertically.
      // Minimum requirement is 1080p and 10 seconds to 5 minutes in length.
      if (videoWidth < 1920 || videoHeight < 1080 || videoDuration < 10 || videoDuration > 305) {
        // alert('Please upload a video with a minimum of 1080p resolution and a duration between 10 seconds and 5 minutes .');
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Please upload a video with a minimum of 1080p resolution and a duration between 10 seconds and 5 minutes .',
          customClass: {
            confirmButton: `${css.confirmButton}`,
          },
        })
        return;
      };

      const assetOptions = {
        file,
        listingId: listing.id.uuid,
        assetName,
        assetTitle,
        listingTitle,
        subtitleLanguages: codedSubtitleLanguages
      };

      // Now upload the file to Gumlet
      onCreateMarketingAssets(assetOptions)
        .then(data => {
          if (!!data) {
            formApi.change(assetName, data)
          }
        })
    };
  };

  const handleDeleteAsset = (data, formApi) => {
    onDeleteMarketingAsset(data);
    // .then(res => {
    //   if (!!res) {
    //     formApi.change(data.assetName, null)
    //   }
    // });
  };

  const renderRemoveButton = (marketingTrailer, formApi) => (
    <RemoveImageButton
      className={css.removeBtn}
      onClick={() =>
        handleDeleteAsset(
          {
            assetName: ASSET_MARKETING_TRAILER,
            key: marketingTrailer?.asset_id,
            listingId: listing.id.uuid,
            assetType: GUMLET_ASSET,
          },
          formApi
        )
      }
    />
  );


  return (
    <Form
      keepDirtyOnReinitialize={true}
      initialValues={initialValues}
      onSubmit={handleFormSubmit}
      render={({ handleSubmit, values, form: formApi }) => {
        const { marketingPoster, marketingTrailer, marketingBanner } = values;
        console.log(values, 'vv');

        const disableSubmit = !marketingPoster?.key ||
          !marketingBanner?.key ||
          (!marketingTrailer?.inProgress && !marketingTrailer?.isQueued && !marketingTrailer?.asset_id) ||
          marketingTrailer.status === STATUS_UPLOAD_PENDING;

        return (
          <form onSubmit={handleSubmit} className={css.formContainer}>
            {/* Film Poster Upload */}
            <div className={css.field}>
              <div className={css.fieldContainer}>
                <div>
                  <div className={css.dimentionText}>
                    <FormattedMessage id='EditListingMarketingForm.FilmPosterDimensions' />
                  </div>
                  <h3 className={css.fieldHeading}><FormattedMessage id='EditListingMarketingForm.posterTitle' values={{ listingType: listignTypeInCamelCase }} /></h3>
                  <p className={css.fieldText}>
                    <FormattedMessage id='EditListingMarketingForm.posterHelperText' />
                  </p>
                  <a href="#" className={css.fieldTextViewCanva}><FormattedMessage id='EditListingMarketingForm.posterViewCanvaTemplate' /></a>
                </div>

                {deleteMarketingAssetsInProgress && deleteMarketingAssetsInProgress[ASSET_MARKETING_POSTER]
                  ? <div className={classNames(css.inProgress)}><div className={css.pendingApprovalText}><IconSpinner /></div> </div> : marketingPoster && marketingPoster.key
                    ? (
                      <div className={classNames(css.poster, marketingPoster?.status === STATUS_PENDING_APPROVAL ? css.pending : '')}>
                        <RemoveImageButton
                          className={css.removeBtn}
                          onClick={() => handleDeleteAsset({
                            assetName: ASSET_MARKETING_POSTER,
                            key: marketingPoster?.key,
                            listingId: listing.id.uuid,
                            assetType: WASABI_ASSET
                          }, formApi)}
                        />
                        <ResponsiveImage
                          gumletImage={{
                            sourceUrl,
                            key: marketingPoster?.key,
                            options: { width: "100%", height: "100%" },
                            css: { objectFit: "cover" }
                          }}
                        />

                        {/* {marketingPoster.status === STATUS_PENDING_APPROVAL
                      ? <p className={css.pendingApprovalText}>{intl.formatMessage({ id: "EditListingMarketingForm.pendingApproval" })}</p>
                      : null} */}
                      </div>
                    ) : (<div className={css.poster}> <Field name="poster" component="input" type="file">
                      {({ input }) => (
                        <label id='poster' className={classNames(css.uploadField, css.posterUploadField)}>
                          {(marketingPoster && marketingPoster.inProgress)
                            ? <p>{intl.formatMessage({ id: "EditListingMarketingForm.imageAssetUploading" })}</p>
                            : (
                              <>
                                <IconCollection icon='icon-img-upload' />
                                <input
                                  {...input}
                                  accept='image/jpeg, image/png, image/webp'
                                  onChange={(e) => handleImageFileUpload(e, ASSET_MARKETING_POSTER, formApi)}
                                  style={{ display: 'none' }} />
                              </>
                            )}
                        </label>
                      )}
                    </Field>
                    </div>)
                }
              </div>
              {marketingPoster && marketingPoster?.error
                ? <p className={css.error}>{intl.formatMessage({ id: "EditListingMarketingForm.errorUplodingAsset" })}</p>
                : deleteMarketingAssetsError && deleteMarketingAssetsError[ASSET_MARKETING_POSTER]
                  ? <p className={css.error}>{intl.formatMessage({ id: "EditListingMarketingForm.errorDeleteAsset" })}</p>
                  : null}
            </div>


            {/* Trailer Upload */}
            <div>
              <div className={css.field}>
                <div className={css.fieldContainer}>
                  <div>
                    <h3 className={css.fieldHeading}><FormattedMessage id='EditListingMarketingForm.trailerTitle' /></h3>
                    <p className={css.fieldText}>
                      <FormattedMessage id='EditListingMarketingForm.trailerHelperText' />
                    </p>
                    <a href="#" className={css.fieldTextViewCanva}><FormattedMessage id='EditListingMarketingForm.trailerResourceCenter' /></a>
                  </div>
                  {(marketingTrailer && marketingTrailer?.asset_id && marketingTrailer?.status == ERRORED_STATUS) ? (
                    <div className={css.trailer}>
                      {renderRemoveButton(marketingTrailer, formApi)}
                      <FormattedMessage id="EditListingEpisodesForm.ErrorVideo" />
                    </div>
                  ) : marketingTrailer && marketingTrailer?.asset_id && gumletProcessingStatus.includes(marketingTrailer?.status)
                      ? (<div className={css.trailer}>
                        {renderRemoveButton(marketingTrailer, formApi)}
                        <span>
                          <FormattedMessage
                            id='EditListingMarketingForm.processing'
                            values={{ status: marketingTrailer?.status === STATUS_UPLOAD_PENDING ? 'uploadPending' : 'processing' }}
                          />
                        </span>
                      </div>)
                    : marketingTrailer && marketingTrailer?.asset_id && (pendingApproval.includes(marketingTrailer?.status))
                      ? (<div className={classNames(css.trailer, css.pendingApproval)}>
                        {renderRemoveButton(marketingTrailer, formApi)}
                        <VideoPlayer
                          videoUrl={marketingTrailer?.playback_url}
                          thumbnailUrl={marketingTrailer?.thumbnail_url}
                          subtitle={marketingTrailer?.subtitle || []}
                          lightbox={true}
                          playing={playing}
                          setPlaying={setPlaying}
                        />

                        {deleteMarketingAssetsInProgress && deleteMarketingAssetsInProgress[ASSET_MARKETING_TRAILER]
                          ? <div className={css.deleteInProgress}><IconSpinner /></div>
                          : null}
                        {/* <p className={css.pendingApprovalText}>{intl.formatMessage({ id: "EditListingMarketingForm.pendingApproval" })}</p> */}
                      </div>)
                      : marketingTrailer && marketingTrailer?.asset_id && (marketingTrailer?.status === STATUS_UPLOAD_READY)
                        ? (<div className={css.trailer}>
                          {renderRemoveButton()}
                          <VideoPlayer
                            videoUrl={marketingTrailer?.playback_url}
                            thumbnailUrl={marketingTrailer?.thumbnail_url}
                            subtitle={marketingTrailer?.subtitle || []}
                            lightbox={true}
                            playing={playing}
                            setPlaying={setPlaying}
                          />
                          {deleteMarketingAssetsInProgress && deleteMarketingAssetsInProgress?.[ASSET_MARKETING_TRAILER]
                            ? <div className={css.pendingApprovalText}><IconSpinner /></div>
                            : null}
                        </div>)
                        : (<Field name="trailer" component="input" type="file">
                          {({ input }) => (
                            <label id='trailer' className={css.uploadField}>
                              {marketingTrailer && (marketingTrailer?.inProgress || marketingTrailer?.isQueued) ? (
                                <div>
                                  <span className={css.assetUploading}>
                                    {intl.formatMessage({ id: "EditListingMarketingForm.assetUploading" }, { progress: marketingTrailer?.progress || 0 })}
                                  </span>
                                </div>
                              ) : (<span className={css.uploadIcon}>
                                <IconCollection icon='icon-video-upload' />
                              </span>)}
                              {marketingTrailer && marketingTrailer?.status === STATUS_DELETED && !marketingTrailer?.inProgress
                                ? <span>{intl.formatMessage({ id: "EditListingMarketingForm.statusDeleted" })}</span>
                                : null}
                              <input
                                id='trailer'
                                type="file"
                                accept={GUMLET_ACCEPTED_VIDEO_FORMATS.join(", ")}
                                {...input}
                                style={{ display: 'none' }}
                                onChange={(e) => handleVideoFileUpload(e, ASSET_MARKETING_TRAILER, formApi)}
                                disabled={marketingTrailer && marketingTrailer?.inProgress}
                              />
                            </label>
                          )}
                        </Field>)
                  }
                </div>
                {marketingTrailer && marketingTrailer?.error
                  ? <p className={css.error}>{intl.formatMessage({ id: "EditListingMarketingForm.errorUplodingAsset" })}</p>
                  : deleteMarketingAssetsError && deleteMarketingAssetsError[ASSET_MARKETING_TRAILER]
                    ? <p className={css.error}>{intl.formatMessage({ id: "EditListingMarketingForm.errorDeleteAsset" })}</p>
                    : null}
              </div>
            </div>

            {/* Banner Upload */}
            <div class={css.field}>
              <div className={css.fieldContainer}>
                <div>
                <div className={css.dimentionText}>
                  <FormattedMessage id='EditListingMarketingForm.BannerDimensions' />
                  </div>
                  <h3 className={css.fieldHeading}><FormattedMessage id='EditListingMarketingForm.bannerTitle' /></h3>
                  <p className={css.fieldText}>
                    <FormattedMessage id='EditListingMarketingForm.bannerHelperText' />
                  </p>
                  <a href="#" className={css.fieldTextViewCanva}><FormattedMessage id='EditListingMarketingForm.bannerCanvaTemplate' /></a>
                </div>
                {marketingBanner && marketingBanner.key ?
                  (<div className={classNames(css.banner, marketingBanner.status === STATUS_PENDING_APPROVAL ? css.pending : '')}>
                    <RemoveImageButton
                      className={css.removeBtn}
                      onClick={() => handleDeleteAsset({
                        assetName: ASSET_MARKETING__BANNER,
                        key: marketingBanner.key,
                        listingId: listing.id.uuid,
                        assetType: WASABI_ASSET
                      }, formApi)}
                    />
                    <ResponsiveImage
                      gumletImage={{
                        sourceUrl,
                        key: marketingBanner?.key,
                        options: { width: "100%", height: "100%" },
                        css: { objectFit: "cover" }
                      }}
                    />
                    {deleteMarketingAssetsInProgress && deleteMarketingAssetsInProgress[ASSET_MARKETING__BANNER]
                      ? <div className={css.deleteInProgress}><IconSpinner /></div>
                      : null}
                    {/* {marketingBanner.status === STATUS_PENDING_APPROVAL
                    ? <p className={css.pendingApprovalText}>{intl.formatMessage({ id: "EditListingMarketingForm.pendingApproval" })}</p>
                    : null} */}
                  </div>)
                  : (<Field name="banner" component="input" type="file">
                    {({ input }) => (
                      <label id='banner' className={css.uploadField}>
                        {marketingBanner && marketingBanner?.inProgress
                          ? <p>{intl.formatMessage({ id: "EditListingMarketingForm.imageAssetUploading" })}</p>
                          : <span className={css.uploadIcon}>
                            <IconCollection icon='icon-img-upload' />
                          </span>}
                        <input
                          id='banner'
                          type="file"
                          accept="image/png, image/jpeg"
                          {...input}
                          style={{ display: 'none' }}
                          onChange={(e) => handleImageFileUpload(e, ASSET_MARKETING__BANNER, formApi)}
                        />
                      </label>
                    )}
                  </Field>)}
              </div>
              {marketingBanner && marketingBanner.error
                ? <p class={css.error}>{intl.formatMessage({ id: "EditListingMarketingForm.errorUplodingAsset" })}</p>
                : deleteMarketingAssetsError && deleteMarketingAssetsError[ASSET_MARKETING__BANNER]
                  ? <p className={css.error}>{intl.formatMessage({ id: "EditListingMarketingForm.errorDeleteAsset" })}</p>
                  : null}
            </div>

            {listingType == SERIES_PRODUCTS ? <div className={css.freeEpisodeContainer}>
              <div className={css.freeEpisodeTexts}>
                <h3 className={css.fieldHeading}><FormattedMessage id='EditListingMarketingForm.freeEpisodeHeading' /></h3>
                <p className={css.fieldText}>
                  <FormattedMessage id='EditListingMarketingForm.freeEpisodeHelperText' />
                </p>
              </div>
              <div>
                <FieldCheckbox
                  className={css.freeEpisodeCheckbox}
                  id="freeEpisode"
                  name="freeEpisode"
                  label={intl.formatMessage({ id: "EditListingMarketingForm.freeEpisodeFieldLabel" })}
                  value="true"
                  isRadio={true}
                />
              </div>
            </div> : null}

            {/* Buttons */}
            <div className={css.buttonsGroup}>
              {!isPublished ? <Button
                type="button"
                disabled={disableSubmit}
                inProgress={saveDraftInProgress}
                className={css.saveDraftButton}
                onClick={() => {
                  // we don't want to set any value as assets are already saved.
                  const { freeEpisode, marketingPoster, marketingBanner, marketingTrailer } = values || {};

                  const freeEpisodeMaybe = freeEpisode && freeEpisode.length > 0
                    ? { freeEpisode: true }
                    : { freeEpisode: false };

                  if (!marketingPoster || !marketingBanner) {
                    // return alert('please define all the fields')
                    return Swal.fire({
                      icon: 'warning',
                      title: 'Please define all the fields',
                      showConfirmButton: false,
                      timer: 1500
                    })
                  };

                  const publicData = {
                    ...freeEpisodeMaybe,
                    marketingPoster: wasabiImageData(marketingPoster),
                    marketingBanner: wasabiImageData(marketingBanner)
                  };
              
                  onSaveDraft({ publicData });
                }}
              >
                <FormattedMessage id='EditListingMarketingPanel.draftButton' />
              </Button> : null}

              <Button type="submit" disabled={disableSubmit} inProgress={updateInProgress && !saveDraftInProgress} className={css.submitButton}><span>{submitButtonText}</span></Button>
            </div>
          </form>
        )
      }}
    />
  );
};

export default compose(injectIntl)(EditListingMarketingForm);