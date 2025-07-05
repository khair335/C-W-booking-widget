import React, { useState } from 'react';
import { Form, Field } from 'react-final-form';
import { FieldArray } from 'react-final-form-arrays';
import arrayMutators from 'final-form-arrays';
import ReactPlayer from 'react-player';
import { compose } from 'redux';
import { v4 as uuidv4 } from 'uuid';
import {
  Button,
  DragAndDrop,
  FieldTextInput,
  H2,
  H4,
  IconSpinner,
  Modal,
  ResponsiveImage,
  SecondaryButton,
  VideoPlayer,
} from '../../../../components';
import { manageDisableScrolling } from '../../../../ducks/ui.duck';
import * as validators from '../../../../util/validators';

import {
  ASSET_EPISODE_THUMBNAIL,
  ASSET_EPISODE_VIDEO,
  GUMLET_ASSET,
  STATUS_APPROVED,
  STATUS_DOWNLOADING,
  STATUS_GENERATING_SUBTITLE,
  STATUS_PENDING_APPROVAL,
  STATUS_PROCESSING,
  STATUS_UPLOAD_PENDING,
  STATUS_UPLOAD_READY,
  WASABI_ASSET,
  STATUS_VALIDATED,
  GUMLET_ACCEPTED_VIDEO_FORMATS,
  STATUS_QUEUED,
  STATUS_UPLOADING,
  ERRORED_STATUS,
  ASSET_CATEGORY_EPISODE,
  GUMLET_PROCESSING_STATUS,
} from '../../../../constants';
import { FormattedMessage, injectIntl } from '../../../../util/reactIntl';
import css from './EditListingEpisodesForm.module.css';
import IconCollection from '../../../../components/IconCollection/IconCollection';
import { truncate } from 'lodash';
import { RemoveImageButton } from '../EditListingMarketingPanel/EditListingMarketingForm';
import { formatCardDuration, formatLabel } from '../../../../util/dataExtractor';
import { getLanguageCodes, truncateEpisodeDescription } from '../../../../util/data';
import Swal from 'sweetalert2';

const MINIMUM_DESCRIPTION = 10;
const MAXMIMUM_DESCRIPTION = 500;

const gumletProcessingStatus = GUMLET_PROCESSING_STATUS;
const pendingApproval = [STATUS_PENDING_APPROVAL, STATUS_UPLOAD_READY];
const videoReady = [STATUS_APPROVED, STATUS_PENDING_APPROVAL];

const MINIMUM_EPISODES_REQUIRED = 3;

const sourceUrl = process.env.REACT_APP_GUMLET_SOURCE_URL;

const findInCompleteEpisode = episodes =>
  episodes.find(
    epi =>
      !epi.sequenceNumber ||
      !epi.title?.trim() ||
      !epi.description?.trim() ||
      (!epi[ASSET_EPISODE_VIDEO]?.asset_id && !epi[ASSET_EPISODE_VIDEO]?.isQueued && !epi[ASSET_EPISODE_VIDEO]?.inProgress) ||
      !epi[ASSET_EPISODE_THUMBNAIL]?.key ||
      !epi.added
  );

const EpisodeCard = props => {
  const [playing, setPlaying] = useState(false);
  const {
    episodeNumber,
    duration,
    title,
    description,
    videoUrl,
    onEdit,
    isFree,
    videoReady,
    thumbnailKey,
    isQueued,
    inProgress,
    progress = 0,
    subtitle
  } = props;

  return (
    <div className={css.showEpisodeCard}>
      <div className={css.videoWrapper}>
        {/* Video Player */}
        {videoReady ? (
          <VideoPlayer
            videoUrl={videoUrl}
            subtitle={subtitle}
            lightbox={true}
            gumletImage={{
              sourceUrl,
              key: thumbnailKey,
              options: { width: '100%', height: '100%' },
              styles: { objectFit: 'cover' },
            }}
            playing={playing}
            setPlaying={setPlaying}
          />
        ) : isQueued && !inProgress ? (
          <p className={css.message}><FormattedMessage id='EditListingEpisodeForm.episodeFileIsQueued' /></p>
        ) : inProgress ? (
          <p className={css.message}><FormattedMessage id='EditListingEpisodeForm.episodeFileInProgress' values={{ progress }} /></p>
        ) : (<div className={css.videoPlaceHolder}>
          {thumbnailKey ? <ResponsiveImage
            gumletImage={{
              sourceUrl,
              key: thumbnailKey,
              options: { width: '100%', height: '100%' },
              styles: { objectFit: 'cover' },
            }}
            className={css.videoPlaceholder}
          /> : <IconCollection icon="video-placeholder" />}
        </div>)}
      </div>

      <div className={css.episodeInfo}>
        {/* Episode Number and Duration */}
        <div className={css.episodeMeta}>
          <span>
            <FormattedMessage
              id="EditListingEpisodeForm.episodeNumber"
              values={{ number: episodeNumber }}
            />
          </span>
          {!!duration ? (
            <>
              <span> | </span>
              <span>
                {formatCardDuration(duration)}
              </span>
            </>
          ) : null}
        </div>

        {/* Episode Title */}
        <h3 className={css.episodeTitle}>{title}</h3>

        {/* Episode Description */}
        <p className={css.episodeDescription}>{truncateEpisodeDescription(description)}</p>

        {/* Action Buttons */}
        <div className={css.episodeActionsWrapper}>
          <div className={css.episodeActions}>
            <button
              onClick={() => {
                onEdit();
                setPlaying(false);
              }}
              className={css.editButton}
              type="button"
            >
              <IconCollection icon="icon-edit" /> &nbsp;
              <span role="img" aria-label="edit">
                Edit Episode
              </span>
            </button>

            {isFree && (
              <label className={css.freeLabel}>
                <input type="checkbox" checked readOnly /> <span>Free Episode</span>
              </label>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const EditListingEpisodesForm = props => {
  const {
    listing,
    onCreateEpisodeAsset,
    submitButtonText,
    onAddEpisode,
    addEpisodeInProgress,
    addEpisodeError,
    onDeleteEpisode,
    deleteEpisodeInProgress,
    deleteEpisodeError,
    onSaveDraft,
    saveDraftInProgress,
    updateInProgress,
    onSubmit,
    isFirstEpisodeFree,
    intl,
    isPublished,
    onDeleteEpisodeAsset,
    setInitialState,
    canCreateNew
  } = props;

  const [isModalOpen, setModalOpen] = useState(false);
  const [modalIndex, setModalIndex] = useState(null);
  const [playing, setPlaying] = useState(false);

  const listingTitle = (listing && listing.id && listing.attributes.title) || '';

  const openModal = episodeId => {
    setModalOpen(true);
    setModalIndex(episodeId);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalIndex(null);
    setPlaying(false);
  };

  const handleFileChange = (file, episodeId, assetName, assetType, index) => {
    const listingId = listing.id.uuid;
    const assetTitle = formatLabel(listingTitle) + ' ' + `(Episode ${(index + 1)})`;
    const subtitleLanguages = listing?.attributes?.publicData?.subtitle_selection || [];
    const codedSubtitleLanguages = getLanguageCodes(subtitleLanguages);

    if (assetName === ASSET_EPISODE_VIDEO) {
      const videoElement = document.createElement('video');
      videoElement.src = URL.createObjectURL(file);

      videoElement.onloadedmetadata = () => {
        const videoWidth = videoElement.videoWidth;
        const videoHeight = videoElement.videoHeight;
        const videoDuration = videoElement.duration;

        // 1920 x 1080 pixels (also known as 1080p Full HD): This means the video has 1920 pixels horizontally and 1080 pixels vertically.

        const minimumDuration = 10 * 60; // 10 minutes in seconds
        const maximumDuration = 60 * 60; // 59 minutes in seconds

        // Assuming `videoDuration` is in seconds
        if (
          videoWidth < 1920 ||
          videoHeight < 1080 ||
          videoDuration < minimumDuration ||
          videoDuration > maximumDuration
        ) {
          // alert(
          //   'Please upload a video with a minimum resolution of 1080p and a duration between 10 to 59 minutes.'
          // );
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Please upload a video with a minimum resolution of 1080p and a duration between 10 to 59 minutes.',
            customClass: {
              confirmButton: `${css.confirmButton}`,
            },
          });
          return;
        }

        onCreateEpisodeAsset({
          file,
          episodeId,
          assetType,
          assetName,
          listingId,
          assetTitle,
          assetCategory: ASSET_CATEGORY_EPISODE,
          listingTitle,
          subtitleLanguages: codedSubtitleLanguages
        })
      };
    } else if (assetName === ASSET_EPISODE_THUMBNAIL) {
      const thumbnailElement = document.createElement('img');
      thumbnailElement.src = URL.createObjectURL(file);

      // Use the correct event 'onload' to ensure image is fully loaded before checking dimensions
      thumbnailElement.onload = () => {
        const thumbnailWidth = thumbnailElement.naturalWidth;
        const thumbnailHeight = thumbnailElement.naturalHeight;

        if (thumbnailWidth < 1280 || thumbnailHeight < 720) {
          // alert('Please upload a thumbnail with a minimum of 720 resolution.');
          return Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Please upload a thumbnail with a minimum of 720 resolution.',
            customClass: {
              confirmButton: `${css.confirmButton}`,
            }
          });
        }
        // Proceed with further processing after validation
        onCreateEpisodeAsset({
          file,
          episodeId,
          assetType,
          assetName,
          listingId,
        })
      };
    }
  };

  const handleUpdateListing = async (episodeVals, values, formApi, adding) => {
    const { episodeId, sequenceNumber, title, description, videoFile, thumbnailFile } = episodeVals;
    const { isQueued, inProgress, asset_id } = videoFile || {};
    if (!thumbnailFile?.key ||
      !title ||
      !description ||
      !episodeId ||
      !sequenceNumber ||
      (!asset_id && !isQueued && !inProgress)
    ) {
      if(adding) {
        return Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Please define all the given fields.',
          customClass: {
            confirmButton: `${css.confirmButton}`,
          }
        })
      }
      return;
    }

    const videoFileMaybe = !!asset_id ? { videoFile } : {};
    let params = {
      listingId: listing.id.uuid,
      episodeId,
      sequenceNumber,
      title,
      description,
      thumbnailFile,
      ...videoFileMaybe
    };

    //  Check if other episodes are ready, In case they're being processesed,
    //  we can't create a new version.
    const areOtherEpisodesReady = values.episodes.filter(epi => (epi.episodeId !== episodeId) && epi.added).every(epi => {
      const { status, asset_id } = epi[ASSET_EPISODE_VIDEO] || {};
      return !gumletProcessingStatus.includes(status);
    });

    if (canCreateNew && areOtherEpisodesReady && adding) {
      const { isConfirmed } = await Swal.fire({
        title: "Want to create a new version?",
        text: "Are you sure you want to create a new version?",
        showCancelButton: true,
        confirmButtonText: "Create New Version",
        cancelButtonText: "Update Existing Version",
        customClass: {
          confirmButton: `${css.confirmButton}`,
          cancelButton: `${css.cancelButton}`,
        },
      })
     
      if (isConfirmed) {
        params = { ...params, newVersion: true }
      };
    };

    const res = await onAddEpisode(params);
    if (!!res) {
      const { episodes } = values;
      const episodeInd = episodes.findIndex(epi => epi.episodeId === episodeId);
      let currentEpisode = episodes[episodeInd];
      currentEpisode = {
        ...currentEpisode,
        added: true,
      };
      let updatedEpisodes = [...episodes];
      updatedEpisodes[episodeInd] = currentEpisode;
      // push one more if there is no empty input
      const hasEmptyInput = findInCompleteEpisode(updatedEpisodes);
      if (!hasEmptyInput) {
        updatedEpisodes.push({ episodeId: uuidv4(), added: false });
      }
      formApi.change('episodes', updatedEpisodes);
      closeModal(); // on close modal if operation was successfull
    }
  };

  const handleFormSubmit = e => {
    onSubmit({});
  };

  // Sequence
  const sequenceErrorMessage = intl.formatMessage({
    id: 'EditListingEpisodesForm.squenceErrorMessage',
  });
  const sequenceMaxErrorMessage = intl.formatMessage({
    id: 'EditListingEpisodesForm.sequenceMaxErrorMessage',
  });

  const sequenceMinValidator = validators.sequenceValidator(sequenceErrorMessage);
  const sequenceMaxValidator = validators.sequenceValidator(sequenceMaxErrorMessage);
  const sequenceValidator = validators.composeValidators(
    sequenceMinValidator,
    sequenceMaxValidator
  );

  // title
  const invalidTitleMessage = intl.formatMessage({
    id: 'EditListingEpisodesForm.invalidTitleMessage',
  });
  const minTitleValidator = validators.minLength(invalidTitleMessage, 1);
  const maxTitleValidator = validators.maxLength(invalidTitleMessage, 50);
  const emojiesNotAllowedMsg = intl.formatMessage({
    id: 'EditListingEpisodesForm.emojiesNotAllowed',
  });
  const noEmoji = validators.noEmojiValidator(emojiesNotAllowedMsg);

  const titleValidator = validators.composeValidators(
    minTitleValidator,
    maxTitleValidator,
    noEmoji
  );

  // description
  const invalidDescriptionMessage = intl.formatMessage({
    id: 'EditListingEpisodesForm.invalidDescriptionMessage',
  }, { minimum: MINIMUM_DESCRIPTION, maximum: MAXMIMUM_DESCRIPTION });
  const minDescriptionValidator = validators.minLength(invalidDescriptionMessage, MINIMUM_DESCRIPTION);
  const maxDescriptionValidator = validators.maxLength(invalidDescriptionMessage, MAXMIMUM_DESCRIPTION);
  const descriptionValidator = validators.composeValidators(
    minDescriptionValidator,
    maxDescriptionValidator
  );

  const handleDeleteAsset = (data, formApi) => {
    onDeleteEpisodeAsset(data);
  };

  return (
    <Form
      {...props}
      // keepDirtyOnReinitialize={true}
      mutators={{ ...arrayMutators }}
      onSubmit={handleFormSubmit}
      render={({ handleSubmit, values, form: formApi, invalid }) => {
        const { episodeCount, hasTransaction } = listing?.attributes?.publicData || {
          episodeCount: MINIMUM_EPISODES_REQUIRED,
        };
        const { episodes } = values;

        const isEmpty = (episodeId, assetName) => {
          const episode = episodes.find(e => e.episodeId === episodeId);
          if (assetName === ASSET_EPISODE_VIDEO) {
            return !episode || !episode?.[assetName]
              || (!episode[assetName].asset_id && !episode[assetName].isQueued && !episode[assetName].inProgress)
          };

          return !episode || !episode[assetName] || !episode[assetName]?.key;
        };

        const isInProgress = (episodeId, assetName) => {
          const episode = episodes?.find(epi => epi.episodeId === episodeId)
          return episode?.[assetName]?.inProgress;
        };

        const isQueued = (episodeId, assetName) => {
          const episode = episodes?.find(epi => epi.episodeId === episodeId)
          return episode?.[assetName]?.isQueued && !episode?.[assetName]?.inProgress;
        };


        const isProcessing = (episodeId, assetName) => {
          const episode = episodes.find(e => e.episodeId === episodeId);
          return gumletProcessingStatus.includes(episode?.[assetName]?.status);
        };

        const isErrored = (episodeId, assetName) => {
          const episode = episodes.find(e => e.episodeId === episodeId);
          return ERRORED_STATUS == episode?.[assetName]?.status;
        };

        const isPendingApproval = (episodeId, assetName) => {
          const episode = episodes.find(e => e.episodeId === episodeId);
          return pendingApproval.includes(episode?.[assetName]?.status);
        };

        const hasError = (episodeId, assetName) => {
          const episode = episodes.find(epi => epi.episodeId === episodeId);
          const hasError = !!episode?.[assetName]?.error;
          return hasError;
        };


        const hasAddOrDeleteEpisodeError = episodeId =>
          addEpisodeError[episodeId] || deleteEpisodeError?.[episodeId];

        const shouldShowEpisodeCard = episodeId => {
          const episode = episodes.find(e => e.episodeId === episodeId);
          const { description, title, sequenceNumber } = episode || {};
          const hasAllValues = !!description && !!title && !!sequenceNumber;

          return (
            episode &&
            (episode?.[ASSET_EPISODE_VIDEO]?.isQueued ||
              episode?.[ASSET_EPISODE_VIDEO]?.inProgress ||
              videoReady.includes(episode?.[ASSET_EPISODE_VIDEO]?.status) ||
              gumletProcessingStatus.includes(episode?.[ASSET_EPISODE_VIDEO]?.status)) &&
            hasAllValues
          );
        };


        const handleFieldInputChange = (e, name, episodeId) => {
          const val = e.target.value;
          const episodeInd = episodes.findIndex(epi => epi.episodeId === episodeId);
          const currentEpisode = episodes[episodeInd];
          const updatedEpisode = { ...currentEpisode, [name]: val, editingField: name };
          const updatedEpisodes = [...episodes];
          updatedEpisodes[episodeInd] = updatedEpisode;
          formApi.change('episodes', updatedEpisodes);
          setInitialState(updatedEpisodes);
        };

        // form will be valid to submit if user has uploaded at least three episodes
        const isValidLength = episodes.length >= MINIMUM_EPISODES_REQUIRED;
        const uncompleteEpisode = findInCompleteEpisode(episodes.slice(0, 3));
        const isThumbnailProcessing = episodes.some(episode => episode[ASSET_EPISODE_THUMBNAIL]?.inProgress);
        const allEpisodesCompleted = !uncompleteEpisode;
        const disableForm = !isValidLength || !allEpisodesCompleted || invalid || isThumbnailProcessing;

        return (
          <form onSubmit={handleSubmit} className={css.form}>
            <FieldArray name="episodes">
              {({ fields }) => (
                <>
                  <div className={css.addEpisodes}>
                    {fields.map((name, index) => {
                      const episodeId = fields.value[index]?.episodeId; // Retrieve the UUID from the field's value

                      const isInvalid =
                        !!sequenceValidator(fields.value[index]?.sequenceNumber) ||
                        !!titleValidator(fields.value[index]?.title) ||
                        !!descriptionValidator(fields.value[index]?.description) ||
                        !!isInProgress(episodeId, ASSET_EPISODE_THUMBNAIL) ||
                        !!isEmpty(episodeId, ASSET_EPISODE_VIDEO) ||
                        !!isEmpty(episodeId, ASSET_EPISODE_THUMBNAIL);

                      return (
                        <div key={episodeId}>
                          {shouldShowEpisodeCard(episodeId) ? (
                            <EpisodeCard
                              key={episodeId}
                              episodeNumber={fields.value[index].sequenceNumber}
                              duration={fields.value[index][ASSET_EPISODE_VIDEO].duration}
                              title={fields.value[index].title}
                              description={fields.value[index].description}
                              videoUrl={fields.value[index][ASSET_EPISODE_VIDEO].playback_url}
                              thumbnailUrl={fields.value[index][ASSET_EPISODE_VIDEO].thumbnail_url}
                              onEdit={() => openModal(index)}
                              isFree={index === 0 && isFirstEpisodeFree}
                              videoReady={videoReady.includes(
                                fields.value[index][ASSET_EPISODE_VIDEO].status
                              )}
                              isQueued={fields.value[index]?.[ASSET_EPISODE_VIDEO].isQueued}
                              inProgress={fields.value[index]?.[ASSET_EPISODE_VIDEO].inProgress}
                              thumbnailKey={fields.value[index]?.[ASSET_EPISODE_THUMBNAIL]?.key}
                              progress={fields.value[index]?.[ASSET_EPISODE_VIDEO]?.progress}
                              subtitle={fields.value[index]?.[ASSET_EPISODE_VIDEO]?.subtitle}
                            />
                          ) : (
                            <div className={css.episodeCard}>
                              <div className={css.addEpisode} onClick={() => openModal(index)}>
                                <div className={css.addEpisodeIcon}>
                                  <FormattedMessage id="EditListingEpisodesForm.addEpisode" />
                                  <IconCollection icon="plus-icon" />
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Modal for adding episode details */}
                          <Modal
                            id={'episode-modal'}
                            isOpen={isModalOpen && (modalIndex === index)}
                            // onClose={closeModal}
                            onClose={() => {
                              closeModal()
                              handleUpdateListing(fields.value[index], values, formApi)
                            }}
                            onManageDisableScrolling={manageDisableScrolling}
                          >
                            {isModalOpen && modalIndex === index ? (
                              <div className={css.modal}>
                                <div className={css.modalContent}>
                                  <H4 className={css.modalHeading}>
                                    <FormattedMessage id="EditListingEpisodesForm.addEpisodePlus" />
                                  </H4>
                                  <p className={css.reloadWarning}>
                                    <FormattedMessage id='EditListingEpisodesPanel.reloadWarning' />
                                  </p>
                                  <div className={css.formRow}>
                                    <FieldTextInput
                                      name={`${name}.sequenceNumber`}
                                      type="number"
                                      label={intl.formatMessage({
                                        id: 'EditListingEpisodesForm.sequenceNumber',
                                      })}
                                      id={`sequenceNumber-${episodeId}`}
                                      placeholder={intl.formatMessage({
                                        id: 'EditListingEpisodesForm.sequenceNumber',
                                      })}
                                      validate={sequenceValidator}
                                      className={css.sequenceNumber}
                                      onChange={(e) => handleFieldInputChange(e, 'sequenceNumber', episodeId)}
                                      // disabled={hasTransaction ? true : false}
                                    />
                                    <FieldTextInput
                                      name={`${name}.title`}
                                      type="text"
                                      label={intl.formatMessage({
                                        id: 'EditListingEpisodesForm.episodeTitle',
                                      })}
                                      id={`title-${episodeId}`}
                                      placeholder={intl.formatMessage({
                                        id: 'EditListingEpisodesForm.episodeTitle',
                                      })}
                                      validate={titleValidator}
                                      className={css.episodeTitleInput}
                                      onChange={(e) => handleFieldInputChange(e, 'title', episodeId)}
                                    />
                                  </div>
                                  <FieldTextInput
                                    name={`${name}.description`}
                                    type="textarea"
                                    label={intl.formatMessage({
                                      id: 'EditListingEpisodesForm.description',
                                    })}
                                    id={`description-${episodeId}`}
                                    placeholder={intl.formatMessage({
                                      id: 'EditListingEpisodesForm.description',
                                    })}
                                    validate={descriptionValidator}
                                    className={css.description}
                                    onChange={(e) => handleFieldInputChange(e, 'description', episodeId)}
                                  />

                                  <div className={css.episodeFiles}>
                                    {/* Video File Input */}
                                    <div className={css.episodeFileContainer}>
                                      <h4 className={css.episodeFileHeading}>
                                        <FormattedMessage id="EditListingEpisodeForm.videoFileTitle" />
                                      </h4>
                                      <p className={css.episodeFileDescription}>
                                        <FormattedMessage id="EditListingEpisodeForm.videoFileDescription" />
                                      </p>
                                      {isInProgress(episodeId, ASSET_EPISODE_VIDEO) ? (
                                        <div className={css.episodeFile}>
                                          {episodes[index][ASSET_EPISODE_VIDEO].progress >= 0 ? (
                                            <FormattedMessage id='EditListingEpisodeForm.inProgress' values={{ progress: fields.value[index][ASSET_EPISODE_VIDEO].progress }} />
                                          ) : <IconSpinner />
                                          }
                                        </div>
                                      ) : isQueued(episodeId, ASSET_EPISODE_VIDEO) ? (
                                        <div className={css.episodeFile}>
                                          <FormattedMessage id='EditListingEpisodeForm.queuedToUpload' />
                                        </div>
                                      ) : isProcessing(episodeId, ASSET_EPISODE_VIDEO) ? (
                                        <div className={css.episodeFile}>
                                          <FormattedMessage id="EditListingEpisodesForm.processingVideo"
                                            values={{ status: fields.value[index][ASSET_EPISODE_VIDEO].status === STATUS_UPLOAD_PENDING ? 'uploadPending' : 'processing' }}
                                          />
                                          <RemoveImageButton
                                            className={css.removeBtn}
                                            onClick={() =>
                                              handleDeleteAsset(
                                                {
                                                  assetName: ASSET_EPISODE_VIDEO,
                                                  key:
                                                    fields.value[index][ASSET_EPISODE_VIDEO]
                                                      .asset_id,
                                                  listingId: listing.id.uuid,
                                                  assetType: GUMLET_ASSET,
                                                  episodeId,
                                                  status: fields.value[index][ASSET_EPISODE_VIDEO].status
                                                },
                                                formApi
                                              )
                                            }
                                          />
                                        </div>
                                      ) : isErrored(episodeId, ASSET_EPISODE_VIDEO) ? (
                                        <div className={css.episodeFile}>
                                          <FormattedMessage id="EditListingEpisodesForm.ErrorVideo" />
                                        </div>
                                      ) : isPendingApproval(episodeId, ASSET_EPISODE_VIDEO) ? (
                                                <div className={css.pendingApproval}>
                                                  <RemoveImageButton
                                                    className={css.removeBtn}
                                                    onClick={() =>
                                                      handleDeleteAsset(
                                                        {
                                                          assetName: ASSET_EPISODE_VIDEO,
                                                          key:
                                                            fields.value[index][ASSET_EPISODE_VIDEO]
                                                              .asset_id,
                                                          listingId: listing.id.uuid,
                                                          assetType: GUMLET_ASSET,
                                                          episodeId,
                                                          status: fields.value[index][ASSET_EPISODE_VIDEO].status
                                                        },
                                                        formApi
                                                      )
                                                    }
                                                  />
                                                  <VideoPlayer
                                                    videoUrl={
                                                      fields.value[index][ASSET_EPISODE_VIDEO].playback_url
                                                    }
                                                    subtitle={fields.value[index][ASSET_EPISODE_VIDEO].subtitle}
                                                    lightbox={true}
                                                    thumbnailUrl={
                                                      fields.value[index][ASSET_EPISODE_VIDEO]
                                                        .thumbnail_url
                                                    }
                                                    playing={playing}
                                                    setPlaying={setPlaying}
                                                  />
                                                </div>
                                      ) : (
                                        <DragAndDrop
                                          acceptedFileType="video"
                                          handleDrop={file => {
                                            handleFileChange(
                                              file[0],
                                              episodeId,
                                              ASSET_EPISODE_VIDEO,
                                              GUMLET_ASSET,
                                              index
                                            )
                                          }}
                                        >
                                          <Field name={`${name}.videoFile`}>
                                            {({ input }) => (
                                              <label
                                                htmlFor={`videoFile-${index}`}
                                                className={css.episodeFilesLabel}
                                              >
                                                <div>
                                                  <div className={css.fileTypeWrapper}>
                                                    <span>
                                                      <IconCollection icon="icon-video-upload" />
                                                    </span>

                                                    <div className={css.dragDropText}>
                                                      <FormattedMessage id="EditListingEpisodeForm.videoFileLabel" />
                                                    </div>
                                                    <div className={css.fileTypeText}>
                                                      <FormattedMessage id="EditListingEpisodeForm.videoFileTypeText" />
                                                    </div>
                                                  </div>
                                                  <input
                                                    hidden
                                                    type="file"
                                                    accept={GUMLET_ACCEPTED_VIDEO_FORMATS.join(', ')}
                                                    onChange={e =>
                                                      handleFileChange(
                                                        e.target.files[0],
                                                        episodeId,
                                                        ASSET_EPISODE_VIDEO,
                                                        GUMLET_ASSET,
                                                        index
                                                      )
                                                    }
                                                    className={css.fileInput}
                                                    id={`videoFile-${index}`}
                                                  />
                                                </div>
                                              </label>
                                            )}
                                          </Field>
                                        </DragAndDrop>

                                      )}
                                      {hasError(episodeId, ASSET_EPISODE_VIDEO) ? (
                                        <p className={css.error}>
                                          <FormattedMessage id="EditListingEpisodesForm.uploadVideoError" />
                                        </p>
                                      ) : null}
                                    </div>

                                    {/* Thumbnail File Input */}
                                    <div className={css.episodeFileContainer}>
                                      <h4 className={css.episodeFileHeading}>
                                        <FormattedMessage id="EditListingEpisodeForm.thumbnailFileTitle" />
                                      </h4>
                                      <p className={css.episodeFileDescription}>
                                        <FormattedMessage id="EditListingEpisodeForm.thumbnailFileDescription" />
                                      </p>
                                      {isInProgress(episodeId, ASSET_EPISODE_THUMBNAIL) ? (
                                        <div className={css.episodeFile}>
                                          <IconSpinner />
                                        </div>
                                      ) : isProcessing(episodeId, ASSET_EPISODE_THUMBNAIL) ? (
                                        <div className={css.episodeFile}>
                                          <span>
                                            <FormattedMessage id="EditListingEpisodesForm.processingThumbnail" />
                                          </span>
                                        </div>
                                      ) : isPendingApproval(episodeId, ASSET_EPISODE_THUMBNAIL) ? (
                                        <div className={css.pendingApproval}>
                                          <RemoveImageButton
                                            className={css.removeBtn}
                                            onClick={() =>
                                              handleDeleteAsset(
                                                {
                                                  assetName: ASSET_EPISODE_THUMBNAIL,
                                                  key:
                                                    fields.value[index][ASSET_EPISODE_THUMBNAIL]
                                                      .key,
                                                  listingId: listing.id.uuid,
                                                  assetType: WASABI_ASSET,
                                                  episodeId,
                                                },
                                                formApi
                                              )
                                            }
                                          />

                                          <ResponsiveImage
                                            gumletImage={{
                                              sourceUrl,
                                              key: fields.value[index][ASSET_EPISODE_THUMBNAIL]?.key,
                                              options: { width: '100%', height: '100%' },
                                              styles: { objectFit: 'cover' },
                                            }}
                                          />
                                        </div>
                                      ) : (
                                        <DragAndDrop
                                          acceptedFileType="image"
                                          handleDrop={file => {
                                            handleFileChange(
                                              file[0],
                                              episodeId,
                                              ASSET_EPISODE_THUMBNAIL,
                                              WASABI_ASSET
                                            )
                                          }}
                                        >
                                          <Field name={`${name}.thumbnailFile`}>
                                            {({ input }) => (
                                              <label
                                                htmlFor={`thumbnail-${episodeId}`}
                                                className={css.episodeFilesLabel}
                                              >
                                                <div className={css.fileTypeWrapper}>
                                                  <span>
                                                    <IconCollection icon="icon-img-upload" />
                                                  </span>

                                                  <div className={css.dragDropText}>
                                                    <FormattedMessage id="EditListingEpisodeForm.thumbnailFileLabel" />
                                                  </div>
                                                  <div className={css.fileTypeText}>
                                                    <FormattedMessage id="EditListingEpisodeForm.thumbnailFileTypeText" />
                                                  </div>
                                                </div>
                                                <input
                                                  hidden
                                                  type="file"
                                                  accept=".png, .jpeg, .webp, .jpg"
                                                  onChange={e =>
                                                    handleFileChange(
                                                      e.target.files[0],
                                                      episodeId,
                                                      ASSET_EPISODE_THUMBNAIL,
                                                      WASABI_ASSET
                                                    )
                                                  }
                                                  className={css.fileInput}
                                                  id={`thumbnail-${episodeId}`}
                                                />
                                              </label>
                                            )}
                                          </Field>
                                        </DragAndDrop>
                                      )}
                                      {hasError(episodeId, ASSET_EPISODE_THUMBNAIL) ? (
                                        <p className={css.error}>
                                          <FormattedMessage id="EditListingEpisodesForm.uploadThumbnailError" />
                                        </p>
                                      ) : null}
                                    </div>
                                  </div>
                                  <div className={css.episodeActionsModal}>
                                    <Button
                                      type="button"
                                      onClick={() => {
                                        handleUpdateListing(fields.value[index], values, formApi, true);
                                      }}
                                      disabled={isInvalid}
                                      inProgress={addEpisodeInProgress[episodeId]}
                                      className={css.saveAddEpisode}
                                    >
                                      <FormattedMessage id="EditListingEpisodesForm.saveAddEpisode" />
                                    </Button>
                                    <SecondaryButton
                                      type="button"
                                      inProgress={deleteEpisodeInProgress?.[episodeId]}
                                      className={css.deleteEpisode}
                                      onClick={() => {
                                        // const userConfirmed = confirm('do you really want it?');
                                        const finishedEpisodes = episodes.filter(episode => episode.added === true);
                                        if(finishedEpisodes.length <= 3 && isPublished) {
                                          return Swal.fire({
                                            icon: 'error',
                                            title: 'Oops...',
                                            text: 'Minimum three episodes are required for a published listing.',
                                            customClass: {
                                              confirmButton: `${css.confirmButton}`,
                                            }
                                          })
                                        };
                                        Swal.fire({
                                          title: 'Are you sure?',
                                          text: "You won't be able to revert this!",
                                          icon: 'warning',
                                          showCancelButton: true,
                                          confirmButtonText: 'Yes, delete it!',
                                          customClass: {
                                            confirmButton: `${css.deleteConfirmButton}`,
                                            cancelButton: `${css.deleteCancelButton}`,
                                          }
                                        }).then(result => {
                                          if (result.isConfirmed) {
                                            onDeleteEpisode({
                                              listingId: listing.id.uuid,
                                              episodeId,
                                              videoAssetId:
                                                fields.value[index]?.[ASSET_EPISODE_VIDEO]?.asset_id,
                                              thumbnailAssetId:
                                                fields.value[index]?.[ASSET_EPISODE_THUMBNAIL]?.key,
                                            })
                                            
                                            closeModal();
                                          }
                                        });
                                      }}
                                    >
                                      <FormattedMessage id="EditListingEpisodesForm.deleteEpisode" />
                                    </SecondaryButton>
                                  </div>
                                  {hasAddOrDeleteEpisodeError(episodeId) ? (
                                    <p>
                                      <FormattedMessage id="EditListingEpisodesForm.addOrDeleteEpisodeError" />
                                    </p>
                                  ) : null}
                                </div>
                              </div>
                            ) : null}
                          </Modal>
                        </div>
                      );
                    })}
                  </div>

                  {/* Add new episode button */}
                  {/* <button
                                        type="button"
                                        onClick={() => fields.push({ sequenceNumber: '', title: '', description: '', videoFile: null, thumbnailFile: null })}
                                    >
                                        Add Another Episode
                                    </button> */}
                </>
              )}
            </FieldArray>
            <div className={css.buttonsGroup}>
              <Button
                type="submit"
                className={css.submitButton}
                disabled={disableForm}
                inProgress={updateInProgress}
              >
                {submitButtonText}
              </Button>
              {!isPublished ? (
                <Button
                  type="button"
                  inProgress={saveDraftInProgress}
                  className={css.saveDraftButton}
                  onClick={onSaveDraft}
                >
                  <FormattedMessage id="EditListingEpisodePanel.draftButton" />
                </Button>
              ) : null}
            </div>
          </form>
        );
      }}
    />
  );
};

export default compose(injectIntl)(EditListingEpisodesForm);
