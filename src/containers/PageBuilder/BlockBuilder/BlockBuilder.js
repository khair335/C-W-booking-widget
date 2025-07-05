import React, { useEffect, useState, useRef } from 'react';
import { arrayOf, func, node, oneOf, shape, string } from 'prop-types';
import css from './BlockBuilder.module.css';
// Block components
import BlockDefault from './BlockDefault';
import BlockFooter from './BlockFooter';
import BlockSocialMediaLink from './BlockSocialMediaLink';
import { CustomArrow, NamedLink } from '../../../components';
import classNames from 'classnames';
import Slider from "react-slick";
import { CREATOR_USER_TYPE } from '../../../util/types';
import Field from '../Field';
import IconCollection from '../../../components/IconCollection/IconCollection';
import { useSelector } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Mousewheel, Keyboard } from 'swiper/modules';


///////////////////////////////////////////
// Mapping of block types and components //
///////////////////////////////////////////

const defaultBlockComponents = {
  defaultBlock: { component: BlockDefault },
  footerBlock: { component: BlockFooter },
  socialMediaLink: { component: BlockSocialMediaLink },
};

////////////////////
// Blocks builder //
////////////////////

const BlockBuilder = props => {
  const { blocks, sectionId, options, ...otherProps } = props;

  // Extract block & field component mappings from props
  // If external mapping has been included for fields
  // E.g. { h1: { component: MyAwesomeHeader } }
  const { blockComponents, fieldComponents } = options || {};
  const blockOptionsMaybe = fieldComponents ? { options: { fieldComponents } } : {};

  // If there's no block, we can't render the correct block component
  if (!blocks || blocks.length === 0) {
    return null;
  }

  // Selection of Block components
  // Combine component-mapping from props together with the default one:
  const components = { ...defaultBlockComponents, ...blockComponents };

  function renderBlocks(blocks, components, sectionId, blockOptionsMaybe, otherProps, indices) {
    return blocks.map((block, index) => {
      if (!indices.includes(index)) return null;

      const config = components[block.blockType];
      const Block = config?.component;
      const blockId = block.blockId || `${sectionId}-block-${index + 1}`;

      return (
        <div className={css.card} key={`${blockId}_i${index}`}>
          <Block
            {...block}
            blockId={blockId}
            {...blockOptionsMaybe}
            {...otherProps}
          />
        </div>
      );
    });
  }

  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [slideCount, setSlideCount] = React.useState(0);
  const [screenWidth, setScreenWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);
  const state = useSelector(state => state);
  const { currentUser } = state.user;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setScreenWidth(window.innerWidth);

    };

    window.addEventListener('resize', handleResize);

    // Initial log
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    setSlideCount(blocks.length);
    setCurrentSlide(0);
  }, [blocks]);

  const firstSliderRef = useRef();
  const secondSliderRef = useRef();
  const thirdSliderRef = useRef();

  const sliderRefs = [firstSliderRef, secondSliderRef, thirdSliderRef]; // Add more refs as needed

  // Create separate parent refs for each slider
  const firstParentRef = useRef(null);
  const secondParentRef = useRef(null);
  const thirdParentRef = useRef(null);
  const parentRefs = [firstParentRef, secondParentRef, thirdParentRef];

  useEffect(() => {
    // Set up scroll handlers for each parent container
    parentRefs.forEach((parentRef, index) => {
      if (!parentRef.current) return;

      const handleScroll = e => {
        // Only handle horizontal scrolling gestures
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
          e.preventDefault(); // Prevent default scroll behavior

          // Get the element that triggered the event
          const target = e.target;

          // Get corresponding slider ref for this parent
          const sliderRef = sliderRefs[index];

          if (sliderRef?.current && sliderRef.current.innerSlider.list.contains(target)) {
            if (e.deltaX > 0) {
              sliderRef.current?.slickNext();
            } else if (e.deltaX < 0) {
              sliderRef.current?.slickPrev();
            }
          }
        }
      };

      const element = parentRef.current;
      element.addEventListener("wheel", handleScroll, { passive: false });

      return () => {
        element.removeEventListener("wheel", handleScroll);
      };
    });
  }, []);

  const settings = {
    className: "slider variable-width",
    dots: true,
    infinite: false,
    centerMode: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    variableWidth: false,
    arrows: false,
    centerPadding: "0px",
    cssEase: "linear",
  };

  const settingsCarousel = {
    className: "slider variable-width",
    dots: false,
    infinite: false,
    centerMode: false,
    slidesToShow: 1,
    slidesToScroll: 1,
    variableWidth: true,
    swipeToSlide: false,
    swipe: false,
    cssEase: "linear",
    prevArrow: <CustomArrow direction="prev" disabled={currentSlide === 0} />,
    nextArrow: <CustomArrow direction="next" disabled={currentSlide >= slideCount - 4} />, // Assuming 4 visible items
    beforeChange: (current, next) => setCurrentSlide(next),
    afterChange: current => setCurrentSlide(current),
    onInit: () => setSlideCount(blocks.length),
    responsive: [
      {
        breakpoint: 1023,
        settings: {
          slidesToShow: 1,
          arrows: false,
          swipe: true,
          swipeToSlide: true,
        },
      },
    ],
  };




  const [activeIndex, setActiveIndex] = useState(null);
  const accordionRefs = useRef([]);

  const handleAccordionClick = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <>
      {
        sectionId == "reviews" ?
          <div>
            <div className={classNames(css.reviews, css.reviewsDesktop)} style={{ flexWrap: blocks.length > 5 ? 'wrap' : 'nowrap' }}>
              {renderBlocks(blocks, components, sectionId, blockOptionsMaybe, otherProps, [0])}
              <div className={css.reviews_Group}>
                {renderBlocks(blocks, components, sectionId, blockOptionsMaybe, otherProps, [1, 2])}
              </div>
              {renderBlocks(blocks, components, sectionId, blockOptionsMaybe, otherProps, [3, 4])}

            </div>
            <div className={css.reviewsMobile}>
              <div className={css.sliderContainer} ref={firstParentRef}>
                <Slider {...settings} ref={firstSliderRef}>
                  {blocks.map((block, index) => {
                    const config = components[block.blockType];
                    const Block = config?.component;
                    const blockId = block.blockId || `${sectionId}-block-${index + 1}`;

                    if (Block) {
                      return (
                        <div className={css.card}>

                          <Block
                            key={`${blockId}_i${index}`}
                            {...block}
                            blockId={blockId}
                            {...blockOptionsMaybe}
                            {...otherProps}
                          />
                        </div>
                      );
                    } else {
                      // If the block type is unknown, the app can't know what to render
                      console.warn(`Unknown block type (${block.blockType}) detected inside (${sectionId}).`);
                      return null;
                    }
                  })}

                </Slider>

              </div>
            </div>
            {(currentUser && currentUser.id) ? <NamedLink name="ManageListingsPage" className={css.button}><span><FormattedMessage id="LandingPage.joinRabel" /></span></NamedLink> : <NamedLink name="SignupForUserTypePage" params={{ userType: CREATOR_USER_TYPE }} className={css.button}><span><FormattedMessage id="LandingPage.joinRabel" /></span></NamedLink>}
          </div> :
          screenWidth < 768 && (sectionId == "earn-what-your-should" || sectionId == "grid-column-3" || sectionId == "grid-column-2") ? <div className={css.EarnSliderContainer} ref={secondParentRef}>
            <Slider {...settings} ref={secondSliderRef}>
              {blocks.map((block, index) => {
                const config = components[block.blockType];
                const Block = config?.component;
                const blockId = block.blockId || `${sectionId}-block-${index + 1}`;
                return (
                  <div className={css.cardWrapper}>
                    <Block
                      key={`${blockId}_i${index}`}
                      {...block}
                      blockId={blockId}
                      {...blockOptionsMaybe}
                      {...otherProps}
                    />
                  </div>
                );
              })}
            </Slider>
          </div>
            :
            sectionId == "faq-section" ? <>
              <div className={css.faqContainer}>
                <div id='accordion' className={css.accordionWrapper}>
                  {
                    blocks.map((block, index) => {
                      const config = components[block.blockType];
                      const Block = config?.component;
                      const blockId = block.blockId || `${sectionId}-block-${index + 1}`;

                      if (Block) {
                        return (
                          <div
                            key={`${blockId}_i${index}`}
                            className={css.accordionItem}
                            onClick={() => handleAccordionClick(index)}
                            ref={el => accordionRefs.current[index] = el}
                          >
                            <div className={css.accordionHeader}>
                              <Field data={block.title} options={block} />
                              <div>
                                <IconCollection icon="icon-arrow-down" />
                              </div>
                            </div>
                            <div
                              className={classNames(css.accordionContent, {
                                [css.active]: activeIndex === index
                              })}
                              style={{
                                maxHeight: activeIndex === index ? `auto` : '0'
                              }}
                            >
                              <Block
                                {...block}
                                blockId={blockId}
                                {...blockOptionsMaybe}
                                {...otherProps}
                              />
                            </div>
                          </div>
                        );
                      } else {
                        // If the block type is unknown, the app can't know what to render
                        console.warn(`Unknown block type (${block.blockType}) detected inside (${sectionId}).`);
                        return null;
                      }
                    })}
                </div>
              </div>
            </>
              : (sectionId == "content-carousel" || sectionId == "creator-carousel") ? <div ref={thirdParentRef}>
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
                  {blocks && blocks.length > 0 ? blocks.map((block, index) => {
                    const config = components[block.blockType];
                    const Block = config?.component;
                    const blockId = block.blockId || `${sectionId}-block-${index + 1}`;

                    if (Block) {
                      return (
                        <SwiperSlide style={{ width: 295 }}>
                          <div style={{ width: 295 }} className={css.Listingcard}>
                            <Block
                              key={`${blockId}_i${index}`}
                              {...block}
                              blockId={blockId}
                              {...blockOptionsMaybe}
                              {...otherProps}
                            />
                          </div>
                        </SwiperSlide>
                      );
                    } else {
                      // If the block type is unknown, the app can't know what to render
                      console.warn(`Unknown block type (${block.blockType}) detected inside (${sectionId}).`);
                      return null;
                    }
                  }) : <div>
                    <h4>No blocks found</h4>
                  </div>}
                </Swiper>
              </div>
                :
                blocks.map((block, index) => {
                  const config = components[block.blockType];
                  const Block = config?.component;
                  const blockId = block.blockId || `${sectionId}-block-${index + 1}`;

                  if (Block) {
                    return (
                      <Block
                        key={`${blockId}_i${index}`}
                        {...block}
                        blockId={blockId}
                        {...blockOptionsMaybe}
                        {...otherProps}
                      />
                    );
                  } else {
                    // If the block type is unknown, the app can't know what to render
                    console.warn(`Unknown block type (${block.blockType}) detected inside (${sectionId}).`);
                    return null;
                  }
                })}
    </>
  );
};

const propTypeBlock = shape({
  blockId: string,
  blockName: string,
  blockType: oneOf(['defaultBlock', 'footerBlock', 'socialMediaLink']).isRequired,
  // Plus all kind of unknown fields.
  // BlockBuilder doesn't really need to care about those
});

const propTypeOption = shape({
  fieldComponents: shape({ component: node, pickValidProps: func }),
  blockComponents: shape({ component: node }),
});

BlockBuilder.defaultProps = {
  blocks: [],
  options: null,
  responsiveImageSizes: null,
  className: null,
  rootClassName: null,
  mediaClassName: null,
  textClassName: null,
  ctaButtonClass: null,
};

BlockBuilder.propTypes = {
  blocks: arrayOf(propTypeBlock),
  options: propTypeOption,
  responsiveImageSizes: string,
  className: string,
  rootClassName: string,
  mediaClassName: string,
  textClassName: string,
  ctaButtonClass: string,
};

export default BlockBuilder;
