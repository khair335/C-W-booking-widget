import React from 'react';
import StarRatings from 'react-star-ratings';
import { LISTING_TYPE_FILMS, LISTING_TYPE_SERIES } from '../../../constants';
import { normalizeText } from '../../../util/data';
import { createResourceLocatorString, findRouteByRouteName } from '../../../util/routes';
import { createSlug } from '../../../util/urlHelpers';
import css from './Hits.module.css';
import { ResponsiveImage } from '../../../components';
import { formatCardDuration } from '../../../util/dataExtractor';

const sourceUrl = process.env.REACT_APP_GUMLET_SOURCE_URL;

const ListingHit = (props) => {
  const {
    hit,
    routeConfiguration,
    history,
    queryID
  } = props;

  const { title, publicData, objectID } = hit || {};
  const { primary_genre, ratingAvg, episodeCount, filmDuration, listingType } = publicData || {};
  const category = listingType === LISTING_TYPE_SERIES
    ? 'Series'
    : listingType === LISTING_TYPE_FILMS
      ? 'Film'
      : '';

  const genre = primary_genre && Array.isArray(primary_genre) && primary_genre.length
    ? normalizeText(primary_genre[0])
    : '';

  const { marketingPoster } = publicData;

  const contentDurationInfo = listingType === LISTING_TYPE_FILMS
    ? `${formatCardDuration(filmDuration)}`
    : listingType === LISTING_TYPE_SERIES
      ? `${episodeCount} episodes`
      : '';

  const onOverListingLink = () => {
    // Enforce preloading of ListingPage (loadable component)
    const { component: Page } = findRouteByRouteName('ListingPage', routeConfiguration);
    // Loadable Component has a "preload" function.
    if (Page.preload) {
      console.log('loading..');
      Page.preload();
    }
  };

  const onClickListingLink = () => {
    history.push(
      createResourceLocatorString(
        'ListingPage',
        routeConfiguration,
        { id: objectID, slug: createSlug(title) },
        { queryID }
      )
    );
  }

  return (
    <div
      className={css.card}
      onMouseOver={onOverListingLink}
      onTouchStart={onOverListingLink}
      onClick={onClickListingLink}
    >
      <div className={css.imageContainer}>
        <ResponsiveImage
          alt={title}
          className={css.cardImage}
          gumletImage={{
            sourceUrl,
            key: marketingPoster?.key,
          }}
        />
      </div>
      <div className={css.cardBody}>
        {ratingAvg ? (<div className={css.rating}>
          <StarRatings
            rating={ratingAvg}
            starDimension="25px"
            starSpacing="2px"
          />
        </div>) : null}
        <h3 className={css.cardTitle}>{title}</h3>
        <div className={css.cardDetails}>
          <p>{category} | {genre} | {contentDurationInfo}</p>
        </div>
      </div>
    </div>
  );
};

export default ListingHit;
