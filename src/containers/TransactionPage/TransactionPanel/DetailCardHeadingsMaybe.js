import React from 'react';
import { H4 } from '../../../components';

import css from './TransactionPanel.module.css';
import { formatMoney } from '../../../util/currency';
import { formatCardDuration } from '../../../util/dataExtractor';
import { FormattedMessage } from 'react-intl';
import { types } from '../../../util/sdkLoader';
const { Money } = types

// Functional component as a helper to build detail card headings
const DetailCardHeadingsMaybe = props => {
  const { showDetailCardHeadings, listingTitle, subTitle, showPrice, price, intl, transactionCollection } = props;

  const { filmVideo, episodeCount, episodes = [], unitType } = (transactionCollection && transactionCollection.listingData) || {};

  const duration = filmVideo ? <span>{formatCardDuration(filmVideo?.duration)} </span> : (episodeCount || episodes?.length) ? <span>{episodeCount || episodes?.length} Episodes</span> : null;

  return showDetailCardHeadings ? (
    <div className={css.detailCardHeadings}>
      <H4 as="h2" className={css.detailCardTitle}>
        {listingTitle}
      </H4>
      <div className={css.priceContainer}>
      <span className={css.price}>{price && price instanceof Money ? formatMoney(intl, price) : ''}</span>
        <div className={css.perUnit}>
          <FormattedMessage
            id="CheckoutPageWithInquiryProcess.perUnit"
            values={{ unitType }}
          />
        </div>|
        <span>
          {duration}
        </span>
      </div>
      {subTitle ? <p className={css.detailCardSubtitle}>{subTitle}</p> : null}
    </div>
  ) : null;
};

export default DetailCardHeadingsMaybe;
