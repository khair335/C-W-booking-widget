import React, { useEffect, useState } from 'react';
import { propTypes } from '../../util/types';
import { createResourceLocatorString } from '../../util/routes';
import { IconCollection, ResponsiveImage } from '..';
import classNames from 'classnames';

import css from './CreatorCard.module.css';



const CreatorCard = (props) => {

    const { creator, routeConfiguration, history, list, FormattedMessage } = props;

    const routeToProfilePage = (id, username) =>
        history.push(createResourceLocatorString('ProfilePage', routeConfiguration, { id, username }, {}));
   
    return (
        <div
            key={creator?.id}
            className={css.card}
            // onMouseOver={onOverListingLink}
            // onTouchStart={onOverListingLink}
            onClick={() => routeToProfilePage(creator?.id, creator?.realUserName)}
        >
            <div className={classNames(css.imageContainer, css.creatorImageContainer)}>
                <ResponsiveImage
                    alt={creator.name}
                    className={classNames(css.cardImage, css.creatorImage)}
                    gumletImage={{
                        sourceUrl: process.env.REACT_APP_GUMLET_SOURCE_URL,
                        key: creator.image,
                    }}
                    transformWidth={500}
                    variants={['default']}
                />

                {creator?.marketingPosters?.length ? (
                    <div className={css.smallImg}>
                        {creator?.marketingPosters
                            .slice(-3) // Get last 3 elements
                            .reverse() // Reverse the sliced array
                            .map((el, index) => (
                                <ResponsiveImage key={index} url={el} alt={creator.username} />
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
                    <span>{creator.username}</span>
                </div>
                <h3 className={css.cardTitle}>{creator.name}</h3>
                {/* <div className={css.cardDetails}>
          <p>
            <span>
              <FormattedMessage id="CreatorHit.totalFilms" values={{ totalFilms }} />{' '}
            </span>
            <span> | </span>
            <span>
              <FormattedMessage id="CreatorHit.totalSeries" values={{ totalSeries }} />
            </span>
          </p>
        </div> */}
            </div>
        </div>
    );
};

CreatorCard.propTypes = {
    creator: propTypes.creator,
    routeConfiguration: propTypes.route,
    history: propTypes.history,
};

export default CreatorCard;
