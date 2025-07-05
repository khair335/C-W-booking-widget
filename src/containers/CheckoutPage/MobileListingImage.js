import React from 'react';
import classNames from 'classnames';

import { AspectRatioWrapper, AvatarMedium, ResponsiveImage } from '../../components';

import css from './CheckoutPage.module.css';

const sourceUrl = process.env.REACT_APP_GUMLET_SOURCE_URL;

const MobileListingImage = props => {
  const { author, layoutListingImageConfig, listing } = props;

  const { aspectWidth = 1, aspectHeight = 1 } =
    layoutListingImageConfig || {};

  const { publicData, title = '' } = listing?.attributes || {};
  const {
    marketingBanner,
    marketingPoster
  } = publicData || {};


  return (
    <> <div className={css.posterWrapper}>
      <AspectRatioWrapper
        width={aspectWidth}
        height={aspectHeight}
        className={css.listingImageMobile}
      >
        <ResponsiveImage
          rootClassName={css.rootForImage}
          alt={title}
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
      <div className={classNames(css.avatarWrapper, css.avatarMobile)}>
        <AvatarMedium user={author} disableProfileLink />
      </div>
    </>
  );
};

export default MobileListingImage;
