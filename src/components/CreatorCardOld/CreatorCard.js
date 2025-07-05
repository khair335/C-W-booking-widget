import React, { useEffect, useState } from 'react';
import { propTypes } from '../../util/types';
import { createResourceLocatorString } from '../../util/routes';
import { IconCollection, ResponsiveImage } from '..';
import classNames from 'classnames';
import css from './CreatorCard.module.css';                                 

const CreatorCard = ({ creator, routeConfiguration, history }) => {
    const [screenWidth, setScreenWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);

      useEffect(() => {
        if (typeof window === 'undefined') return;
    
        const handleResize = () => {
          setScreenWidth(window.innerWidth);
          console.log('Screen width:', window.innerWidth);
        };
    
        window.addEventListener('resize', handleResize);
    
        // Initial log
        handleResize();
    
        return () => {
          window.removeEventListener('resize', handleResize);
        };
      }, []);

    const routeToProfilePage = (id, username) =>
        history.push(createResourceLocatorString('ProfilePage', routeConfiguration, { id, username }, {}));
    return (
        <div
            key={creator?.id}
            className={css.creatorCard}
            onClick={() => routeToProfilePage(creator?.id, creator?.realUserName)}
            // style={{ width: screenWidth < 768 ? 294 : 340 }}
        >
            <div className={css.creatorCardContent}>
                <div className={css.creatorInfo}>
                    <ResponsiveImage
                        alt={creator.name}
                        className={css.creatorImage}
                        variants={['default']}
                        gumletImage={{
                            sourceUrl: process.env.REACT_APP_GUMLET_SOURCE_URL,
                            key: creator.image,
                        }}
                        transformWidth={500}
                    />
                    <div className={css.creatorInfoContent}>
                        <p className={css.usernameDesktop}>{creator.username}</p>
                        <h3 className={css.creatorName}>{creator.name}</h3>
                    </div>
                </div>
                <div className={css.bookGridContainer}>
                    <div className={classNames(css.bookGrid, creator.marketingPosters?.length > 2 && css.bookGridThree)}>
                        {creator.marketingPosters?.length > 0
                            ? creator.marketingPosters
                                .slice(-3) // Get last 3 elements
                                .reverse() // Reverse the sliced array
                                .map((el, index) => (
                                    <ResponsiveImage
                                        key={index}
                                        url={el}
                                        alt={creator.username}
                                        className={css.bookCover}
                                    />
                                ))
                            : <div className={css.smallImgPlaceholder}>
                                <IconCollection icon="coming-soon-media" />
                                <p>Content Coming Soon</p>
                            </div>}
                    </div>
                </div>
            </div>
            <p className={css.usernameMobile}>{creator.username}</p>
        </div>
    );
};

CreatorCard.propTypes = {
    creator: propTypes.creator,
    routeConfiguration: propTypes.route,
    history: propTypes.history,
};

export default CreatorCard;