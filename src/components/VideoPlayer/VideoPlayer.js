import React, { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import classNames from 'classnames';
import styles from './VideoPlayer.module.css';
import ResponsiveImage from '../ResponsiveImage/ResponsiveImage';
import IconCollection from '../IconCollection/IconCollection';
import { getSubtitleLanguage } from '../../util/data';
import OutsideClickHandler from '../OutsideClickHandler/OutsideClickHandler';

const VideoPlayer = ({
    videoUrl,
    thumbnailUrl,
    gumletImage,
    subtitle = [],
    autoPlay = false,
    showControls = true,
    lightbox = false,
    className,
    playing,
    setPlaying,
}) => {
    const playerRef = useRef(null);
    const containerRef = useRef(null);
    const [volume, setVolume] = useState(1);
    const [muted, setMuted] = useState(autoPlay);
    const [played, setPlayed] = useState(0);
    const [duration, setDuration] = useState(0);
    const [seeking, setSeeking] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showsubtitle, setShowsubtitle] = useState(false);
    const [subtitleIndex, setSubtitleIndex] = useState(-1);
    const [shouldShowControls, setShouldShowControls] = useState(showControls);
    const [previewClicked, setPreviewClicked] = useState(false);
    const [iconSize, setIconSize] = useState('md');
    const controlTimeoutRef = useRef(null);

    const togglePlayPause = (e) => {
        e.stopPropagation();
        setPlaying(prev => !prev)
    };

    const handleProgress = state => {
        if (!seeking) {
            setPlayed(state.played);
        }
    };

    const handleSeek = value => {
        setPlayed(parseFloat(value));
        playerRef.current.seekTo(parseFloat(value));
    };

    const handleVolumeChange = value => {
        const newVolume = parseFloat(value);
        setVolume(newVolume);
        setMuted(newVolume === 0);
    };

    const toggleMute = () => setMuted(prev => !prev);

    const handleFullscreen = () => {
        if (!isFullscreen) {
            containerRef.current?.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
        setIsFullscreen(prev => !prev);
    };

    const handleSubtitleChange = (index, label) => {
        setSubtitleIndex(index);
        setShowsubtitle(false);
        const videoElement = playerRef.current?.getInternalPlayer();
        const textTracks = videoElement?.textTracks;

        if (textTracks && textTracks.length > 0) {
            Array.from(textTracks).forEach((track, i) => {
                track.mode = track.label === label ? 'showing' : 'hidden';
            });
        }
    };

    const handleVideoReady = () => {
        const videoElement = playerRef.current?.getInternalPlayer();
        const textTracks = videoElement?.textTracks;

        if (textTracks) {
            Array.from(textTracks).forEach(track => (track.mode = 'hidden'));
        }
    };

    const handleDuration = (duration) => {
        setDuration(duration);
    };

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


    const handleMouseEnter = () => {
        clearTimeout(controlTimeoutRef.current);
        setShouldShowControls(true);
    };

    const handleMouseLeave = () => {
        controlTimeoutRef.current = setTimeout(() => {
            setShouldShowControls(false);
        }, 2000); // Hide controls after 2 seconds
    };

    const handleTouchStart = () => {
        clearTimeout(controlTimeoutRef.current);
        setShouldShowControls(true);
    };

    const handleTouchEnd = () => {
        controlTimeoutRef.current = setTimeout(() => {
            setShouldShowControls(false);
        }, 2000);
    };

    useEffect(() => {
        const updateIconSize = () => {
            const width = containerRef.current?.offsetWidth;
            if (width > 0) {
                if (width >= 1024) {
                    setIconSize('lg');
                } else if (width >= 767) {
                    setIconSize('md');
                } else {
                    setIconSize('sm');
                }
            }
        };

        const handleInitialLoad = () => {
            updateIconSize();
        };

        handleInitialLoad();
        window.addEventListener('resize', updateIconSize);

        return () => {
            window.removeEventListener('resize', updateIconSize);
            clearTimeout(controlTimeoutRef.current);
        };
    }, [containerRef]);

    const light = lightbox && gumletImage ? (
        <ResponsiveImage
            gumletImage={gumletImage}
        />
    ) : lightbox ? (<ResponsiveImage
        url={thumbnailUrl}
        alt={"Thumbnail"}
        className={styles.cardImage}
        style={{ objectFit: 'cover', width: '100%', height: '100%' }}
    />) : null;

    const remainingTime = formatTime(duration - played * duration);

    const iconSizeClass = {
        sm: styles.iconSmall,
        md: styles.iconMedium,
        lg: styles.iconLarge,
    }[iconSize];

    const playToggleDisabled = lightbox && !previewClicked;

    return (
        <div
            className={classNames(styles.videoContainer, className)}
            ref={containerRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            <ReactPlayer
                ref={playerRef}
                url={videoUrl}
                playing={playing}
                volume={volume}
                muted={muted}
                onProgress={handleProgress}
                onReady={handleVideoReady}
                onDuration={handleDuration}
                width="100%"
                height="100%"
                controls={false}
                light={light}
                onClickPreview={(e) => {
                    setPreviewClicked(true);
                    togglePlayPause(e);
                }}
            />
            <div className={classNames(styles.controls, (!shouldShowControls || (!previewClicked && lightbox)) && styles.hidden)}>
                <div className={styles.controlsWrapper}>
                    <div className={styles.progressContainer}>
                        <input
                            type="range"
                            min={0}
                            max={1}
                            step="any"
                            value={played}
                            onChange={e => handleSeek(e.target.value)}
                            className={styles.progressBar}
                        />
                    </div>
                    <div className={styles.timeDisplay}>
                        <span className={styles.remainingTime}>
                            {remainingTime}
                        </span>
                    </div>
                </div>
                <div className={classNames(styles.controlButtons, iconSize === 'sm' ? styles.smControlButtons : iconSize === 'md' ? styles.mdControlButtons : styles.lgControlButtons)}>
                    <div className={styles.videoPlayControl}>
                        <button type='button' onClick={() => handleSeek(played - 0.1)} className={styles.button}>
                            <IconCollection icon="video-rewind-icon" className={iconSizeClass} />
                        </button>
                        <button type='button' disabled={playToggleDisabled} onClick={togglePlayPause} className={styles.button}>
                            {playing ? (
                                <span className={classNames(styles.playingIcon, iconSizeClass)}>
                                    <IconCollection icon="video-playing-icon" className={iconSizeClass} />
                                </span>
                            ) : (
                                <span className={classNames(iconSizeClass, styles.playIconWrapper)} style={{ opacity: playToggleDisabled ? 0.5 : 1 }}>
                                    <span className={styles.playIcon}>
                                    </span>
                                </span>
                            )}
                        </button>
                        <button type='button' onClick={() => handleSeek(played + 0.1)} className={styles.button}>
                            <IconCollection icon="video-forward-icon" className={iconSizeClass} />
                        </button>
                    </div>
                    <div className={styles.volumeAndSubtitle}>
                        <div className={styles.volumeControl}>
                            <button type='button' onClick={toggleMute} className={styles.button}>
                                {muted || volume === 0 ? (
                                    <IconCollection icon="volume-mute" className={iconSizeClass} />
                                ) : (
                                    <IconCollection icon="volume-unmute" className={iconSizeClass} />
                                )}
                            </button>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={muted ? 0 : volume}
                                onChange={e => handleVolumeChange(e.target.value)}
                                className={styles.volumeSlider}
                            />
                        </div>
                        <div className={styles.subtitleMenu}>
                            <button
                                type='button'
                                className={styles.button}
                                onClick={() => setShowsubtitle(!showsubtitle)}
                            >
                                <IconCollection icon="subtitle-icon" className={iconSizeClass} />
                            </button>
                            {showsubtitle && (
                                <OutsideClickHandler onOutsideClick={() => setShowsubtitle(false)}>
                                    <ul className={classNames(styles.subtitleList)}>
                                        {subtitle.length === 0 && <li>No subtitles</li>}
                                        <li
                                            className={subtitleIndex === -1 ? styles.active : ''}
                                            onClick={() => handleSubtitleChange(-1, 'Off')}
                                        >
                                            Off
                                        </li>
                                        {subtitle.map((subtitle, index) => (
                                            <li
                                                key={index}
                                                className={subtitleIndex === index ? styles.active : ''}
                                                onClick={() => handleSubtitleChange(index, getSubtitleLanguage(subtitle.fileName))}
                                            >
                                                {getSubtitleLanguage(subtitle.fileName)}
                                            </li>
                                        ))}
                                    </ul>
                                </OutsideClickHandler>
                            )}
                        </div>
                        <button type='button' onClick={handleFullscreen} className={styles.button}>
                            {!isFullscreen
                                ? <IconCollection icon="video-collapse-icon" className={iconSizeClass} />
                                : <IconCollection icon="video-expand-icon" className={iconSizeClass} />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoPlayer;
