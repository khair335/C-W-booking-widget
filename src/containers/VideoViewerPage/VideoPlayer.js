import React, { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import styles from './VideoViewerPage.module.css';
import IconCollection from '../../components/IconCollection/IconCollection';
import classNames from 'classnames';
import { formatCardDuration, formatLabel } from '../../util/dataExtractor';
import { FormattedMessage } from 'react-intl';
import { ResponsiveImage } from '../../components';
import css from './VideoViewerPage.module.css'

const formatTime = (time) => {
  // Handle invalid or null/undefined input
  if (time === null || time === undefined || isNaN(time) || time < 0) {
    return '00:00:00'; // Default to "00:00:00" for invalid time
  }

  // Convert time to a whole number if needed
  const totalSeconds = Math.floor(time);

  // Calculate hours, minutes, and seconds
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // Format the output to always have two digits
  const formattedHours = hours > 0 ? `${hours}:` : ''; // Include hours only if > 0
  const formattedMinutes = `${minutes < 10 && hours > 0 ? '0' : ''}${minutes}`; // Add leading zero if hours are present
  const formattedSeconds = `${seconds < 10 ? '0' : ''}${seconds}`;

  return `${formattedHours}${formattedMinutes}:${formattedSeconds}`;
};

const VideoPanel = props => {
  const {
    transactionCollection,
    episode = {},
    openEpisodeModal,
    isOpen,
    openCommentModal,
    isCommentOpen,
    transaction,
    currentListing,
    onUpdateMetadata,
    onReviewNotificationToUser,
    onUpdateTheWatchlist
  } = props;

  const { filmVideo, title, subtitle_selection = [], subtitle_ln_code = [] } =
    transactionCollection?.listingData ||
    (transaction?.id && transaction.listing?.attributes?.publicData) || currentListing?.attributes?.publicData ||
    {};

  const { contantWatched = false, completeWatched = false, ...rest } = (transaction && transaction.id && transaction.attributes.metadata) || {};
  const { displayName, publicData } = (transaction && transaction.id && transaction.customer.attributes.profile) || {}

  const { videoFile, thumbnailFile } = episode || {};
  const videoId = filmVideo?.asset_id || videoFile?.asset_id; // Unique ID for the video
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(true);
  const playerRef = useRef(null);
  const [volume, setVolume] = useState(1); // Add volume state (0 to 1)
  const [muted, setMuted] = useState(false); // Add muted state
  const [showVolumeSlider, setShowVolumeSlider] = useState(false); // Optional: for showing/hiding volume slider
  const [reviewOpen, setReviewOpen] = useState(false);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null); // Add this ref for the container
  const [played, setPlayed] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false); // Add this state
  const [showSubtitles, setShowSubTitles] = useState(false);
  const [hasSeeked, setHasSeeked] = useState(false); // Tracks if seeking is done
  const [subtitleIndex, setSubtitleIndex] = useState(-1);
  const [duration, setDuration] = useState(0);

  const completeTime = formatTime(duration);
  const remainingTime = formatTime(duration - played * duration);

  const handleEpisodeClick = () => {
    if (openEpisodeModal) {
      openEpisodeModal();
    }
  };

  const handlePlayPause = () => {
    setPlaying(prev => !prev);
    setStarted(false)
    if (!contantWatched) {
      const params = {
        metadata: {
          contantWatched: true,
          ...rest
        }
      }
      onUpdateMetadata({ txId: transaction?.id, params })
    }
  };
  // // Update handleProgress
  const handleProgress = state => {
    if (!seeking) {
      setPlayed(state.played);
      const eightyPercentDuration = (filmVideo ? filmVideo.duration : videoFile.duration) * 0.8;
      const watchTime = state.playedSeconds >= eightyPercentDuration;

      if (videoId) {
        localStorage.setItem(`video_${videoId}_position`, state.playedSeconds);
      }
      if (watchTime && !(completeWatched || reviewOpen)) {
        const params = {
          metadata: {
            completeWatched: true,
            ...rest
          }
        }
        onUpdateMetadata({ txId: transaction?.id, params }).then((res) => {
          if (res) {
            setReviewOpen(true)
            const data = {
              txId: transaction?.id.uuid,
              customerEmail: publicData?.email,
              customerName: displayName
            }
            onReviewNotificationToUser(data)
          }
        })
      }
    }
  };

  const handleSeekMouseDown = () => {
    setSeeking(true);
  };

  const handleSeekChange = e => {
    setPlayed(parseFloat(e.target.value));
  };

  const handleSeekMouseUp = e => {
    setSeeking(false);
    playerRef.current.seekTo(parseFloat(e.target.value));
  };

  const handleRewind = () => {
    playerRef.current.seekTo(playerRef.current.getCurrentTime() - 10);
  };

  const handleForward = () => {
    playerRef.current.seekTo(playerRef.current.getCurrentTime() + 10);
  };

  const handleVolumeChange = e => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setMuted(newVolume === 0);
  };

  const handleMute = () => {
    setMuted(!muted);
    if (muted) {
      // If currently muted, unmute to previous volume
      setVolume(volume === 0 ? 1 : volume);
    }
  };

  const handleFullscreen = () => {
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      } else if (containerRef.current.webkitRequestFullscreen) {
        containerRef.current.webkitRequestFullscreen();
      } else if (containerRef.current.msRequestFullscreen) {
        containerRef.current.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement
      );
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
      setPlaying(false);
    };
  }, []);

  useEffect(() => {
    if (episode && episode.episodeId) {
      setPlaying(false);
      setStarted(true);
      if (containerRef && containerRef.current) {
        containerRef.current.scrollIntoView({ behavior: 'smooth' });
      };
    };
  }, [episode]);


  const handleMobileMenuClick = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  // Load the last played position on component mount
  useEffect(() => {
    const savedPosition = localStorage.getItem(`video_${videoId}_position`);
    if (savedPosition) {
      setPlayed(parseFloat(savedPosition)); // Set the initial played state
    }
  }, [videoId]);

  const handleVideoReady = () => {
    const savedPosition = localStorage.getItem(`video_${videoId}_position`);
    const seekPosition = savedPosition ? parseFloat(savedPosition) : 0; // Fallback to 0 if no position

    if (!hasSeeked && playerRef.current) {
      playerRef.current.seekTo(seekPosition, 'seconds');
      setHasSeeked(true); // Prevent repetitive seeking
    }

    const videoElement = playerRef.current?.getInternalPlayer();
    const textTracks = videoElement?.textTracks;

    if (textTracks) {
      // Set default modes for text tracks
      Array.from(textTracks).forEach((track) => {
        track.mode = 'hidden'; // Default to hidden
      });
    }
  };

  return (
    <div className={styles.videoContainer} ref={containerRef}>
      {started ? (
        <div>
          <ResponsiveImage
            url={filmVideo?.thumbnail_url || thumbnailFile?.url}
            alt={"Video Thumbnail"}
            className={css.thumbnail}
          />
        </div>
      ) : <ReactPlayer
        key={filmVideo?.playback_url || videoFile?.playback_url}
        ref={playerRef}
        url={filmVideo?.playback_url || videoFile?.playback_url}
        width="100%"
        height="100%"
        playing={playing} // Controls playback state externally
        volume={volume}
        muted={muted}
        onProgress={handleProgress}
        onDuration={d => setDuration(d)}
        onReady={handleVideoReady}
        onPlay={() => setPlaying(true)} // Sync external play state
        onPause={() => setPlaying(false)} // Sync external pause state
        className={styles.videoPlayer}
        controls={false} // Disable built-in controls
        playIcon={<span onClick={handlePlayPause} />} // Custom play button
        stopOnUnmount={true} // Stops video on unmount
        onStart={() => onUpdateTheWatchlist({ listingId: transaction?.listing?.id?.uuid, isWatched: false })}
        onEnded={() => onUpdateTheWatchlist({ listingId: transaction?.listing?.id?.uuid, isWatched: true })}
      />}
      <div className={styles.controls}>
        <div className={styles.timeDisplayContainer}>
          <div className={styles.timeDisplay}>
            <span className={styles.remainingTime}>
              {completeTime}
            </span>
          </div>
          <div className={styles.progressContainer}>
            <input
              type="range"
              min={0}
              max={1}
              step="any"
              value={played}
              onMouseDown={handleSeekMouseDown}
              onChange={handleSeekChange}
              onMouseUp={handleSeekMouseUp}
              className={styles.progressBar}
            />
          </div>
          <div className={styles.timeDisplay}>
            <span className={styles.remainingTime}>
              {remainingTime}
            </span>
          </div>
        </div>
        {episode?.title ? (
          <div className={styles.episodeInfo}>{episode?.title}</div>
        ) : (
          <div className={styles.episodeInfo}>{title}</div>
        )}

        <div className={styles.controlButtons}>
          <button className={styles.button} onClick={handleRewind}>
            <IconCollection icon="video-rewind-icon" />
          </button>

          <button className={`${styles.button} ${styles.playButton}`} onClick={handlePlayPause}>
            {playing ? (
              <IconCollection icon="video-playing-icon" />
            ) : (
              <IconCollection icon="video-play-icon" />
            )}
          </button>

          <button className={styles.button} onClick={handleForward}>
            <IconCollection icon="video-forward-icon" />
          </button>
        </div>

        <div className={styles.rightControls}>
          <button
            className={`${styles.button} ${styles.mobileMenuButton}`}
            onClick={handleMobileMenuClick}
          >
            <IconCollection icon="mobile-menu-icon" />
          </button>
          <div className={`${styles.controlsWrapper} ${showMobileMenu ? styles.showMobile : ''}`}>
            <button
              className={classNames(styles.button, isOpen && styles.episodeButtonActive)}
              onClick={handleEpisodeClick}
            >
              <IconCollection icon="screen-mirror-icon" />
            </button>
            <div
              className={styles.volumeControl}
              onMouseEnter={() => setShowVolumeSlider(true)}
              onMouseLeave={() => setShowVolumeSlider(false)}
            >
              <button className={styles.button} onClick={handleMute}>
                {muted || volume === 0 ? (
                  <IconCollection icon="volume-mute" />
                ) : (
                  <IconCollection icon="volume-unmute" />
                )}
              </button>
              {showVolumeSlider && (
                <div className={styles.volumeSliderContainer}>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={muted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className={styles.volumeSlider}
                    />
                </div>
              )}
            </div>
            <button className={styles.button} onClick={openCommentModal}>
              <span className={isCommentOpen && styles.commentButtonActive}>
                <IconCollection icon="comment-icon" />
              </span>
            </button>
            <button className={styles.button} onClick={handleFullscreen}>
              <IconCollection icon="video-expand-icon" />
            </button>
            <button
              className={styles.button}
              onClick={() => {
                if (!showSubtitles) {
                  setShowSubTitles(true)
                } else {
                  setShowSubTitles(false)
                }
              }}
            >
              <IconCollection icon="subtitle-icon" />
              <ul className={classNames(styles.subtitles, showSubtitles ? styles.show : '')}>
                <li
                  className={subtitleIndex == -1 ? styles.selectedTitle : null}
                  onClick={() => {
                    if (playerRef.current) {
                      const videoElement = playerRef.current.getInternalPlayer(); // Get the internal video element
                      const textTracks = videoElement?.textTracks; // Access the text tracks

                      // Ensure textTracks are loaded
                      if (textTracks && textTracks.length > 0) {
                        Array.from(textTracks).forEach((track) => {
                          track.mode = 'disabled';
                        });
                        setSubtitleIndex(-1);
                      } else {
                        console.warn('Text tracks are not yet available.');
                      }
                    }
                  }}
                ><FormattedMessage id="VideoPlayer.captionOff" />
                </li>

                {(subtitle_ln_code.length > 0 ? subtitle_ln_code : subtitle_selection.length > 0
                  ? subtitle_selection
                  : ['No subtitles available']
                ).map((st, indx) => (
                  <li
                    key={st.key || indx}
                    className={subtitleIndex == indx ? styles.selectedTitle : null}
                    onClick={() => {
                      if (playerRef.current) {
                        const videoElement = playerRef.current.getInternalPlayer();
                        const textTracks = videoElement?.textTracks;
                        if (textTracks && textTracks.length > 0) {
                          // Find the index of the desired subtitle track based on label
                          const index = Array.from(textTracks).findIndex(
                            track => (st.key ? track.language == st.key : track.label == formatLabel(st)) // Adjust `formatLabel(st)` as per your logic
                          );
                          setSubtitleIndex(indx)
                          if (index !== -1) {
                            // Hide all subtitle tracks first
                            for (let i = 0; i < textTracks.length; i++) {
                              textTracks[i].mode = 'hidden';
                            }

                            // Show the desired subtitle track
                            textTracks[index].mode = 'showing';
                          } else {
                            console.warn('No subtitle track found with the specified label.');
                          }
                        } else {
                          console.warn('No subtitle tracks available.');
                        }
                      }
                    }}
                  >
                    {formatLabel(st.label || st)}
                  </li> // Ensure key is unique
                ))}
              </ul>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPanel;
