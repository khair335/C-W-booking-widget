import React, { useState } from 'react';
import EditListingEpisodesForm from './EditListingEpisodesForm';
import { FormattedMessage } from '../../../../util/reactIntl';
import { v4 as uuidv4 } from 'uuid';
import css from './EditListingEpisodesPanel.module.css';
import classNames from 'classnames';
import { LISTING_STATE_DRAFT } from '../../../../util/types';
import { mergeEpisodesWithAssets } from '../../../../util/data';
import { CODE_PROCESSING_MARKETING, LISTING_STATE_PUBLISHED } from '../../../../constants';

const getInitialValues = ({ listing, listingEpisodeAssets, fieldTextInputValues, deletedEpisodeIds, deletedAssetIds }) => {
    const { publicData = {} } = listing?.attributes || {};
    const { episodes = [] } = publicData;

    // Merge episodes with assets and handle deleted episodes
    const mergedEpisodes = mergeEpisodesWithAssets({
        episodes,
        listingEpisodeAssets,
        fieldTextInputValues,
        deletedEpisodeIds,
        deletedAssetIds
    });

    console.log('merged episodes ==>>', { mergedEpisodes });

    // Start with the merged episodes
    let initialEpisodes = [...mergedEpisodes];

    // Ensure we have at least 3 episodes (add placeholders if needed)
    while (initialEpisodes.length < 3) {
        initialEpisodes.push({ episodeId: uuidv4(), added: false });
    }

    // If all episodes are marked as added, add one more empty episode
    const allEpisodesAdded = initialEpisodes.every(epi => epi.added);
    if (allEpisodesAdded) {
        initialEpisodes.push({ episodeId: uuidv4(), added: false });
    }

    return {
        episodes: initialEpisodes
    };
};


const EditListingEpisodesPanel = (props) => {
    const {
        listing,
        onCreateEpisodeAsset,
        episodeAssets,
        episodeAssetsInProgress,
        episodeAssetsError,
        errors,
        onUpdateListing,
        updateInProgress,
        submitButtonText,
        onAddEpisode,
        addEpisodeInProgress,
        addEpisodeError,
        onDeleteEpisode,
        deleteEpisodeInProgress,
        deleteEpisodeError,
        onSubmit,
        rootClassName,
        className,
        uploadQueue,
        deletedEpisodeIds,
        onDeleteEpisodeAsset,
        deletedAssetIds,
        listingAssetsStatus
    } = props;
    const [fieldTextInputValues, setFieldTextInputValues] = useState([]);
    const listingEpisodeAssets = episodeAssets;
    const listingDeleteEpisodeInProgress = deleteEpisodeInProgress;
    const listingDeleteEpisodeError = deleteEpisodeError;

    const initialValues = getInitialValues({
        listing, listingEpisodeAssets, fieldTextInputValues, deletedEpisodeIds, deletedAssetIds
    });
    const [saveDraftInProgress, setSaveDraftInProgress] = useState(false);
    const classes = classNames(rootClassName || css.root, className, css.panel);
    const isFirstEpisodeFree = !!listing?.attributes?.publicData?.freeEpisode;
    const { state, publicData } = listing?.attributes || {};
    const { markAsDraft, deletedListing } = publicData;
    const isPublished = listing?.id && state !== LISTING_STATE_DRAFT;

    const canCreateNew = ![CODE_PROCESSING_MARKETING].includes(listingAssetsStatus?.code) && (state === LISTING_STATE_PUBLISHED) && !deletedListing && !markAsDraft;

    return (
        <div className={classes}>
            <h1 className={css.heading}><FormattedMessage id='EditListingEpisodesPanel.mainTitle' /></h1>
            <p className={css.subHeading}>
                <FormattedMessage id='EditListingEpisodesPanel.subTitle' />
            </p>
            <p className={css.reloadWarning}>
                <FormattedMessage id='EditListingEpisodesPanel.reloadWarning' />
            </p>
            <EditListingEpisodesForm
                listing={listing}
                onCreateEpisodeAsset={onCreateEpisodeAsset}
                episodeAssetsInProgress={episodeAssetsInProgress}
                episodeAssetsError={episodeAssetsError}
                initialValues={initialValues}
                onUpdateListing={onUpdateListing}
                updateInProgress={updateInProgress}
                submitButtonText={submitButtonText}
                onAddEpisode={onAddEpisode}
                addEpisodeInProgress={addEpisodeInProgress}
                addEpisodeError={addEpisodeError}
                onDeleteEpisode={onDeleteEpisode}
                deleteEpisodeInProgress={listingDeleteEpisodeInProgress}
                deleteEpisodeError={listingDeleteEpisodeError}
                isFirstEpisodeFree={isFirstEpisodeFree}
                isPublished={isPublished}
                onSubmit={onSubmit}
                onSaveDraft={() => {
                    setSaveDraftInProgress(true)
                    setTimeout(() => {
                        setSaveDraftInProgress(false)
                    }, 500)
                }}
                saveDraftInProgress={saveDraftInProgress}
                onDeleteEpisodeAsset={onDeleteEpisodeAsset}
                uploadQueue={uploadQueue}
                setInitialState={setFieldTextInputValues}
                deletedEpisodeIds={deletedEpisodeIds}
                canCreateNew={canCreateNew}
                
            />
        </div>
    );
};

export default EditListingEpisodesPanel;
