import React, { useState, useEffect, useRef } from 'react';
import classNames from 'classnames';
import { injectIntl } from '../../../util/reactIntl';
import { FILM_PRODUCTS } from '../../../util/types';
import { ResponsiveImage } from '../../../components';
import Slider from "react-slick";
import css from './VideoViewerPanel.module.css';
import VideoPlayer from '../VideoPlayer';
import IconCollection from '../../../components/IconCollection/IconCollection';
import { formatCardDuration } from '../../../util/dataExtractor';
import { truncateEpisodeDescription } from '../../../util/data';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Mousewheel, Keyboard } from 'swiper/modules';

const EpisodesList = ({ episodes, isModal, activeEpisode, setActiveEpisode, closeModal }) => {
  if (!episodes || episodes.length === 0) {
    return <p>No episodes available</p>;
  }

  const firstSliderRef = useRef();

  const sliderRefs = [firstSliderRef]; // Add more refs as needed

  // Create separate parent refs for each slider
  const firstParentRef = useRef(null);
  const parentRefs = [firstParentRef];

  useEffect(() => {
    // Set up scroll handlers for each parent container
    parentRefs.forEach((parentRef, index) => {
      if (!parentRef.current) return;

      const handleScroll = e => {
        // Only handle horizontal scrolling gestures
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
          e.preventDefault(); // Prevent default scroll behavior

          // Get the element that triggered the event
          const target = e.target;

          // Get corresponding slider ref for this parent
          const sliderRef = sliderRefs[index];

          if (sliderRef?.current && sliderRef.current.innerSlider.list.contains(target)) {
            if (e.deltaX > 0) {
              sliderRef.current?.slickNext();
            } else if (e.deltaX < 0) {
              sliderRef.current?.slickPrev();
            }
          }
        }
      };

      const element = parentRef.current;
      element.addEventListener("wheel", handleScroll, { passive: false });

      return () => {
        element.removeEventListener("wheel", handleScroll);
      };
    });
  }, [episodes]);

  const settings = {
    className: "slider variable-width",
    dots: false,
    infinite: false,
    centerMode: false,
    slidesToShow: 1,
    slidesToScroll: 1,
    variableWidth: true,
    arrows: false,
    cssEase: "linear",
  };

  const episodeItem = (epis, id) => (
    <div
      key={epis.id}
      className={classNames(css.episodeCard, { [css.activeEpisode]: activeEpisode === id })}
      onClick={() => {
        setActiveEpisode(id);
        if (isModal && closeModal) closeModal();
      }}
      style={isModal ? {} : { width: '459px' }}
    >
      <ResponsiveImage
        className={css.episodeThumbnail}
        url={epis?.thumbnailFile?.url}
        alt={epis.title}
      />
      <div className={css.episodeDetails}>
        <p>
          <span className={css.episodeDuration}>
            Episode #{epis.sequenceNumber} &nbsp;|&nbsp;
          </span>
          <span>{formatCardDuration(epis?.videoFile?.duration)}</span>
        </p>
        <h3 className={css.episodeTitle}>{epis.title}</h3>
        <p className={css.episodeDescription}>{truncateEpisodeDescription(epis.description)}</p>
      </div>
    </div>
  );

  return (
    <div className={css.episodesList}>
      <h4 className={css.sectionHeadingWithExtraMargin}>Episodes ({episodes.length})</h4>
      <div className={css.sliderContainer} ref={firstParentRef}>
        {!isModal ? (
          <Swiper
            cssMode={true}
            navigation={true}
            pagination={true}
            mousewheel={true}
            keyboard={true}
            dots={false}
            slidesPerView={'auto'}
            modules={[Navigation, Mousewheel, Keyboard]}
            className="mySwiper"
          >
            {episodes.map((epis, id) =>
              <SwiperSlide key={epis.id}>
                {episodeItem(epis, id)}
              </SwiperSlide>
            )}
          </Swiper>
        ) : (
          episodes.map((epis, id) => episodeItem(epis, id))
        )}
      </div>
    </div>
  );
};

const VideoViewerPanelComponent = (props) => {
  const {
    rootClassName,
    className,
    transactionCollection,
    transaction,
    onUpdateMetadata = () => { },
    onReviewNotificationToUser,
    onUpdateTheWatchlist
  } = props;

  const [episNumber, setEpisNumber] = useState(0);
  const [episodeModal, setEpisodeModal] = useState(false);
  const [commentModal, setCommentModal] = useState(false);

  const { listingType, episodes = [] } =
    (transactionCollection && transactionCollection.listingData) ||
    (transaction?.id && transaction?.listing?.attributes?.publicData) ||
    {};

  useEffect(() => {
    props.onUserWatchingPaidContent({
      listing: props?.transaction?.listing,
    });
  }, [props.transaction]);

  const classes = classNames(rootClassName || css.root, className);

  return (
    <div className={classes}>
      <div className={css.container}>
        {listingType === FILM_PRODUCTS ? (
          <div className={css.videoPlayerContainer}>
            <VideoPlayer
              transactionCollection={transactionCollection}
              openCommentModal={() => {
                if (episodeModal) setEpisodeModal(false);
                setCommentModal(!commentModal);
              }}
              isCommentOpen={commentModal}
              transaction={transaction}
              onUpdateMetadata={onUpdateMetadata}
              onReviewNotificationToUser={onReviewNotificationToUser}
              onUpdateTheWatchlist={onUpdateTheWatchlist}
            />
          </div>
        ) : (
          <div>
            <div className={css.videoPlayerContainer}>
              <VideoPlayer
                transactionCollection={transactionCollection}
                episode={episodes[episNumber]}
                openEpisodeModal={() => {
                  if (commentModal) setCommentModal(false);
                  setEpisodeModal(!episodeModal);
                }}
                isOpen={episodeModal}
                openCommentModal={() => {
                  if (episodeModal) setEpisodeModal(false);
                  setCommentModal(!commentModal);
                }}
                isCommentOpen={commentModal}
                transaction={transaction}
                onUpdateMetadata={onUpdateMetadata}
                onReviewNotificationToUser={onReviewNotificationToUser}
                episodeNumber={episNumber}
                onUpdateTheWatchlist={onUpdateTheWatchlist}
              />
              {episodes.length > 0 && (
                <div className={css.sliderContent}>
                  <EpisodesList
                    episodes={episodes}
                    activeEpisode={episNumber}
                    setActiveEpisode={setEpisNumber}
                  />
                </div>
              )}
              {episodeModal && (
                <div className={css.episodeModal}>
                  <span
                    className={css.closeEpisodeModal}
                    onClick={() => setEpisodeModal(false)}
                  >
                    <IconCollection icon="icon-close-modal" />
                  </span>
                  <div className={css.episodeModalContent}>
                    <EpisodesList
                      episodes={episodes}
                      isModal={true}
                      activeEpisode={episNumber}
                      setActiveEpisode={setEpisNumber}
                      closeModal={() => setEpisodeModal(false)}
                    />
                  </div>
                </div>
              )}
              {commentModal && (
                <div className={css.episodeModal}>
                  <span
                    className={css.closeEpisodeModal}
                    onClick={() => setCommentModal(false)}
                  >
                    <IconCollection icon="icon-close-modal" />
                  </span>
                  {/* Add CommentThread here if needed */}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const VideoViewerPanel = injectIntl(VideoViewerPanelComponent);

export default VideoViewerPanel;
