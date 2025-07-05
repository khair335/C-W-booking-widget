
import React from 'react';
import { usePagination } from 'react-instantsearch';
import { generatePagination } from '../../../util/data';
import PaginationArrow from './PaginationArrow';
import PaginationNumber from './PaginationNumber';
import css from './Pagination.module.css'

function CustomPagination(props) {
  const {
    currentRefinement,
    nbPages,
    pages,
    refine,
  } = usePagination(props);

  const allPages = generatePagination(currentRefinement, pages.length);

  return <div className={css.paginationContainer}>
    <PaginationArrow
      onRefine={refine}
      currentPage={currentRefinement}
      direction="left"
      isDisabled={currentRefinement <= 0}
    />

    <div className={css.paginationNumbers}>
      {allPages.map((page, index) => {
        let position;

        if (index === 0) {
          position = 'first';
        } else if (index === allPages.length - 1) {
          position = 'last';
        } else if (allPages.length === 1) {
          position = 'single';
        } else if (page === '...') {
          position = 'middle';
        };
      
       
        return (
          <PaginationNumber
            key={page}
            onRefine={refine}
            page={page}
            position={position}
            isActive={currentRefinement === page}
          />
        );
      })}
    </div>

    <PaginationArrow
      onRefine={refine}
      currentPage={currentRefinement}
      direction="right"
      isDisabled={currentRefinement >= (nbPages - 1)}
    />
  </div>;
};

export default CustomPagination;