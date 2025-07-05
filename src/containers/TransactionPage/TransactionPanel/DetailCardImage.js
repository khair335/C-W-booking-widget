import React from 'react';
import classNames from 'classnames';

import { AvatarMedium, AspectRatioWrapper, ResponsiveImage } from '../../../components';

import css from './TransactionPanel.module.css';

const sourceUrl = process.env.REACT_APP_GUMLET_SOURCE_URL;

const DetailCardImage = props => {
  const {
    className,
    rootClassName,
    avatarWrapperClassName,
    listingTitle,
    image,
    provider,
    isCustomer,
    listingImageConfig,
    transactionCollection,
    listing
  } = props;

  const {
    marketingBanner = {},
    marketingPoster = {}
  } = transactionCollection?.listingData ? transactionCollection?.listingData : listing?.id && listing?.attributes?.publicData || {};

  const { aspectWidth = 1, aspectHeight = 1 } = listingImageConfig;

  return (
    <React.Fragment>
      <div className={css.posterWrapper}>
   
          <AspectRatioWrapper
            width={aspectWidth}
            height={aspectHeight}
            className={css.detailsAspectWrapper}
          >
            <ResponsiveImage
              alt={"title"}
              className={css.cardImage}
              gumletImage={{
                sourceUrl,
                key: marketingBanner?.key,
              }}
            />
          </AspectRatioWrapper>
          {marketingPoster ? <AspectRatioWrapper
            width={aspectWidth}
            height={aspectHeight}
            className={css.posterAspectWrapper}
          >
            <ResponsiveImage
              alt={"title"}
              className={css.cardImage}
              url={marketingPoster?.url}
            />
          </AspectRatioWrapper> : null}
   

      </div>
      
        <div className={avatarWrapperClassName || css.avatarWrapper}>
          <AvatarMedium user={provider} className={css.avatar} />
        </div>
      
    </React.Fragment>
  );
};

export default DetailCardImage;
