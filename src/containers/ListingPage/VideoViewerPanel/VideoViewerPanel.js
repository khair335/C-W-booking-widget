import React, { Component } from 'react';
import classNames from 'classnames';
import { FormattedMessage, injectIntl } from '../../../util/reactIntl';
import { Button, Modal, ResponsiveImage } from '../../../components';
import Slider from "react-slick";
// These are internal components that make this file more readable.
// import ActionButtonsMaybe from './ActionButtonsMaybe';
import css from './VideoViewerPanel.module.css';
import IconCollection from '../../../components/IconCollection/IconCollection';
import { formatCardDuration } from '../../../util/dataExtractor';
import VideoPlayer from '../../VideoViewerPage/VideoPlayer';

export class VideoViewerPanelComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      episNumber: 0,
      episodeModal: false,
      commentModal: false,
      purchaseModal: false,
    };
  }

  componentDidMount() {
    this.props.onUserWatchingPaidContent({ listing: this.props?.transaction?.listing });
  }

  render() {
    const {
      rootClassName,
      className,
      currentListing,
      onManageDisableScrolling,
      setShowFreeVideo,
      handleWishList,
      currentUser,
      intl,
      handleOrderSubmit
    } = this.props;

    const { episodes = [], listingType } = (currentListing && currentListing.id && currentListing.attributes.publicData) || {};
    const listingId = currentListing?.id?.uuid || null;
    const classes = classNames(rootClassName || css.root, className);

    const { wishlistData = {} } = currentUser?.attributes.profile.publicData || {};

    const addToWishListButtonText =
      Object.keys(wishlistData).length > 0 && wishlistData[listingType]?.includes(listingId)
      ? intl.formatMessage({ id: 'ListingDetails.addedToWishListButtonText' })
        : intl.formatMessage({ id: "VideoViewerPanel.addSeries" });

    const purchaseModalInfo = (
      <Modal
        id="VideoViewerPanel.infoModal"
        isOpen={this.state.purchaseModal}
        onClose={() => {
          this.setState({ purchaseModal: false })
          setShowFreeVideo(false)
        }}
        usePortal
        contentClassName={css.modalContent}
        onManageDisableScrolling={onManageDisableScrolling}
        className={css.purchaseModal}
      >
        <div >
          <h3 className={css.reportIssueHeading}>
            <FormattedMessage id="VideoViewerPanel.heading" />
          </h3>

          <div className={css.buttonGroups}>
            <Button className={css.requestRefundButton} onClick={() => handleOrderSubmit({})}>
              <FormattedMessage id="VideoViewerPanel.purchasedText" />
            </Button>

            <Button className={css.requestRefundButton1} onClick={() => {
              handleWishList();
            }} disabled={Object.keys(wishlistData).length > 0 && wishlistData[listingType]?.includes(listingId) ? true : false}>
              <span > {addToWishListButtonText}</span>
            </Button>
          </div>

        </div>

      </Modal>
    );

    const EpisodesList = ({ episodes, ismodal }) => {

      // Render early if no episodes are available
      if (!episodes || episodes.length === 0) {
        return <p>No episodes available</p>;
      }

      return (
        <div className={css.episodesList}>
          <h4 className={css.sectionHeadingWithExtraMargin}>Episodes ({episodes.length})</h4>
          <div className={css.sliderContainer}>
            {episodes.map((epis, id) => (
              <div key={epis.id} className={classNames(css.episodeCard, { [css.activeEpisode]: this.state.episNumber === id })} onClick={() => {
                if (id != 0) {
                  this.setState({ purchaseModal: true })
                }
              }} >
                <ResponsiveImage
                  className={css.episodeThumbnail}
                  url={epis?.thumbnailFile?.url}
                  alt={epis.title}
                />
                <div className={css.episodeDetails}>
                  <p className={css.episodeDuration}>Episode #{epis.sequenceNumber} &nbsp;|&nbsp; {formatCardDuration(epis?.videoFile?.duration)} MINUTES</p>

                  <h3 className={css.episodeTitle}>{epis.title}</h3>
                  <p className={css.episodeDescription}>{epis.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    };

    return (
      <div className={classes}>
        <div className={css.container}>

          <div>
            <div className={css.videoPlayerContainer}>
              <span onClick={() => setShowFreeVideo(false)} className={css.closeVideoPlayer}>
                <IconCollection icon="icon-close-modal" />
              </span>
              <VideoPlayer
                episode={episodes[this.state.episNumber]}
                openEpisodeModal={() => {
                  if (this.state.commentModal) {
                    this.setState({ commentModal: false });
                  }
                  this.setState({ episodeModal: !this.state.episodeModal });
                }}
                isOpen={this.state.episodeModal}
                openCommentModal={() => {
                  if (this.state.episodeModal) {
                    this.setState({ episodeModal: false });
                  }
                  this.setState({ commentModal: !this.state.commentModal });
                }}
                isCommentOpen={this.state.commentModal}
                currentListing={currentListing}
              />
              {episodes && episodes.length > 0 ?
                <div className={css.sliderContent}>
                  <div>
                    {EpisodesList({ episodes })}
                  </div>
                </div>
                : null}
              {this.state.episodeModal ? <div className={css.episodeModal}>
                <span className={css.closeEpisodeModal} onClick={() => this.setState({ episodeModal: false })}>
                  <IconCollection icon="icon-close-modal" />
                </span>
                <div className={css.episodeModalContent}>
                  <div>
                    {EpisodesList({ episodes, ismodal: true })}
                  </div>
                </div>
              </div> : null}
              {this.state.commentModal ? <div className={css.episodeModal}>
                <span className={css.closeEpisodeModal} onClick={() => this.setState({ commentModal: false })}>
                  <IconCollection icon="icon-close-modal" />
                </span>
              </div> : null}
              {purchaseModalInfo}
            </div>
          </div>

        </div>
      </div>
    );
  }
}

const VideoViewerPanel = injectIntl(VideoViewerPanelComponent);

export default VideoViewerPanel;
