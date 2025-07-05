import React, { useState } from 'react';
import css from './ListingBannerDetails.module.css';
import classNames from 'classnames';
import ReactPlayer from 'react-player';
// import { manageDisableScrolling } from '../../../ducks/ui.duck';
import { Button, Modal, NamedLink, ResponsiveImage, VideoPlayer } from '../../../components';
import IconCollection from '../../../components/IconCollection/IconCollection';
import { formatMoney } from '../../../util/currency';
import { FILM_LABEL, FILM_PRODUCTS, SERIES_LABEL } from '../../../util/types';
import StarRatings from 'react-star-ratings';
import { formatCardDuration, formatLabel } from '../../../util/dataExtractor';
import { getCurrentDeviceWidth } from '../../../components/CurrentViewPort/CurrentViewPort';
import { Tooltip } from 'react-tooltip';



const sourceUrl = process.env.REACT_APP_GUMLET_SOURCE_URL;


const ExpandableDescription = ({ description = "", limit = 280, intl }) => {

  if (typeof window == "undefined") {
    return null;
  }
  const DOMPurify = require('dompurify');

  const [isExpanded, setIsExpanded] = useState(false);
  const sanitizedContent = DOMPurify.sanitize(description.replace(/＜/g, "<").replace(/＞/g, ">"));

  // Function to toggle between full and limited content
  const toggleContent = () => {
    setIsExpanded(!isExpanded);
  };

  // Strip HTML tags and get plain text
  const getTextContent = (htmlContent) => {
    const tempElement = document.createElement('div');
    tempElement.innerHTML = htmlContent;
    return tempElement.textContent || tempElement.innerText || '';
  };

  const fullText = getTextContent(sanitizedContent);
  const truncatedText = fullText.slice(0, limit);

  const readMoreMessage = intl.formatMessage({ id: "ListingDetails.readMoreMessage" });
  const readLessMessage = intl.formatMessage({ id: "ListingDetails.readLessMessage" });

  return (
    <div className={css.description}>
      <span>
        {isExpanded || fullText.length <= limit ? (
          <span dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
        ) : (
          `${truncatedText}...`
        )}
        {fullText.length > limit && (
          <span onClick={toggleContent} className={isExpanded ? css.readLess : ''}>
            {isExpanded ? readLessMessage : readMoreMessage}
          </span>
        )}
      </span>
    </div>
  );
};

const ListingBannerDetails = ({
  listing,
  intl,
  handleOrderSubmit,
  startTrailer = false,
  handleWishList,
  currentUser,
  orderLength,
  queryID,
  onManageDisableScrolling,
  isAssetsReady
}) => {
  
  const [showSubtitles, setShowSubTitles] = useState(false);
  const [showTrailer, setShowTrailer] = useState(startTrailer);
  const { author, attributes } = listing || {};
  const [playing, setPlaying] = useState(true);
  const { title, publicData, price, description } = attributes || {};
  const {
    subtitle_selection,
    rating,
    marketingTrailer,
    primary_genre = [],
    episodeCount,
    listingType,
    marketingPoster,
    marketingBanner,
    listingRating,
    series_primary_genre = [],
    filmVideo
  } = publicData;
  const listingId = listing?.id?.uuid || null;
  const bannerUrl = `${sourceUrl}/${marketingBanner?.key}`;
  const deviceWidth = getCurrentDeviceWidth();
  const { wishlistData = {} } = currentUser?.attributes.profile.publicData || {};
  const showWishlistButton = !currentUser ? true : currentUser?.id?.uuid !== author?.id?.uuid;

  // Inline style for dynamic background image
  const backgroundStyle = {
    backgroundImage: deviceWidth > 767 ? ` url(${bannerUrl})` : `linear-gradient(180deg, rgba(0, 0, 0, 0.00) 29.41%, #000 75.78%), url(${bannerUrl})`,
    // backgroundSize: 'cover',
    // backgroundPosition: 'center',
  };

  const primaryGenereMaybe =
    Array.isArray(primary_genre) && primary_genre.length > 0 ? (
      <span>{primary_genre.map(g => formatLabel(g)).join(', ')}</span>
    ) : Array.isArray(series_primary_genre) && series_primary_genre.length > 0 ? (
      <span>{series_primary_genre.map(g => formatLabel(g)).join(', ')}</span>
    ) : null;

  const ratingMaybe = rating ? <span> {rating} </span> : '';

  const buyButtonText = intl.formatMessage({
    id:
      listingType == FILM_PRODUCTS
        ? 'ListingDetails.buyButtonText'
        : 'ListingDetails.buySeriesButtonText',
  });
  const priceMaybe =
    price && price.amount && price.currency
      ? <span>{buyButtonText}: <b>{formatMoney(intl, price)}</b></span>
      : null;

  const handleWatchTrailer = () => {
    setShowTrailer(true);
  };

  const subtitlesText = intl.formatMessage({ id: 'ListingDetails.subtitles' });
  const trailerMissingText = intl.formatMessage({ id: 'ListingDetails.trailerMissing' });
  const watchTrailerButtonText = intl.formatMessage({
    id: 'ListingDetails.watchTrailerButtonText',
  });
  const addToWishListButtonText =
    Object.keys(wishlistData).length > 0 && wishlistData[listingType]?.includes(listingId)
      ? <><IconCollection icon="icon-wishlist" />
        &nbsp; {intl.formatMessage({ id: 'ListingDetails.addedToWishListButtonText' })}
      </>
      : <>
        <IconCollection icon="plus-icon" />
        &nbsp; {intl.formatMessage({ id: 'ListingDetails.addToWishListButtonText' })}
      </>;

  const scrollToReviewSection = (id) => {
    typeof window !== undefined &&
      window.document
        .getElementById(id)
        .scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
  };

  return (
    <div className={css.container}>
      <div className={css.overlay} style={backgroundStyle}></div>
      <div className={css.content}>
        <div className={css.leftSection}>
          <ResponsiveImage
            gumletImage={{ sourceUrl, key: marketingPoster?.key }}
            alt="Movie Poster"
            className={css.poster}
          />
        </div>
        <div className={css.rightSection}>
          <h2 className={css.title}>
            {title
              .split(' ')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ')}
          </h2>
          {listingRating ? (
            <div className={css.reviews} onClick={() => {
              scrollToReviewSection('review_start')
            }}>
              {listingRating ? listingRating : null}
              <StarRatings
                svgIconViewBox="0 0 40 37"
                svgIconPath="M20 0L26.113 11.5862L39.0211 13.8197L29.891 23.2138L31.7557 36.1803L20 30.4L8.2443 36.1803L10.109 23.2138L0.97887 13.8197L13.887 11.5862L20 0Z"
                starRatedColor="#ffb802"
                // starEmptyColor="#ffffff"
                rating={listingRating || 0}
                starDimension="25px"
                starSpacing="2px"
              />
            </div>
          ) : null}
          <div className={css.movieDetails}>
            <div className={css.primaryGenere}>
              {listingType == FILM_PRODUCTS ? FILM_LABEL : SERIES_LABEL}&nbsp;|&nbsp;
              {primaryGenereMaybe}&nbsp;|&nbsp;
              {formatLabel(subtitle_selection && subtitle_selection[0])}&nbsp;|&nbsp;
              {ratingMaybe}&nbsp;|&nbsp;
              {episodeCount ? <span>{episodeCount} Episodes |&nbsp;</span> : <span>{formatCardDuration(filmVideo?.duration)}&nbsp;|&nbsp;</span>}
              <span>
                <IconCollection icon="cc-icon" />
              </span>
              &nbsp;|&nbsp;
              <div className={css.subtitleContainer} onMouseEnter={() => (!showSubtitles ? setShowSubTitles(true) : null)}
                onMouseLeave={() => (!!showSubtitles ? setShowSubTitles(false) : null)}>
                <p
                  className={css.subtitleHeading}
                  onMouseEnter={() => (!showSubtitles ? setShowSubTitles(true) : null)}
                  onMouseLeave={() => (!!showSubtitles ? setShowSubTitles(false) : null)}
                >
                  &nbsp;{subtitlesText}
                  &nbsp;
                  <IconCollection icon="icon-arrow-down" />
                </p>
                <ul className={classNames(css.subtitles, showSubtitles ? css.show : '')}>
                  {(subtitle_selection || []).map(st => (
                    <li key={st.key}>{formatLabel(st)}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div className={css.trailerWrapper}>
            <Modal
              className={css.trailerModal}
              onManageDisableScrolling={onManageDisableScrolling}
              isOpen={showTrailer}
              onClose={() => {
                setPlaying(false)
                setShowTrailer(false)
              }}
            >
              {marketingTrailer && marketingTrailer.playback_url ? (
                <div className={css.trailerContainer}>
                  <VideoPlayer
                    videoUrl={marketingTrailer.playback_url}
                    subtitle={marketingTrailer.subtitle}
                    lightbox={false}
                    autoPlay={true}
                    playing={playing}
                    setPlaying={setPlaying}
                    gumletImage={{
                      key: marketingBanner?.key,
                      sourceUrl: process.env.REACT_APP_GUMLET_SOURCE_URL,
                      styles: {
                        width: '100%',
                        height: '100%',
                        borderRadius: '10px'
                      }
                    }}
                  />
                </div>
              ) : (
                <div className={css.missingTrailer}>{trailerMissingText}</div>
              )}
            </Modal>
          </div>
          <div className={css.actions}>
            {orderLength > 0 ? (
              <NamedLink name="MyLibraryPage" params={{ tab: 'purchases' }} className={css.buyButton}>
                <span>{intl.formatMessage({ id: 'ListingDetails.purchasedButtonText' })}</span>
              </NamedLink>
            ) : (
              <>
                <Button
                  data-tooltip-id="buy-button-tooltip"
                  className={css.buyButton}
                  disabled={!isAssetsReady}
                  onClick={() => {
                    handleOrderSubmit({});
                  }}
                >
                  <span>{priceMaybe}</span>
                </Button>
                {!isAssetsReady ? <Tooltip
                  id="buy-button-tooltip"
                  place="top"
                  content={intl.formatMessage({ id: 'ListingDetails.assetsNotReady' })}
                /> : null}
              </>

            )}
            <Button className={css.watchTrailerButton} onClick={handleWatchTrailer}>
              <span>
                <IconCollection icon="icon-watch-trailer" />
                {watchTrailerButtonText}
              </span>
            </Button>
            {showWishlistButton ? (
              <Button
                type="button"
                className={css.wishlistButton}
                onClick={() => {
                  handleWishList();
                }}
              >

                <>{addToWishListButtonText}</>
              </Button>
            ) : null}
          </div>
          <div>
            <ExpandableDescription description={description} intl={intl} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingBannerDetails;
