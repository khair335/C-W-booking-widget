import React from 'react';
import { useClearRefinements } from 'react-instantsearch';
import {
  FILMS,
  LANDING_PAGE_FILTER_TYPES,
  PRIMARY_GENRE_FILTER,
  SERIES
} from '../../../constants';
import CustomFilterListings from './CustomFilterListings';

function CategoryFilterListings({ options, refine, sortRefine, clearRefine, isMobile, resetSelectedGenre }) {
  const { refine: clearGenreRefine } = useClearRefinements({
    includedAttributes: [PRIMARY_GENRE_FILTER],
  });

  const categoryItems = Object.keys(LANDING_PAGE_FILTER_TYPES).map(type => ({
    label: type,
    value: () => {
      const isFilmSeries = [FILMS, SERIES].includes(type);

      clearRefine();
      clearGenreRefine();
      resetSelectedGenre();

      if (isFilmSeries) {
        refine(LANDING_PAGE_FILTER_TYPES[type]);
      } else {
        const refineValue = options.find(elm => elm.label == type)?.value ?? '';
        sortRefine(refineValue);
      }
    },
  }));

  return <CustomFilterListings isMobile={isMobile} items={categoryItems} showUnderLine={true} />;
}

export default CategoryFilterListings;
