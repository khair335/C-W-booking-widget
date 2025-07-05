import React from 'react'
import ReactPlayer from 'react-player';
import css from './TransactionPage.module.css';
import { ResponsiveImage } from '../../components';

const VideoViewPanel = (props) => {
    const { transactionCollection, episode = {} } = props;
    const { filmVideo } = (transactionCollection && transactionCollection.listingData) || {};
    const { videoFile, thumbnailFile } = episode || {};

    return (
        <div >
            <div className={css.playerContainer}>
                <ReactPlayer
                    url={filmVideo && filmVideo.playback_url || videoFile && videoFile.playback_url}
                    controls
                    width="100%"
                    height="100%"
                    light={
                        <ResponsiveImage
                            url={filmVideo && filmVideo.thumbnail_url || thumbnailFile && thumbnailFile.url}
                            alt={"Thumbnail"}
                            className={css.thumbnail}
                        />
                    }
                />
            </div>
        </div>
    )
}
export default VideoViewPanel;