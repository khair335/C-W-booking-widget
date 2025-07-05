import React, { useState } from 'react';
import { string } from 'prop-types';
import classNames from 'classnames';

import { lazyLoadWithDimensions } from '../../../../util/uiHelpers.js';

import { AspectRatioWrapper, ResponsiveImage } from '../../../../components/index.js';

import css from './YoutubeEmbed.module.css';
import IconCollection from '../../../../components/IconCollection/IconCollection.js';

const RADIX = 10;
const BLACK_BG = '#000000';

const IFrame = props => {
  const { dimensions, ...rest } = props;
  return <iframe {...dimensions} {...rest} />;
};
const LazyIFrame = lazyLoadWithDimensions(IFrame);

export const YoutubeEmbed = props => {
  const { className, rootClassName, youtubeVideoId, aspectRatio } = props;
  const [isPlaying, setIsPlaying] = useState(false);
  const hasSlash = aspectRatio.indexOf('/') > 0;
  const [aspectWidth, aspectHeight] = hasSlash ? aspectRatio.split('/') : [16, 9];
  const width = Number.parseInt(aspectWidth, RADIX);
  const height = Number.parseInt(aspectHeight, RADIX);
  const classes = classNames(rootClassName || css.video, className);

  const handlePlayClick = () => {
    setIsPlaying(true);
  };

  return (
    <AspectRatioWrapper className={classes} width={width} height={height}>
      {!isPlaying ? (
        <div>
          <ResponsiveImage
            url={`https://img.youtube.com/vi/${youtubeVideoId}/maxresdefault.jpg`}
            className={css.thumbnail}
            alt={"Thumbnail"}
          />
          <div className={css.playOverlay} onClick={handlePlayClick}>
            <div className={css.playButton}>
              <IconCollection icon="play-icon" />
            </div>
          </div>
        </div>

      ) : (
        <LazyIFrame
          src={`https://www.youtube-nocookie.com/embed/${youtubeVideoId}?rel=0&autoplay=1&controls=0`}
          className={css.iframe}
          style={{ background: BLACK_BG }}
          frameBorder="0"
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Embedded youtube"
        />
      )}
    </AspectRatioWrapper>
  );
};

YoutubeEmbed.displayName = 'YoutubeEmbed';

YoutubeEmbed.defaultProps = {
  rootClassName: null,
  className: null,
  aspectRatio: '16/9',
};

YoutubeEmbed.propTypes = {
  rootClassName: string,
  className: string,
  youtubeVideoId: string.isRequired,
  aspectRatio: string,
};
