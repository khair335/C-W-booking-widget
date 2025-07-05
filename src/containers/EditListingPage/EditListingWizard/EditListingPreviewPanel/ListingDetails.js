import React, { useState } from 'react';
import css from './ListingDetails.module.css';
import classNames from 'classnames';
import { formatMoney } from '../../../../util/currency';
import ReactPlayer from 'react-player';
import { manageDisableScrolling } from '../../../../ducks/ui.duck';

import { Button, CustomVideoPlayer, Modal, ResponsiveImage, VideoPlayer } from '../../../../components';
import IconCollection from '../../../../components/IconCollection/IconCollection';
import { formatCardDuration, formatLabel } from '../../../../util/dataExtractor';
import { FILM_LABEL, FILM_PRODUCTS, SERIES_LABEL } from '../../../../util/types';
import { getCurrentDeviceWidth } from '../../../../components/CurrentViewPort/CurrentViewPort';
import { GUMLET_PROCESSING_STATUS } from '../../../../constants';


const sourceUrl = process.env.REACT_APP_GUMLET_SOURCE_URL;

const ExpandableDescription = ({ description, limit = 280, intl }) => {

  if (typeof window == "undefined") {
    return null;
  }
  const DOMPurify = require('dompurify');

  const [isExpanded, setIsExpanded] = useState(false);
  const sanitizedContent = DOMPurify.sanitize(description);

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
          `${truncatedText}... `
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

const ListingDetails = ({ listing, intl, onManageDisableScrolling }) => {
  const [showSubtitles, setShowSubTitles] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [playing, setPlaying] = useState(true);

  const { title, publicData, price, description } = listing.attributes;
  const {
    subtitle_selection,
    primary_genre,
    rating,
    marketingTrailer,
    marketingBanner,
    marketingPoster,
    listingType,
    filmVideo,
    episodeCount
  } = publicData;
  const deviceWidth = getCurrentDeviceWidth();
  const bannerUrl = `${sourceUrl}/${marketingBanner?.key}`;

  // Inline style for dynamic background image
  const backgroundStyle = {
    backgroundImage: deviceWidth > 767 ? `url(${bannerUrl})` : `linear-gradient(180deg, rgba(0, 0, 0, 0.00) 29.41%, #000 75.78%), url(${bannerUrl})`,
    // backgroundSize: 'cover',
    // backgroundPosition: 'center'
  };

  const primaryGenereMaybe = Array.isArray(primary_genre)
    ? <span>{primary_genre.map(g => formatLabel(g)).join(', ')} </span>
    : primary_genre ? <span>{formatLabel(primary_genre)}  </span> : '';

  const ratingMaybe = rating ? <span>  {rating} &nbsp;|&nbsp; </span> : '';

  const buyButtonText = intl.formatMessage({
    id:
      listingType == FILM_PRODUCTS
        ? 'ListingDetails.buyButtonText'
        : 'ListingDetails.buySeriesButtonText',
  });
  const priceMaybe = price && price.amount && price.currency
    ? <span>{buyButtonText}: <b>{formatMoney(intl, price)}</b></span>
    : null;

  const handleWatchTrailer = () => {
    //  // Enter fullscreen mode for the trailer
    //  if (trailerRef && trailerRef.current) {
    //   if (trailerRef.current.requestFullscreen) {
    //     trailerRef.current.requestFullscreen();
    //   } else if (trailerRef.current.mozRequestFullScreen) { /* Firefox */
    //     trailerRef.current.mozRequestFullScreen();
    //   } else if (trailerRef.current.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
    //     trailerRef.current.webkitRequestFullscreen();
    //   } else if (trailerRef.current.msRequestFullscreen) { /* IE/Edge */
    //     trailerRef.current.msRequestFullscreen();
    //   }
    // }
    setShowTrailer(true); // Show the player
  };

  const subtitlesText = intl.formatMessage({ id: "ListingDetails.subtitles" })
  const trailerMissingText = intl.formatMessage({ id: "ListingDetails.trailerMissing" })
  const trailerProcessingText = intl.formatMessage({ id: "ListingDetails.trailerProcessing" });
  const watchTrailerButtonText = intl.formatMessage({ id: "ListingDetails.watchTrailerButtonText" });
  const addToWishListButtonText = intl.formatMessage({ id: "ListingDetails.addedToWishListButtonText" });
  const reviewStarText = intl.formatMessage({ id: "ListingDetails.reviewStar" });
  // const ccText = intl.formatMessage({ id: "ListingDetails.ccText" });
  const ccText = <IconCollection icon="cc-icon" />


  return (
    <div className={css.container} style={{ zIndex: showTrailer ? 1000 : 3 }} >
      <div className={css.overlay} style={backgroundStyle}></div>
      <div className={css.content}>
        <div className={css.leftSection}>
          <ResponsiveImage gumletImage={{ sourceUrl, key: marketingPoster?.key }} alt="Movie Poster" className={css.poster} />
        </div>
        <div className={css.rightSection}>
          <h2 className={css.title}> {title
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')}</h2>
          <div>
            {/* <span>0.0 <IconCollection icon="icon-star" /></span> */}
          </div>
          <div className={css.movieDetails}>
            <div className={css.primaryGenere}>
              {listingType == FILM_PRODUCTS ? FILM_LABEL : SERIES_LABEL}&nbsp;|&nbsp;
              {primaryGenereMaybe}&nbsp;|&nbsp;
              {formatLabel(subtitle_selection && subtitle_selection[0])}&nbsp;|&nbsp;
              {ratingMaybe}
              {episodeCount ? <span>{episodeCount} Episodes |&nbsp;</span> : <span>{formatCardDuration(filmVideo?.duration)}&nbsp;|&nbsp;</span>}
              <span className={css.ccText}>{ccText}</span> &nbsp;|&nbsp;
              <div className={css.subtitleContainer}>
                <p
                  className={css.subtitleHeading}
                  onMouseEnter={() => !showSubtitles ? setShowSubTitles(true) : null}
                  onMouseLeave={() => !!showSubtitles ? setShowSubTitles(false) : null}
                >
                  &nbsp;{subtitlesText}
                  &nbsp;<IconCollection icon="icon-arrow-down" />
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
            <Modal className={css.trailerModal} onManageDisableScrolling={onManageDisableScrolling} isOpen={showTrailer}
              onClose={() => { setPlaying(false), setShowTrailer(false) }}>
              {marketingTrailer && marketingTrailer.playback_url && !GUMLET_PROCESSING_STATUS.includes(marketingTrailer.status)
                ? (<div className={css.trailerContainer}>
                  <VideoPlayer
                    videoUrl={marketingTrailer.playback_url}
                    subtitle={marketingTrailer.subtitle}
                    thumbnailUrl={marketingBanner?.url}
                    lightbox={false}
                    autoPlay={true}
                    playing={playing}
                    setPlaying={setPlaying}
                  />
                </div>
                ) : <div className={css.missingTrailer}>{
                  GUMLET_PROCESSING_STATUS.includes(marketingTrailer?.status) ? trailerProcessingText : trailerMissingText
                }</div>}
            </Modal>
          </div>
          <div className={css.actions}>
            <Button className={css.buyButton}><span>{priceMaybe}</span></Button>
            <Button
              className={css.watchTrailerButton}
              onClick={handleWatchTrailer}
            ><span><IconCollection icon="icon-watch-trailer" />&nbsp;&nbsp;{watchTrailerButtonText}</span></Button>
            <Button className={css.wishlistButton}>
              <IconCollection icon="icon-wishlist" />&nbsp;&nbsp;
              <span>{addToWishListButtonText}</span>
            </Button>
          </div>
          <div>
            <ExpandableDescription description={description} intl={intl} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetails;
