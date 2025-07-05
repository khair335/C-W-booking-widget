import React from 'react';
import { node, object, string } from 'prop-types';

import { FormattedMessage } from '../../util/reactIntl';
import { propTypes } from '../../util/types';
import { createSlug } from '../../util/urlHelpers';
import { formatMoney } from '../../util/currency';

import {
  AspectRatioWrapper,
  AvatarMedium,
  H4,
  H6,
  NamedLink,
  ResponsiveImage,
} from '../../components';

import css from './CheckoutPage.module.css';
import { formatCardDuration, formatLabel } from '../../util/dataExtractor';

const sourceUrl = process.env.REACT_APP_GUMLET_SOURCE_URL;

const DetailsSideCard = props => {
  const {
    listing,
    listingTitle,
    author,
    layoutListingImageConfig,
    speculateTransactionErrorMessage,
    processName,
    breakdown,
    intl,
  } = props;

  const { price, publicData } = listing?.attributes || {};
  const unitType = publicData.unitType || 'unknown';

  const { aspectWidth = 1, aspectHeight = 1 } =
    layoutListingImageConfig || {};

  const {
    filmVideo,
    episodeCount,
    episodes = [],
    marketingBanner,
    marketingPoster
  } = publicData;

  const duration = filmVideo ? <span>{formatCardDuration(filmVideo?.duration)} </span> : (episodeCount || episodes?.length) ? <span>{episodeCount || episodes?.length} Episodes</span> : null;

  return (
    <div className={css.detailsContainerDesktop}>
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
              key: marketingBanner.key,
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
          // gumletImage={{
          //   sourceUrl: marketingPoster?.url,
          //   key: marketingPoster?.key,
          // }}
          />
        </AspectRatioWrapper> : null}
      </div>
      <div className={css.listingDetailsWrapper}>
        <div className={css.avatarWrapper}>
          <AvatarMedium user={author} disableProfileLink className={css.avatar} />
        </div>
        <div className={css.detailsHeadings}>
          <H4 as="h2">
            <NamedLink
              name="ListingPage"
              params={{ id: listing?.id?.uuid, slug: createSlug(listingTitle) }}
            >
              {formatLabel(listingTitle)}
            </NamedLink>
          </H4>

          <div className={css.priceContainer}>
            <p className={css.price}>{formatMoney(intl, price)}</p>
            <div className={css.perUnit}>
              <FormattedMessage
                id="CheckoutPageWithInquiryProcess.perUnit"
                values={{ unitType }}
              />
            </div> &nbsp;|&nbsp;
            <span>
              {duration}
            </span>
          </div>

        </div>
        {speculateTransactionErrorMessage}
      </div>

      {!!breakdown ? (
        <div className={css.orderBreakdownHeader}>
          <H6 as="h3" className={css.orderBreakdownTitle}>
            <FormattedMessage id={`CheckoutPage.${processName}.orderBreakdown`} />
          </H6>
          <hr className={css.totalDivider} />
        </div>
      ) : null}
      {breakdown}
      {/* <div className={css.primaryButtonWrapper}>
        <PrimaryButton
          className={css.submitButton}
          type="submit"
        // inProgress={submitInProgress}
        // disabled={submitDisabled}
        >
          <FormattedMessage id="StripePaymentForm.buyNow" />
        </PrimaryButton>
      </div> */}
    </div>
  );
};

DetailsSideCard.defaultProps = {
  speculateTransactionErrorMessage: null,
  breakdown: null,
};

DetailsSideCard.propTypes = {
  listing: propTypes.listing.isRequired,
  listingTitle: string.isRequired,
  author: propTypes.user.isRequired,
  firstImage: propTypes.image.isRequired,
  layoutListingImageConfig: object.isRequired,
  speculateTransactionErrorMessage: node,
  processName: string.isRequired,
  breakdown: node,
};

export default DetailsSideCard;
