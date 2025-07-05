import React, { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import styles from './CustomVideoPlayer.module.css';
import IconCollection from '../IconCollection/IconCollection';
import classNames from 'classnames';
import { FormattedMessage } from 'react-intl';
import { formatLabel } from '../../util/dataExtractor';
// import { formatLabel } from '../../util/dataExtractor';
// import { FormattedMessage } from 'react-intl';
// import { ResponsiveImage } from '..';
// import css from './CustomVideoPlayer.module.css'

const customVideoPlayer = props => {
  const {
    transactionCollection,
    episode = {},
    // openEpisodeModal,
    // isOpen,
    // openCommentModal,
    // isCommentOpen,
    transaction,
    currentListing,
    onUpdateMetadata,
    url,
  } = props;

  const { filmVideo, title, subtitle_selection = [], subtitle_ln_code = [] } =
    transactionCollection?.listingData ||
    (transaction?.id && transaction.listing?.attributes?.publicData) || currentListing?.attributes?.publicData ||
    {};
  const { contantWatched = false } = (transaction && transaction.id && transaction.attributes.metadata) || {};
  const [controlsVisible, setControlsVisible] = useState(true);
  const controlsTimeoutRef = useRef(null);
  const { videoFile, thumbnailFile } = episode || {};
  const videoId = filmVideo?.asset_id || videoFile?.asset_id; // Unique ID for the video
  const [playing, setPlaying] = useState(true);
  const [started, setStarted] = useState(true);
  const playerRef = useRef(null);
  const [volume, setVolume] = useState(1); // Add volume state (0 to 1)
  const [muted, setMuted] = useState(true); // Add muted state
  const [showVolumeSlider, setShowVolumeSlider] = useState(false); // Optional: for showing/hiding volume slider
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null); // Add this ref for the container
  const [played, setPlayed] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false); // Add this state
  const [showSubtitles, setShowSubTitles] = useState(false);
  const [hasSeeked, setHasSeeked] = useState(false); // Tracks if seeking is done
  const [subtitleIndex, setSubtitleIndex] = useState(-1);

  // const handleEpisodeClick = () => {
  //   if (openEpisodeModal) {
  //     openEpisodeModal();
  //   }
  // };

  const handlePlayPause = () => {
    setPlaying(prev => !prev);
    setStarted(false)
    if (!contantWatched) {
      onUpdateMetadata({ txId: transaction?.id })
    }
  };
  // // Update handleProgress
  const handleProgress = state => {
    if (!seeking) {
      setPlayed(state.played);
      if (videoId) {
        localStorage.setItem(`video_${videoId}_position`, state.playedSeconds);
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
    };
  }, []);

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

  const hideControls = () => {
    if (playing && !showVolumeSlider && !showMobileMenu) {
      setControlsVisible(false);
    }
  };

  const handleMouseMove = () => {
    setControlsVisible(true);

    // Clear any existing timeout
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    // Set new timeout to hide controls after 2 seconds of no movement
    controlsTimeoutRef.current = setTimeout(hideControls, 2000);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  // Update controls visibility when these states change
  useEffect(() => {
    if (showVolumeSlider || showMobileMenu || !playing) {
      setControlsVisible(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    }
  }, [showVolumeSlider, showMobileMenu, playing]);;


  return (
    <div className={styles.videoContainer} ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseMove}
      onMouseLeave={() => {
        if (playing) {
          setControlsVisible(false);
          if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
          }
        }
      }}>
      <ReactPlayer
        key={filmVideo?.playback_url || videoFile?.playback_url}
        ref={playerRef}
        url={url}
        width="100%"
        height="100%"
        playing={playing} // Controls playback state externally
        volume={volume}
        muted={muted}
        onProgress={handleProgress}
        onReady={handleVideoReady}
        onPlay={() => setPlaying(true)} // Sync external play state
        onPause={() => setPlaying(false)} // Sync external pause state
        className={styles.videoPlayer}
        controls={false} // Disable built-in controls
        playIcon={<span onClick={handlePlayPause} />} // Custom play button
        stopOnUnmount={true} // Stops video on unmount
      />
      <div className={classNames(
        styles.controls,
        controlsVisible ? styles.visible : styles.hidden
      )}>
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
            {/* <button
              className={classNames(styles.button, isOpen && styles.episodeButtonActive)}
              onClick={handleEpisodeClick}
            >
              <IconCollection icon="screen-mirror-icon" />
            </button> */}
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
            {/* <button className={styles.button} onClick={openCommentModal}>
              <span className={isCommentOpen && styles.commentButtonActive}>
                <IconCollection icon="comment-icon" />
              </span>
            </button> */}
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

export default customVideoPlayer;
