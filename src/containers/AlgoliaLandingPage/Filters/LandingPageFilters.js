import React, { useEffect, useRef, useState } from 'react';
import {
  LISTING_CATEGORY_FILTER,
  PRIMARY_GENRE_FILTER,
  RECENTLY_ADDED,
  TRENDING_NOW,
} from '../../../constants';
import CategoryFilterListings from './CategoryFilterListings';
import css from './Filters.module.css';
import GenreFilterListings from './GenreFilterListings';
import { useClearRefinements, useRefinementList, useSortBy } from 'react-instantsearch';


const LandingPageFilters = ({ filters, indexName }) => {
  if (!filters || filters.length === 0) {
    console.warn('No filters provided');
    return null;
  }

  const genreRef = useRef();
  const TRENDING_INDEX = `${indexName}_views_desc`;
  const RECENTLY_ADDED_INDEX = `${indexName}_timestamp_desc`;
  const { currentRefinement, options, refine: sortRefine } = useSortBy({
    items: [
      {
        label: TRENDING_NOW,
        value: TRENDING_INDEX,
      },
      {
        label: RECENTLY_ADDED,
        value: RECENTLY_ADDED_INDEX,
      },
    ],
  });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    sortRefine(TRENDING_INDEX)

    // set initial value
    const mediaQueryList = window.matchMedia('(max-width: 767px)');
    setIsMobile(mediaQueryList.matches);

    //watch for updates
    function updateIsMobile(e) {
      setIsMobile(e.matches);
    }
    mediaQueryList.addEventListener('change', updateIsMobile);

    // clean up after ourselves
    return function cleanup() {
      mediaQueryList.removeEventListener('change', updateIsMobile);
    };
  }, []);

  return (
    <div className={css.filters}>
      {filters.map((filter, index) => {
        const { type, attribute, label } = filter;

        // Ensure necessary properties exist before rendering
        if (!type || !attribute) {
          console.log('Invalid filter configuration:', filter);
          return null;
        }

        const { items, refine } = useRefinementList({ attribute });
        const { refine: clearRefine } = useClearRefinements({
          includedAttributes: [attribute],
        });

        // Render based on filter type
        switch (attribute) {
          case LISTING_CATEGORY_FILTER:
            return (
              <div className={css.categoryFilters}>
                <CategoryFilterListings
                  options={options}
                  refine={refine}
                  sortRefine={sortRefine}
                  clearRefine={clearRefine}
                  isMobile={isMobile}
                  resetSelectedGenre={() => genreRef.current.changeSelectedFilter("")}
                />
              </div>
            );

          case PRIMARY_GENRE_FILTER:
            return (
              <div className={css.genreFilters}>
                <GenreFilterListings
                  ref={genreRef}
                  items={items}
                  refine={refine}
                  clearRefine={clearRefine}
                  isMobile={isMobile}
                />
              </div>
            );

          default:
            console.warn(`Unsupported filter type: ${type}`);
            return null;
        }
      })}
    </div>
  );
};
export default LandingPageFilters;
