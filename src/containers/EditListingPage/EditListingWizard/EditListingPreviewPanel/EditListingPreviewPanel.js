import React, { useRef, useState } from "react";
import { Button, ButtonTabNavHorizontal, H5, Heading, Modal, ResponsiveImage, VideoPlayer } from "../../../../components";
import { CAST_CREW, FILM_PRODUCTS, FILM_TAB, propTypes } from "../../../../util/types";
import { LISTING_PAGE_DRAFT_VARIANT } from "../../../../util/urlHelpers";
import ListingDetails from "./ListingDetails";
import { formatCardDuration, formatLabel } from "../../../../util/dataExtractor";
import { FormattedMessage } from "react-intl";
import classNames from "classnames";
import screenfull from 'screenfull';
import { GUMLET_PROCESSING_STATUS, LISTING_TYPE_FILMS, LISTING_TYPE_SERIES, STATUS_APPROVED,  STATUS_PENDING_APPROVAL, STATUS_UPLOAD_READY } from "../../../../constants";
import { Tooltip } from 'react-tooltip';
import { truncate } from "lodash";

import SectionAuthorMaybe from "../../../ListingPage/SectionAuthorMaybe";
import { areMarketingAssetsReady, isFilmReady, isListingAssetsReady, isSeriesReady, truncateEpisodeDescription, userDisplayNameAsString } from "../../../../util/data";
import { createResourceLocatorString } from "../../../../util/routes";
import { DETAILS } from "../EditListingWizardTab";
import css from './EditListingPreviewPanel.module.css';


const gumletProcessingStatus = GUMLET_PROCESSING_STATUS;

const videoReady = [STATUS_APPROVED, STATUS_PENDING_APPROVAL, STATUS_UPLOAD_READY];

const Episode = ({ epis, id, freeEpisode, handlePlayButtonClick }) => {
    const [playing, setPlaying] = useState(false);
    return (
        <div key={`${epis.id}-${id}`} className={css.episodeCard}>
            {videoReady.includes(epis?.videoFile?.status)
                ? (<VideoPlayer
                    key={`${epis.id}-${id}`}
                    className={css.episodeThumbnail}
                    videoUrl={epis?.videoFile?.playback_url}
                    lightbox={true}
                    gumletImage={{
                        key: epis?.thumbnailFile?.key,
                        sourceUrl: process.env.REACT_APP_GUMLET_SOURCE_URL,
                        styles: { width: '100%', height: '100%' }

                    }}
                    subtitle={epis?.videoFile?.subtitle}
                    playing={playing}
                    setPlaying={setPlaying}
                />)
                : (<div className={css.videoPlaceHolder}>
                    <ResponsiveImage
                        className={css.episodeThumbnail}
                        url={epis?.thumbnailFile?.url}
                        alt={`episode ${id} thumbnail`}
                    />
                </div>)}

            <div className={css.episodeDetails}>
                <p > <span className={css.episodeDuration}>Episode #{epis.sequenceNumber} &nbsp;|&nbsp;  </span> <span>{formatCardDuration((epis?.videoFile?.duration))}</span></p>
                <h3 className={css.episodeTitle}>{epis.title}</h3>
                <p className={css.episodeDescription}>{truncateEpisodeDescription(epis.description)}</p>
            </div>
            {freeEpisode && id === 0 && (
                <Button className={css.playButton} onClick={handlePlayButtonClick}>
                    <FormattedMessage id="EditListingPreviewPanel.playButtonText" />
                </Button>
            )}
        </div>
    )
}

const EpisodesList = ({ episodes, freeEpisode, showCount, setShowCount, intl }) => {
    const playerRef = useRef(null);

    const handlePlayButtonClick = () => {
        if (screenfull.isEnabled && playerRef.current) {
            screenfull.request(playerRef.current.wrapper); // `wrapper` is the container of ReactPlayer
            // playerRef.current.getInternalPlayer().play();
        }
    };

    // Handle "load more" functionality
    const handleLoadMore = () => {
        setShowCount(prevCount => prevCount + 6);
    };

    // Render early if no episodes are available
    if (!episodes || episodes.length === 0) {
        return <p><FormattedMessage id="EditListingPreviewPanel.noEpisode" /></p>;
    }

    return (
        <div>
            <h4 className={css.sectionHeadingWithExtraMargin}>
                <FormattedMessage id="EditListingPreviewPanel.episodeSectionTitle" values={{ length: episodes.length }} />
            </h4>
            <div className={css.episodesGrid}>
                {episodes.slice(0, 6 + showCount).map((epis, id) => (
                    <Episode epis={epis} id={id} freeEpisode={freeEpisode} handlePlayButtonClick={handlePlayButtonClick} />
                ))}
            </div>
            {episodes.length > 6 + showCount && (
                <div onClick={handleLoadMore} style={{ cursor: 'pointer' }}>
                    <span>
                        <FormattedMessage
                            id="ListingPage.loadMore"
                            values={{ count: episodes.length - (6 + showCount) }}
                        />
                    </span>
                </div>
            )}
        </div>
    );
};

const ActionBar = ({ handlePublishListing, listing, intl, history, updateInProgress, setShowInfoModal, isReadyToPublish, disabledPublishButtonText, currentUser, routeConfiguration, params }) => {
    const reviewingMessage = intl.formatMessage({ id: "EditListingPreviewPanel.reviewingMessage" });
    const publishButtonText = intl.formatMessage({ id: "EditListingPreviewPanel.publishButtonText" });
    const editButtonText = intl.formatMessage({ id: "EditListingPreviewPanel.editListingButtonText" });
    const listingTile = listing?.attributes?.title || '';
    const profileNotCompletedText = intl.formatMessage({ id: "EditListingPreviewPanel.profileNotCompletedText" });

    const handleReturnToEdit = () => {
        history.push(createResourceLocatorString('EditListingPage', routeConfiguration, { ...params, tab: DETAILS }, {}));
    };

    const { userName } = (currentUser && currentUser.id && currentUser.attributes.profile.publicData) || {};

    const isProfileCompleted = userName && userName.length > 0;
    const submitButton = isProfileCompleted && listing.attributes.state == LISTING_PAGE_DRAFT_VARIANT ? (
        <>
            <Button
                data-tooltip-id="my-tooltip-1"
                disabled={!isReadyToPublish || !userName}
                type="button"
                inProgress={updateInProgress}
                className={css.primaryButton}
                onClick={() => {
                    if (isReadyToPublish) {
                        handlePublishListing(listing?.id);
                    } else {
                        setShowInfoModal(true);
                    }
                }}
            >
                <span> {publishButtonText}</span>
            </Button>
            {!isReadyToPublish ? (
                <Tooltip id="my-tooltip-1" place="bottom" content={disabledPublishButtonText} />
            ) : !userName ? (
                <Tooltip id="my-tooltip-1" place="bottom" content={profileNotCompletedText} />
            ) : null}
        </>
    ) : listing.attributes.state == LISTING_PAGE_DRAFT_VARIANT ? (<Button
        type="button"
        className={css.primaryButton}
        onClick={() => history.push(`/profile-settings?redirectUrl=${history.location.pathname}`)}
    >
        <FormattedMessage id="EditListingPreviewPanel.profileNotCompletedText" />
    </Button>) : null;

    return (
        <div className={css.actionBarContainer}>
            <div className={css.content}>
                <p className={css.message}>{reviewingMessage}</p>
                <H5 className={css.listingTitle}>{formatLabel(listingTile)}</H5>
            </div>
            <div className={css.actionButtons}>
                <Button type="button" className={css.secondaryButton} onClick={handleReturnToEdit}>
                    <span>{editButtonText}</span>
                </Button>


                {/* Tooltip will appear when the button is disabled */}
                {submitButton}
            </div>
        </div>
    );
};


ActionBar.propTypes = {
    listing: propTypes.listing.isRequired,
};


const getDisabledPublishButtonText = (params) => {
    const {
        listingType,
        uploadQueue,
        marketingAssets,
        marketingBanner,
        marketingPoster,
        marketingTrailer,
        filmGumletAsset,
        filmVideo,
        episodes,
        episodeAssets,
        listingId,
        intl,

    } = params;

    const isUploadPending = uploadQueue.some(task => task.listingId === listingId);
    if (isUploadPending) {
        return intl.formatMessage({ id: 'EditListingPreviewPanel.isUploadPending' });
    };

    // Now check marketing assets
    if (!areMarketingAssetsReady(marketingAssets, { marketingPoster, marketingBanner, marketingTrailer }, gumletProcessingStatus)) {
        return intl.formatMessage({ id: 'EditListingPreviewPanel.marketingAssetsNotReady' });
    };

    // Now check based on listing type
    if (listingType === LISTING_TYPE_FILMS) {
        if (!isFilmReady(filmGumletAsset, filmVideo, gumletProcessingStatus)) {
            return intl.formatMessage({ id: 'EditListingPreviewPanel.filmAssetNotReady' });
        }
    }

    if (listingType === LISTING_TYPE_SERIES) {
        if (!isSeriesReady(episodes, episodeAssets)) {
            return intl.formatMessage({ id: 'EditListingPreviewPanel.seriesAssetNotReady' });
        }
    };
};

export const EditListingPreviewPanel = (props) => {
    const [showTabType, setShowTabType] = useState(FILM_TAB);
    const [showCount, setShowCount] = useState(0);
    const [showInfoModal, setShowInfoModal] = useState(false);

    const {
        params,
        listing,
        handlePublishListing,
        routeConfiguration,
        history,
        intl,
        updateInProgress,
        currentUser,
        onManageDisableScrolling,
        uploadQueue,
        episodeAssets,
        filmGumletAssetInProgress,
        filmGumletAsset,
        marketingAssets
    } = props;

    const isFilmTabSelected = showTabType === FILM_TAB;
    const isCastCrewTabSelected = showTabType === CAST_CREW;
    const { castAndCrews = [], episodes = [], freeEpisode,
        listingType, filmVideo, marketingBanner, marketingPoster,
        marketingTrailer } = listing?.attributes?.publicData || {};

    // Check if the listing is ready to be published
    const isReadyToPublish = isListingAssetsReady({
        listing,
        uploadQueue, // video upload queue
        marketingAssets, // Marketing assets from redux
        filmGumletAsset: filmGumletAsset, // film asset from redux
        episodeAssets: episodeAssets, // episode assets from redux
        gumletProcessingStatus
    })?.isReady;

    const disabledPublishButtonText = getDisabledPublishButtonText({
        listingType,
        uploadQueue,
        marketingAssets, // Marketing assets from redux
        marketingBanner, // Marketing assets from listing
        marketingPoster, // Marketing assets from listing
        marketingTrailer, // Marketing assets from listing
        filmGumletAsset,
        filmVideo,
        episodes,
        episodeAssets: episodeAssets,
        listingId: listing?.id?.uuid,
        intl,
    });

    const desktopTabs = [
        {
            text: (
                <Heading as="h3" rootClassName={css.desktopReviewsTitle}>
                    <FormattedMessage
                        id={listingType == FILM_PRODUCTS ? "ListingPage.filmTabTitle" : "ListingPage.seriesTabTitle"}
                    />
                </Heading>
            ),
            selected: isFilmTabSelected,
            onClick: () => setShowTabType(FILM_TAB),
        },
        {
            text: (
                <Heading as="h3" rootClassName={css.desktopReviewsTitle}>
                    <FormattedMessage
                        id="ListingPage.castCewTabTitle"
                    />
                </Heading>
            ),
            selected: isCastCrewTabSelected,
            onClick: () => setShowTabType(CAST_CREW),
        },
    ];

    // Group the castAndCrews by mainRole
    const groupedByMainRole = castAndCrews && castAndCrews.length && castAndCrews.reduce((acc, cast) => {
        const mainRole = formatLabel(cast.roles.mainRole);
        if (!acc[mainRole]) {
            acc[mainRole] = [];
        }
        acc[mainRole].push({
            subRole: formatLabel(cast.roles.subRole),
            name: cast.name,
        });
        return acc;
    }, {});

    const infoModal = (
        <Modal
            id="EditlistingPreviewPanel"
            isOpen={showInfoModal}
            onClose={() => {
                setShowInfoModal(false);
            }}
            usePortal
            contentClassName={css.modalContent}
            onManageDisableScrolling={onManageDisableScrolling}
        >
            <div>
                <span>
                    <FormattedMessage id="EditListingPreviewPanel.info" />
                </span>
            </div>

        </Modal>
    );

    return (<div className={css.previewContainer}>
        <ListingDetails
            listing={listing}
            intl={intl}
            onManageDisableScrolling={onManageDisableScrolling}
        />
        <div className={css.desktopReviewsTabNav}>
            <ButtonTabNavHorizontal tabs={desktopTabs} isListingPage={true} />
        </div>

        <div className={css.listingDetails}>
            {isFilmTabSelected ? <div className={css.authorSection}>
                <SectionAuthorMaybe
                    title={listing?.attributes?.title}
                    listing={listing}
                    authorDisplayName={userDisplayNameAsString(listing?.author, '')}
                    onContactUser={() => { }}
                    isInquiryModalOpen={false}
                    onCloseInquiryModal={() => { }}
                    sendInquiryError={null}
                    sendInquiryInProgress={false}
                    onSubmitInquiry={() => { }}
                    currentUser={currentUser}
                    onManageDisableScrolling={() => { }}
                    isReviewPanel={true}
                />

                {castAndCrews.length > 0 ?
                    <div className={css.castSection}>
                        <div className={css.castItem}>
                            <span className={css.castCrewTitle}>
                                <FormattedMessage id="ListingPage.castCrew" />
                            </span>

                            <span className={css.viewAllBtn} onClick={() => setShowTabType(CAST_CREW)}>
                                <FormattedMessage id="ListingPage.viewAll" />
                            </span>
                        </div>
                        <div className={css.castItemsWrapper}>
                            {castAndCrews.map((cast) => {
                                return (
                                    <div className={css.castItem}>
                                        <span>{formatLabel(cast.roles.subRole)}</span>   <span>{cast.name}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div> : null}

            </div> : null}
            {isCastCrewTabSelected ?
                <div className={css.castSection2}>
                    <div>
                        {Object.entries(groupedByMainRole).map(([mainRole, subRoles]) => {
                            return (
                                <div key={mainRole} className={css.castSectionItem}>
                                    <h4 className={css.sectionHeadingWithExtraMargin}>{mainRole.split(' ')[0]}</h4>
                                    <div className={classNames(css.castItemsWrapper, css.castItemsWrapper2)}>

                                        {subRoles.map((cast, index) => (
                                            <div key={index} className={css.castItem}>
                                                <span>{cast.subRole}</span> <span>{cast.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div> : null}

            {episodes && episodes.length > 0 && isFilmTabSelected ?
                <div className={css.sliderContent}>
                    <div>
                        <EpisodesList
                            episodes={episodes}
                            freeEpisode={freeEpisode}
                            showCount={showCount}
                            setShowCount={setShowCount}
                            intl={intl}
                        />
                    </div>
                </div>
                : null}

        </div>
        <ActionBar
            handlePublishListing={handlePublishListing}
            routeConfiguration={routeConfiguration}
            listing={listing}
            listingType={params.listingType}
            history={history}
            intl={intl}
            updateInProgress={updateInProgress}
            setShowInfoModal={setShowInfoModal}
            isReadyToPublish={isReadyToPublish}
            disabledPublishButtonText={disabledPublishButtonText}
            currentUser={currentUser}
            params={params}
        />
        {infoModal}
    </div>)
}

EditListingPreviewPanel.prototype = {
    listing: propTypes.listing.isRequired
}