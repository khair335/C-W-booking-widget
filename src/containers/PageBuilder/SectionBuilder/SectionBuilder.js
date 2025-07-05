import React from 'react';
import { arrayOf, bool, func, node, oneOf, shape, string } from 'prop-types';
import classNames from 'classnames';

// Section components
import SectionArticle from './SectionArticle';
import SectionCarousel from './SectionCarousel';
import SectionColumns from './SectionColumns';
import SectionFeatures from './SectionFeatures';
import SectionHero from './SectionHero';

// Styles
// Note: these contain
// - shared classes that are passed as defaultClasses
// - dark theme overrides
// TODO: alternatively, we could consider more in-place way of theming components
import css from './SectionBuilder.module.css';
import SectionFooter from './SectionFooter';
import OtherSection from './OtherSections/OtherSection';
import { CREATOR_INDEX, CREATORS_LANDING_PAGE_SECTIONS, CREATORS_PAGE, CREATORS_WITH_SERIES, FILMS_CREATORS_SECTION, FILMS_PAGE, FILMS_PAGE_AUTHENTICATED_SECTIONS, LANDING_PAGE, LANDING_PAGE_AUTHENTICATED_SECTIONS, LISTING_INDEX, NEW_TO_RABEL, NEWLY_RELEASED_FILMS, NEWLY_RELEASED_SERIES, POPULAR_CREATORS, SERIES_PAGE, SERIES_PAGE_AUTHENTICATED_SECTIONS, TRENDING_CREATORS, TRENDING_FILMS, TRENDING_SERIES_CONTENT } from '../../../constants';
import { useSelector } from 'react-redux';
import AlgoliaLandingPage from '../../AlgoliaLandingPage/AlgoliaLandingPage';

// These are shared classes.
// Use these to have consistent styles between different section components
// E.g. share the same title styles
const DEFAULT_CLASSES = {
  sectionDetails: css.sectionDetails,
  title: css.title,
  description: css.description,
  ctaButton: css.ctaButton,
  blockContainer: css.blockContainer,
};

/////////////////////////////////////////////
// Mapping of section types and components //
/////////////////////////////////////////////

const defaultSectionComponents = {
  article: { component: SectionArticle },
  carousel: { component: SectionCarousel },
  columns: { component: SectionColumns },
  features: { component: SectionFeatures },
  footer: { component: SectionFooter },
  hero: { component: SectionHero },
};

//////////////////////
// Section builder //
//////////////////////

const SectionBuilder = props => {
  const { currentUser } = useSelector(state => state.user);
  const { sections, options } = props;
  const { sectionComponents = {}, isAuthenticated, isInsideContainer, pageType, ...otherOption } =
    options || {};

  // If there's no sections, we can't render the correct section component
  if (!sections || sections.length === 0) {
    return null;
  }

  // Selection of Section components
  const components = { ...defaultSectionComponents, ...sectionComponents };
  const getComponent = sectionType => {
    const config = components[sectionType];
    return config?.component;
  };

  // Generate unique ids for sections if operator has managed to create duplicates
  // E.g. "foobar", "foobar1", and "foobar2"
  const sectionIds = [];
  const getUniqueSectionId = (sectionId, index) => {
    const candidate = sectionId || `section-${index + 1}`;
    if (sectionIds.includes(candidate)) {
      let sequentialCandidate = `${candidate}1`;
      for (let i = 2; sectionIds.includes(sequentialCandidate); i++) {
        sequentialCandidate = `${candidate}${i}`;
      }
      return getUniqueSectionId(sequentialCandidate, index);
    } else {
      sectionIds.push(candidate);
      return candidate;
    }
  };

  return (
    <>
      {sections.map((section, index) => {
        const Section = getComponent(section.sectionType);
        // If the default "dark" theme should be applied (when text color is white).
        // By default, this information is stored to customAppearance field
        const isDarkTheme =
          section?.appearance?.fieldType === 'customAppearance' &&
          section?.appearance?.textColor === 'white';
        const classes = classNames({ [css.darkTheme]: isDarkTheme });
        const sectionId = getUniqueSectionId(section.sectionId, index);

        // NOTE: Uncomment this when you want to show For You section based on the
        // user's preferences which we are tracking.
        // Render AlgoliaLandingPage if conditions are met
        
        // Define section groups for better organization and maintainability
        const ALGOLIA_SECTIONS = [
          TRENDING_SERIES_CONTENT,
          CREATORS_WITH_SERIES,
          NEWLY_RELEASED_SERIES,
          FILMS_CREATORS_SECTION,
          TRENDING_FILMS,
          NEWLY_RELEASED_FILMS,
          POPULAR_CREATORS,
          NEW_TO_RABEL
        ];

        const LISTING_SECTIONS = [TRENDING_SERIES_CONTENT, NEWLY_RELEASED_SERIES, TRENDING_FILMS, NEWLY_RELEASED_FILMS];
        const CREATOR_SECTIONS = [TRENDING_CREATORS, CREATORS_WITH_SERIES, FILMS_CREATORS_SECTION, POPULAR_CREATORS, NEW_TO_RABEL];

        // Check if the section belongs to Algolia-powered content
        const isAlgoliaSection = ALGOLIA_SECTIONS.includes(section.sectionName);

        // Determine if Algolia should be rendered (only for authenticated users, except on landing page)
        const shouldRenderAlgolia = isAlgoliaSection && (isAuthenticated || pageType !== LANDING_PAGE);

        // Determine the Algolia index type (Listing or Creator)
        const algoliaIndexType = LISTING_SECTIONS.includes(section.sectionName)
          ? LISTING_INDEX
          : CREATOR_SECTIONS.includes(section.sectionName)
            ? CREATOR_INDEX
            : null;
        
        // Render AlgoliaLandingPage if applicable
        if (shouldRenderAlgolia) {
          console.log('Rendering AlgoliaLandingPage');
          return (
            <AlgoliaLandingPage
              sectionName={section.sectionName}
              description={section?.description?.content}
              title={section?.title?.content}
              index={algoliaIndexType}
            />
          );
        }

        // Mapping page types to their respective authenticated sections
        const PAGE_AUTH_SECTIONS = {
          [LANDING_PAGE]: LANDING_PAGE_AUTHENTICATED_SECTIONS,
          [SERIES_PAGE]: SERIES_PAGE_AUTHENTICATED_SECTIONS,
          [FILMS_PAGE]: FILMS_PAGE_AUTHENTICATED_SECTIONS,
          [CREATORS_PAGE]: CREATORS_LANDING_PAGE_SECTIONS,
        };

        // Check if the section should be shown based on the page type
        const isIncluded = PAGE_AUTH_SECTIONS[pageType]?.includes(section.sectionName) || false;

        // For landing page, ensure authentication before rendering the section
        const showOtherSections = pageType === LANDING_PAGE ? isIncluded && isAuthenticated : isIncluded;

        // Render OtherSection if applicable
        if (showOtherSections) {
          return (
            <OtherSection
              sectionName={section.sectionName}
              description={section?.description?.content}
              currentUser={currentUser}
              pageType={pageType}
            />
          );
        }


        if (Section) {
          return (
            <Section
              key={`${sectionId}_i${index}`}
              className={classes}
              defaultClasses={DEFAULT_CLASSES}
              isInsideContainer={isInsideContainer}
              options={otherOption}
              {...section}
              sectionId={sectionId}
            />
          );
        } else {
          // If the section type is unknown, the app can't know what to render
          console.warn(
            `Unknown section type (${section.sectionType}) detected using sectionName (${section.sectionName}).`
          );
          return null;
        }
      })}
    </>
  );
};

const propTypeSection = shape({
  sectionId: string,
  sectionName: string,
  sectionType: oneOf(['article', 'carousel', 'columns', 'features', 'hero']).isRequired,
  // Plus all kind of unknown fields.
  // BlockBuilder doesn't really need to care about those
});

const propTypeOption = shape({
  fieldComponents: shape({ component: node, pickValidProps: func }),
  blockComponents: shape({ component: node }),
  sectionComponents: shape({ component: node }),
  // isInsideContainer boolean means that the section is not taking
  // the full viewport width but is run inside some wrapper.
  isInsideContainer: bool,
});

const defaultSections = shape({
  sections: arrayOf(propTypeSection),
  options: propTypeOption,
});

const customSection = shape({
  sectionId: string.isRequired,
  sectionType: string.isRequired,
  // Plus all kind of unknown fields.
  // BlockBuilder doesn't really need to care about those
});
const propTypeOptionForCustomSections = shape({
  fieldComponents: shape({ component: node, pickValidProps: func }),
  blockComponents: shape({ component: node }),
  sectionComponents: shape({ component: node }).isRequired,
  // isInsideContainer boolean means that the section is not taking
  // the full viewport width but is run inside some wrapper.
  isInsideContainer: bool,
});

const customSections = shape({
  sections: arrayOf(customSection),
  options: propTypeOptionForCustomSections.isRequired,
});

SectionBuilder.defaultProps = {
  sections: [],
  options: null,
};

SectionBuilder.propTypes = oneOf([defaultSections, customSections]).isRequired;

export default SectionBuilder;
