import React, { useState } from 'react';
import { useClearRefinements, useRefinementList } from 'react-instantsearch';
import { normalizeText } from '../../../util/data';
import { FormattedMessage } from '../../../util/reactIntl';
import css from './Filters.module.css'; // Import CSS module
import IconCollection from '../../../components/IconCollection/IconCollection';
import { Button } from '../../../components';
import { createResourceLocatorString } from '../../../util/routes';
import { ALL_SEARCH_ID, CREATOR_SEARCH_ID, FACET_CLICKED_EVENT, LISTING_SEARCH_ID } from '../../../constants';
import { omit } from 'lodash';

const removeItemFromString = (str, itemToRemove) => {
    // Split the string into an array of items, trim each, and filter out the item to remove
    return str
      .split(",") // Split by comma
      .map((item) => item.trim()) // Trim extra spaces
      .filter((item) => item !== itemToRemove) // Remove the target item
      .join(", "); // Join back into a string
  };

const transformItems = (items) => {
    return items.sort((a, b) => a.value.localeCompare(b.value));
}

function CustomRefinementList({ attribute, label, history, initialCategory, searchId, routes, queryParams, currentUser, indexName }) {
    const [isOpened, setIsOpened] = useState(true);
    const { items, refine, canRefine, sendEvent } = useRefinementList({ attribute, transformItems });
    const { canRefine: canClear, refine: clearRefine } = useClearRefinements({
        includedAttributes: [attribute],
    });

    const { keywords } = queryParams || {};
    const initialValues = queryParams[attribute];


    return (
        <div className={css.refinementContainer}>
            <div className={css.refinementListControllers}>
                <span className={css.genreTitle}>{label}</span>
                {isOpened
                    ? <Button className={css.minusBtn} onClick={() => setIsOpened(false)}><IconCollection icon="minus-icon" /></Button>
                    : <Button className={css.plusBtn} onClick={() => setIsOpened(true)}><IconCollection icon="plus-transparent" /></Button>}
            </div>
            <div className={isOpened ? css.active : css.inActive}>
                <ul className={css.refinementList}>
                    {items.map((item) => (
                        <li key={item.label} className={css.refinementItem}>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={item.isRefined}
                                    onChange={() => {
                                        let value = '';
                                        if (item.isRefined) {
                                             value = removeItemFromString(initialValues, item.value);
                                        } else {
                                            value = initialValues ? `${initialValues},${item.value}` : item.value;
                                            sendEvent('click', item.value, FACET_CLICKED_EVENT, { query: keywords })
                                        }
                                        
                                        const updateQueryParams = omit(queryParams, [attribute]);

                                        if (initialCategory && [LISTING_SEARCH_ID, ALL_SEARCH_ID].includes(searchId)) {
                                            history.push(
                                                createResourceLocatorString(
                                                    'SearchPageGenre',
                                                    routes,
                                                    {
                                                        searchId: LISTING_SEARCH_ID,
                                                        genre: initialCategory,
                                                    },
                                                    {
                                                        ...(value ? {...updateQueryParams, [attribute]: value } : {...updateQueryParams}),
                                                    }
                                                )
                                            );
                                        } else if ([LISTING_SEARCH_ID, ALL_SEARCH_ID].includes(searchId)) {
                                            history.push(
                                                createResourceLocatorString(
                                                    'SearchPage',
                                                    routes,
                                                    {
                                                        searchId: LISTING_SEARCH_ID,
                                                    },
                                                    {
                                                        ...(value ? {...updateQueryParams, [attribute]: value } : {...updateQueryParams}),
                                                    }
                                                )
                                            );
                                        } else if (searchId === CREATOR_SEARCH_ID) {
                                            history.push(
                                                createResourceLocatorString(
                                                    'SearchPage',
                                                    routes,
                                                    {
                                                        searchId: CREATOR_SEARCH_ID,
                                                    },
                                                    {
                                                        ...(value ? { ...updateQueryParams, [attribute]: value } : { ...updateQueryParams }),
                                                    }
                                                )
                                            );
                                        }
                                    }}
                                    className={css.checkbox}
                                />
                                <span className={`${css.label} ${item.isRefined ? css.activeLabel : ''}`}>
                                    {normalizeText(item.label)}
                                </span>
                            </label>
                        </li>
                    ))}
                </ul>
                <Button disabled={!canClear} className={css.clearButton} onClick={() => {
                    const updatedQueryParams = omit(queryParams, [attribute])
                    if (initialCategory && [LISTING_SEARCH_ID, ALL_SEARCH_ID].includes(searchId)) {
                        history.push(
                            createResourceLocatorString(
                                'SearchPageGenre',
                                routes,
                                {
                                    searchId: LISTING_SEARCH_ID,
                                    genre: initialCategory,
                                },
                                {...updatedQueryParams}
                            )
                        );
                    } else if ([LISTING_SEARCH_ID, ALL_SEARCH_ID].includes(searchId)) {
                        history.push(
                            createResourceLocatorString(
                                'SearchPage',
                                routes,
                                {
                                    searchId: LISTING_SEARCH_ID,
                                },
                                {...updatedQueryParams}
                            )
                        );
                    }else if (searchId === CREATOR_SEARCH_ID) {
                        history.push(
                            createResourceLocatorString(
                                'SearchPage',
                                routes,
                                {
                                    searchId: CREATOR_SEARCH_ID,
                                },
                                {...updatedQueryParams}
                            )
                        );
                    }
                }}>
                    <FormattedMessage id="RefinementList.clear" />
                </Button>
            </div>
        </div>
    );
}

export default CustomRefinementList;
