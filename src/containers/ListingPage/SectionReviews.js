import React from 'react';
import { FormattedMessage } from '../../util/reactIntl';
import { Heading, H2, Reviews } from '../../components';

import css from './ListingPage.module.css';
import IconCollection from '../../components/IconCollection/IconCollection';

const SectionReviews = props => {
  const { reviews, fetchReviewsError, publicData } = props;
  const { listingRating = 0 } = publicData || {};

  return (
    <section id='review_start' className={css.sectionReviews}>
      {reviews.length > 0 && <h3 className={css.rating}>
        <IconCollection icon="icon-review-single" />
        {listingRating}/5
      </h3>}
      <Heading as="h2" rootClassName={css.sectionHeadingWithExtraMargin}>
        <FormattedMessage id="ListingPage.reviewsTitle" values={{ count: reviews.length }} />
      </Heading>
      <div className={css.ratingFilters}>
        <span className={css.recent}><FormattedMessage id="ListingPage.recent" /></span>
        <span><IconCollection icon="icon-review-five" /></span>
        <span><IconCollection icon="icon-review-four" /></span>
        <span><IconCollection icon="icon-review-three" /></span>
        <span><IconCollection icon="icon-review-two" /></span>
        <span><IconCollection icon="icon-review-one" /></span>
      </div>
      {fetchReviewsError ? (
        <H2 className={css.errorText}>
          <FormattedMessage id="ListingPage.reviewsError" />
        </H2>
      ) : null}
      {reviews.length ? <Reviews reviews={reviews} /> : <FormattedMessage id="ListingPage.notAnyReview" />}
    </section>
  );
};

export default SectionReviews;
