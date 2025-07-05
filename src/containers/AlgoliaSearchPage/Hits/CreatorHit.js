import React from 'react';
import { createResourceLocatorString, findRouteByRouteName } from '../../../util/routes';
import { FormattedMessage } from '../../../util/reactIntl';
import css from './Hits.module.css';
import { ResponsiveImage } from '../../../components';
import classNames from 'classnames';
import IconCollection from '../../../components/IconCollection/IconCollection';

const sourceUrl = process.env.REACT_APP_GUMLET_SOURCE_URL;


const CreatorHit = (props) => {
    const {
        hit,
        routeConfiguration,
        history,
        queryID
    } = props;

    const { username, totalFilms = 0, totalSeries = 0, displayName, userProfileImage
        = {}, marketingPosters } = hit;
    const onOverListingLink = () => {
        // Enforce preloading of ListingPage (loadable component)
        const { component: Page } = findRouteByRouteName('ProfilePage', routeConfiguration);
        // Loadable Component has a "preload" function.
        if (Page.preload) {
            Page.preload();
        }
    };

    const onClickListingLink = () => {
        history.push(
            createResourceLocatorString(
                'ProfilePage',
                routeConfiguration,
                { id: hit.objectID, username: hit.username || hit.displayName },
                { queryID }
            )
        );
    };

    return (
        <div
            className={css.card}
            onMouseOver={onOverListingLink}
            onTouchStart={onOverListingLink}
            onClick={onClickListingLink}
        >
            <div className={classNames(css.imageContainer, css.creatorImageContainer)}>
                <ResponsiveImage
                    alt={username}
                    className={classNames(css.cardImage, css.creatorImage)}
                    gumletImage={{
                        sourceUrl,
                        key: userProfileImage?.key,
                    }}
                    transformWidth={500}
                />
                {/*  */}

                {marketingPosters?.length > 0 ? (
                    <div className={css.smallImg}>
                        {marketingPosters
                            .slice(-3) // Get last 3 elements
                            .reverse() // Reverse the sliced array
                            .map((el, index) => (
                                <ResponsiveImage key={index} url={el} alt={username} />
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
                    <span>{username}</span>
                </div>
                <h3 className={css.cardTitle}>{displayName}</h3>
                <div className={css.cardDetails}>
                    <p>
                        <span><FormattedMessage id='CreatorHit.totalFilms' values={{ totalFilms }} /> </span>
                        <span> | </span>
                        <span><FormattedMessage id='CreatorHit.totalSeries' values={{ totalSeries }} /></span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CreatorHit;
