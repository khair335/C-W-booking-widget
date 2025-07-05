import React, { useState } from "react";
import { H3, ListingLink } from "../../../../components";
import { LISTING_STATE_DRAFT } from "../../../../util/types";
import { FormattedMessage } from '../../../../util/reactIntl';
import EditListingMarketingForm from "./EditListingMarketingForm";
import classNames from "classnames";
import css from './EditListingMarketingPanel.module.css';
import { ASSET_MARKETING__BANNER, ASSET_MARKETING_POSTER, ASSET_MARKETING_TRAILER, CODE_PROCESSING_FILM, CODE_PROCESSING_SERIES, STATUS_PENDING_APPROVAL } from "../../../../constants";

const getInitialMarketingAssets = (localMarketingAssets = {}, listing, removeImageKeys, deletedAssetIds) => {
    const { publicData = {} } = listing?.attributes || {};
    const posterAsset = publicData[ASSET_MARKETING_POSTER];
    const bannerAsset = publicData[ASSET_MARKETING__BANNER];
    const trailerAsset = publicData[ASSET_MARKETING_TRAILER];
    const { freeEpisode } = publicData;

    const freeEpisodeMaybe = freeEpisode === true
        ? { freeEpisode: ["true"] }
        : {};


    const localPosterAsset = localMarketingAssets[ASSET_MARKETING_POSTER];
    const localBannerAsset = localMarketingAssets[ASSET_MARKETING__BANNER];
    const localTrailerAsset = localMarketingAssets[ASSET_MARKETING_TRAILER];


    const poster = localPosterAsset || posterAsset;
    const banner = localBannerAsset || bannerAsset;
    const trailer = localTrailerAsset || trailerAsset;
    return {
        marketingPoster: removeImageKeys.includes(poster?.key) ? undefined : poster,
        marketingBanner: removeImageKeys.includes(banner?.key) ? undefined : banner,
        marketingTrailer: deletedAssetIds.includes(trailer?.asset_id) ? undefined : trailer,
        ...freeEpisodeMaybe
    };

    // return {
    //     marketingPoster: posterAsset,
    //     marketingBanner: bannerAsset,
    //     marketingTrailer: trailerAsset,
    //     freeEpisode
    // };
};

const canCreateNewVersion = (marketingAssets) => {
    const { marketingPoster, marketingBanner, marketingTrailer } = marketingAssets;
    // Allow to create a new version if there is new assets and trailer is not in ready state.
    // A trailer with ready state has already updated the existing version entry in mongodb.
    return (!!marketingPoster?.key || !!marketingBanner?.key || !!marketingTrailer?.asset_id || marketingTrailer?.inProgress) && (!marketingTrailer || marketingTrailer?.status !== STATUS_PENDING_APPROVAL);
};

const EditListingMarketingPanel = (props) => {

    const {
        className,
        rootClassName,
        params,
        submitButtonText,
        marketingAssets,
        listing,
        onCreateMarketingAssets,
        onDeleteMarketingAsset,
        deleteMarketingAssetsInProgress,
        deleteMarketingAssetsError,
        updateInProgress,
        onSubmit,
        onSaveDraft,
        config,
        intl,
        history,
        removedImageKeys,
        deletedAssetIds,
        listingAssetsStatus
    } = props;

    const [saveDraftInProgress, setSaveDraftInProgress] = useState(false);

    const classes = classNames(rootClassName || css.root, className);
    const { publicData, state } = listing?.attributes || {};
    const listingTypes = config.listing.listingTypes;
    const isPublished = listing?.id && state !== LISTING_STATE_DRAFT;

    const allowCreateNewVersion = canCreateNewVersion(marketingAssets)
        && ![CODE_PROCESSING_FILM, CODE_PROCESSING_SERIES].includes(listingAssetsStatus?.code);

    return (
        <div className={classes}>
            <H3 as="h1" className={css.heading}>
                {isPublished ? (
                    <FormattedMessage
                        id="EditListingMarketingPanel.title"
                        values={{ listingTitle: <ListingLink listing={listing} />, lineBreak: <br /> }}
                    />
                ) : (
                    <FormattedMessage
                        id="EditListingMarketingPanel.createListingTitle"
                        values={{ lineBreak: <br /> }}
                    />
                )}
            </H3>
            <p className={css.subHeading}><FormattedMessage id="EditListingMarketingPanel.subTitle" /></p>
            <EditListingMarketingForm
                params={params}
                submitButtonText={submitButtonText}
                marketingAssets={marketingAssets}
                listing={listing}
                onCreateMarketingAssets={onCreateMarketingAssets}
                onDeleteMarketingAsset={onDeleteMarketingAsset}
                deleteMarketingAssetsInProgress={deleteMarketingAssetsInProgress}
                deleteMarketingAssetsError={deleteMarketingAssetsError}
                updateInProgress={updateInProgress}
                onSubmit={onSubmit}
                initialValues={getInitialMarketingAssets(marketingAssets, listing, removedImageKeys, deletedAssetIds)}
                saveDraftInProgress={saveDraftInProgress}
                isPublished={isPublished}
                onSaveDraft={(values) => {
                    setSaveDraftInProgress(true)
                    onSaveDraft(values).then(res => {
                        setSaveDraftInProgress(false);
                        history.push('/listings');
                    })
                }}
                intl={intl}
                allowCreateNewVersion={allowCreateNewVersion}
            />
        </div>
    )
};

export default EditListingMarketingPanel;