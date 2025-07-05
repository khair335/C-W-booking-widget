import React from 'react';
import { ResponsiveImage } from '../../components';
import css from './WishlistPage.module.css';
import classNames from 'classnames';
import { createResourceLocatorString } from '../../util/routes';
import IconCollection from '../../components/IconCollection/IconCollection';

export const Creator = ({ list, history, FormattedMessage, routeConfiguration }) => {
  const {
    userName,
    totalFilms = 0,
    totalSeries = 0,
    displayName,
    userProfileImage = {},
    marketingPosters,
  } = list?.attributes?.profile?.publicData || {};
  const sourceUrl = process.env.REACT_APP_GUMLET_SOURCE_URL;

  const routeToProfilePage = (id, username) =>
    history.push(
      createResourceLocatorString(
        'ProfilePage',
        routeConfiguration,
        { id, username: username || displayName },
        {}
      )
    );

  return (
    <div
      className={css.card}
      // onMouseOver={onOverListingLink}
      // onTouchStart={onOverListingLink}
      onClick={() => routeToProfilePage(list?.id?.uuid, userName)}
    >
      <div className={classNames(css.imageContainer, css.creatorImageContainer)}>
        <ResponsiveImage
          alt={userName}
          className={classNames(css.cardImage, css.creatorImage)}
          gumletImage={{
            sourceUrl,
            key: userProfileImage?.key,
          }}
          transformWidth={500}
        />

        {marketingPosters?.length ? (
          <div className={css.smallImg}>
            {marketingPosters
              .slice(-3) // Get last 3 elements
              .reverse() // Reverse the sliced array
              .map((el, index) => (
                <ResponsiveImage key={index} url={el} alt={userName} />
              ))}
          </div>
        ) : (
          <div className={css.smallImgPlaceholder}>
            <IconCollection icon="coming-soon-media" />
            <p>Content Coming Soon</p>
          </div>
        )}
      </div>
      <div className={css.cardBody}>
        <div className={css.username}>
          <span>{userName}</span>
        </div>
        <h3 className={css.cardTitle}>{displayName}</h3>
        <div className={css.cardDetails}>
          <p>
            <span>
              <FormattedMessage id="CreatorHit.totalFilms" values={{ totalFilms }} />{' '}
            </span>
            <span> | </span>
            <span>
              <FormattedMessage id="CreatorHit.totalSeries" values={{ totalSeries }} />
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};
