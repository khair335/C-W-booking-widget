import React, { useEffect, useRef } from 'react';
import { CustomArrow, ListingCard, NamedLink } from '../../components';
import { FormattedMessage } from 'react-intl';
import IconCollection from '../../components/IconCollection/IconCollection';
import css from './ProfilePage.module.css';
import Slider from "react-slick";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation,  Mousewheel, Keyboard } from 'swiper/modules';


const draftId = '00000000-0000-0000-0000-000000000000';
const draftSlug = 'draft';



const ContentSection = ({ title, content = [], listingType, id, formattedMessage, fetchNext = () => { }, showExtraTile = true, secondParentRef, secondSliderRef }) => {

  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [slideCount, setSlideCount] = React.useState(0);

  const handleBeforeChange = (current, next) => {
    setCurrentSlide(next);
  }

  const handleAfterChange = (current, next) => {
    setCurrentSlide(current);

    if (next == undefined) {
      fetchNext();
    }
  }

  const contentLength = content.length + 1
  const settings = {
    className: 'slider variable-width',
    dots: false,
    infinite: false,
    centerMode: false,
    slidesToShow: 1,
    slidesToScroll: 1,
    variableWidth: true,
    swipe: false,
    cssEase: "linear",
    prevArrow: <CustomArrow direction="prev" disabled={currentSlide === 0} />,
    nextArrow: <CustomArrow direction="next" disabled={currentSlide >= slideCount - 4} />, // Assuming 4 visible items
    beforeChange: (current, next) => handleBeforeChange(current, next),
    afterChange: (current, next) => handleAfterChange(current, next),
    onInit: () => setSlideCount(contentLength),
    responsive: [
      {
        breakpoint: 767,
        settings: {
          slidesToShow: 1,
          arrows: false,
          infinite: false,
          swipe: true,
        },
      },
    ],
  };

  return content?.length || showExtraTile ? (
    <div id={id} className={css.sliderContainer}>
      <h4 className={css.featuresTitle}>{title}</h4>
      <div className={css.sliderContainer} ref={secondParentRef}>
        <Swiper
          cssMode={true}
          navigation={true}
          pagination={true}
          mousewheel={true}
          keyboard={true}
          dots={false}
          slidesPerView={'auto'}
          modules={[Navigation, Mousewheel, Keyboard]}
          className="mySwiper"
        >

          {showExtraTile && listingType ? (
            <SwiperSlide style={{ width: 295 }}>
              <NamedLink
                name="EditListingPage"
                params={{
                  id: draftId,
                  slug: draftSlug,
                  type: 'new',
                  tab: 'details',
                  listingType,
                }}
                style={{ width: 295 }}
                className={css.uploadLink}
              >
                <span className={css.uploadLinkText}>
                  {formattedMessage}
                </span>
                <IconCollection icon="icon-plus" />
              </NamedLink>
            </SwiperSlide>
          ) : null}
          {content.map(l => (
            <SwiperSlide style={{ width: 295 }} key={l.id.uuid}>

              <div style={{ width: 295 }} key={l.id.uuid}>
                <ListingCard listing={l} showAuthorInfo={false} showDetails={true} />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  ) : null;
};

export default ContentSection;
