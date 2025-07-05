import React from 'react';
import { IconCollection, ResponsiveImage } from '../../../../components';
import StarRatings from 'react-star-ratings';
import { getCurrentDeviceWidth } from '../../../../components/CurrentViewPort/CurrentViewPort';
import css from './CustomHeroSection.module.css';


const CustomHeroListing = ({ data }) => {
  const {
    title = '',
    description = '',
    background_image,
    poster_image,
    cta_link,
    cta_label,
    rating
  } = data || {};


  const bannerUrl = background_image?.url;
  const posterUrl = poster_image?.url;

  const deviceWidth = getCurrentDeviceWidth();
  // Inline style for dynamic background image
  const backgroundStyle = {
    backgroundImage: deviceWidth > 767 ? ` url(${bannerUrl})` : `linear-gradient(180deg, rgba(0, 0, 0, 0.00) 29.41%, #000 75.78%), url(${bannerUrl})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  };

  return (
    <div className={css.container} >
      <div className={css.overlay} style={backgroundStyle}></div>
      <div className={css.content}>
        <div className={css.leftSection}>
          <ResponsiveImage
            alt={title}
            className={css.poster}
            variants={['default']}
            url={posterUrl}
          />
        </div>
        <div className={css.rightSection}>
          <h2 className={css.title}>{title
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')}</h2>

          {rating ? (<div className={css.reviews}>
            <span className={css.ratingNumber}> {rating}</span>
            <StarRatings
              svgIconViewBox="0 0 40 37"
              svgIconPath="M20 0L26.113 11.5862L39.0211 13.8197L29.891 23.2138L31.7557 36.1803L20 30.4L8.2443 36.1803L10.109 23.2138L0.97887 13.8197L13.887 11.5862L20 0Z"
              starRatedColor="#ffb802"
              rating={rating ? rating : 0}
              starDimension="25px"
              starSpacing="2px"
            />
          </div>) : null}
          <div className={css.movieDetails}>
            {description}
          </div>
          <div className={css.actions}>
            <a
              className={css.watchTrailerButton}
              href={cta_link}
            >
         
              <IconCollection icon="video-play-icon-sm" />
              {cta_label}
            </a>

          </div>
        </div>
      </div>
    </div>
  );
};


export default CustomHeroListing;
