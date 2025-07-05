import React from 'react';
import { ResponsiveImage } from '../../components';
import css from './WishlistPage.module.css';
import { formatDuration, normalizeText } from '../../util/data';
import { LISTING_TYPE_FILMS, LISTING_TYPE_SERIES } from '../../constants';
import StarRatings from 'react-star-ratings';

const sourceUrl = process.env.REACT_APP_GUMLET_SOURCE_URL;

export const ListSeriesAndFilm = ({ list, navigator }) => {
  const { id } = list || {};
  const { title, publicData } = list?.attributes || {};
  const { primary_genre, ratingAvg, episodeCount, filmDuration, listingType, marketingPoster } =
    publicData || {};
  const contentDurationInfo =
    listingType === LISTING_TYPE_FILMS
      ? formatDuration(filmDuration || 0)
      : listingType === LISTING_TYPE_SERIES
      ? `${episodeCount} episodes`
      : '';

  const genre =
    primary_genre && Array.isArray(primary_genre) && primary_genre.length
      ? normalizeText(primary_genre[0])
      : '';

  return (
    <div
      className={css.card}
      // onMouseOver={onOverListingLink}
      // onTouchStart={}
      onClick={() => navigator(id?.uuid)}
      key={id?.uuid}
    >
      <div className={css.imageContainer}>
        <ResponsiveImage
          alt={title}
          className={css.cardImage}
          gumletImage={{
            sourceUrl: sourceUrl,
            key: marketingPoster?.key,
          }}
        />
      </div>
      {/* series */}
      <div className={css.cardBody}>
        {ratingAvg ? (
          <div className={css.rating}>
            <StarRatings rating={ratingAvg} starDimension="25px" starSpacing="2px" />
          </div>
        ) : null}
        <h3 className={css.cardTitle}>{title}</h3>
        <div className={css.cardDetails}>
          <p>
            {'Series'} | {genre} | {contentDurationInfo}
          </p>
        </div>
      </div>
    </div>
  );
};
