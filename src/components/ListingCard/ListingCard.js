import React from 'react';
import { string, func, bool } from 'prop-types';
import classNames from 'classnames';

import { useConfiguration } from '../../context/configurationContext';

import { FormattedMessage, intlShape, injectIntl } from '../../util/reactIntl';
import { displayPrice } from '../../util/configHelpers';
import { lazyLoadWithDimensions } from '../../util/uiHelpers';
import { FILM_LABEL, FILM_PRODUCTS, SERIES_LABEL, } from '../../util/types';
import { formatMoney } from '../../util/currency';
import { ensureListing, ensureUser } from '../../util/data';
import { createSlug } from '../../util/urlHelpers';
import { isBookingProcessAlias } from '../../transactions/transaction';
import { NamedLink, ResponsiveImage } from '../../components';
import StarRatings from 'react-star-ratings';
import css from './ListingCard.module.css';
import { formatCardDuration, formatLabel } from '../../util/dataExtractor';

const sourceUrl = process.env.REACT_APP_GUMLET_SOURCE_URL;

const calculateAverage = reviews => {
  if (reviews?.length === 0) {
    return 0;
  }
  const sum =
    reviews &&
    reviews?.reduce((accumulator, currentValue) => accumulator + currentValue.attributes.rating, 0);
  const average = sum / reviews?.length;
  return average;
};


const priceData = (price, currency, intl) => {
  if (price && price.currency === currency) {
    const formattedPrice = formatMoney(intl, price);
    return { formattedPrice, priceTitle: formattedPrice };
  } else if (price) {
    return {
      formattedPrice: intl.formatMessage(
        { id: 'ListingCard.unsupportedPrice' },
        { currency: price.currency }
      ),
      priceTitle: intl.formatMessage(
        { id: 'ListingCard.unsupportedPriceTitle' },
        { currency: price.currency }
      ),
    };
  }
  return {};
};

const LazyImage = lazyLoadWithDimensions(ResponsiveImage, { loadAfterInitialRendering: 3000 });

const PriceMaybe = props => {
  const { price, publicData, config, intl } = props;
  const { listingType } = publicData || {};
  const validListingTypes = config.listing.listingTypes;
  const foundListingTypeConfig = validListingTypes.find(conf => conf.listingType === listingType);
  const showPrice = displayPrice(foundListingTypeConfig);
  if (!showPrice && price) {
    return null;
  }

  const isBookable = isBookingProcessAlias(publicData?.transactionProcessAlias);
  const { formattedPrice, priceTitle } = priceData(price, config.currency, intl);
  return (
    <div className={css.price}>
      <div className={css.priceValue} title={priceTitle}>
        {formattedPrice}
      </div>
      {isBookable ? (
        <div className={css.perUnit}>
          <FormattedMessage id="ListingCard.perUnit" values={{ unitType: publicData?.unitType }} />
        </div>
      ) : null}
    </div>
  );
};

export const ListingCardComponent = props => {
  const config = useConfiguration();
  const {
    className,
    rootClassName,
    intl,
    listing,
    renderSizes,
    setActiveListing,
    showAuthorInfo,
    showDetails,
    reviews
  } = props;
  const classes = classNames(rootClassName || css.root, className);
  const currentListing = ensureListing(listing);
  const id = currentListing.id.uuid;
  const { title = '', price, publicData } = currentListing.attributes;
  const {
    series_primary_genre,
    primary_genre,
    listingType,
    filmVideo,
    episodeCount,
    episodes = [],
    listingRating,
  } = publicData;

  const slug = createSlug(title);

  const primaryGenreMaybe = series_primary_genre?.length
    ? <span>{series_primary_genre.map(g => formatLabel(g)).join(', ')}</span>
    : primary_genre?.length
      ? <span>{primary_genre.map(g => formatLabel(g)).join(', ')}</span>
      : '';

  const duration = filmVideo ? <span>{formatCardDuration(filmVideo?.duration)} </span> : (episodeCount || episodes?.length) ? <span>{episodeCount || episodes?.length} Episodes</span> : null;

  return (
    <NamedLink className={classes} name="ListingPage" params={{ id, slug }}>
      <ResponsiveImage
        alt={title}
        className={css.cardImage}
        gumletImage={{
          sourceUrl,
          key: publicData?.marketingPoster?.key,
        }}
      />
      {showDetails ? (
        <div className={css.info}>
          <div className={css.ratings}>
            <StarRatings
              svgIconViewBox="0 0 40 37"
              svgIconPath="M20 0L26.113 11.5862L39.0211 13.8197L29.891 23.2138L31.7557 36.1803L20 30.4L8.2443 36.1803L10.109 23.2138L0.97887 13.8197L13.887 11.5862L20 0Z"
              starRatedColor="#ffb802"
              // starEmptyColor="#ffffff"
              rating={listingRating ? listingRating : 0}
              starDimension="25px"
              starSpacing="2px"
            />
          </div>
          <div className={css.mainInfo}>
            <h6 className={css.title}>
              {title
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ')}
            </h6>
            <p className={css.category}>
              {listingType == FILM_PRODUCTS ? FILM_LABEL : SERIES_LABEL}&nbsp;|&nbsp;{primaryGenreMaybe}&nbsp;|&nbsp;
              {duration}
            </p>
            {/* {showAuthorInfo ? (
            <div className={css.authorInfo}>
              <FormattedMessage id="ListingCard.author" values={{ authorName }} />
            </div>
          ) : null} */}
          </div>
        </div>) : null}
    </NamedLink>
  );
};

ListingCardComponent.defaultProps = {
  className: null,
  rootClassName: null,
  renderSizes: null,
  setActiveListing: null,
  showAuthorInfo: true,
};

ListingCardComponent.propTypes = {
  className: string,
  rootClassName: string,
  intl: intlShape.isRequired,
  // listing: propTypes.listing.isRequired,
  showAuthorInfo: bool,

  // Responsive image sizes hint
  renderSizes: string,

  setActiveListing: func,
};

export default injectIntl(ListingCardComponent);
