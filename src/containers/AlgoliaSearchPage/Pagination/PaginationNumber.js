import React from "react";
import css from './Pagination.module.css';
import classNames from "classnames";

function PaginationNumber({
    page,
    onRefine,
    isActive,
    position,
}) {

    return position === 'middle' ? (
        <div>{page}</div>
    ) : (
        <button
            disabled={isActive}
            className={classNames(css.pageNumber, isActive ? css.active : '')}
            onClick={() => onRefine(page)}
        >
            { page + 1}
        </button>
    );
};

export default PaginationNumber
