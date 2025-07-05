import React from "react"

import {
    ALL_SEARCH_ID,
    FILTER_RANGE_INPUT,
    FILTER_TYPE_REFINEMENT_LIST,
    LISTING_CATEGORY_FILTER,
    LISTING_SEARCH_ID,
} from "../../../constants"
import { FormattedMessage } from '../../../util/reactIntl';
import MenuFilterListings from "./MenuFilterListings"
import CustomRefinementList from "./RefinementList"
import CustomRangeInput from "./RangeFilter"
import MenuFilterCreators from "./MenuFilterCreators";
import { Button } from "../../../components";
import { useClearRefinements } from "react-instantsearch";
import { createResourceLocatorString } from "../../../util/routes";
import css from './Filters.module.css';

const listingIndex = process.env.REACT_APP_ALGOLIA_LISTINGS_INDEX;
const creatorIndex = process.env.REACT_APP_ALGOLIA_USERS_INDEX;

const Filters = ({ intl, filters, indexName, routeConfiguration, history, initialCategory, searchId, queryParams, currentUser, hasOnlyKeywords }) => {
    if (!filters || filters.length === 0) {
        console.warn("No filters provided");
        return null;
    };

    const { canRefine: canClear, refine: clearRefine } = useClearRefinements();

    return (
        <div>

            {indexName === listingIndex
                ? (<MenuFilterListings
                    attribute={LISTING_CATEGORY_FILTER}
                    label={<FormattedMessage id="SearchPageFilters.category" />}
                    intl={intl}
                    history={history}
                    routes={routeConfiguration}
                    currentUser={currentUser}
                    indexName={indexName}
                    hasOnlyKeywords={hasOnlyKeywords}
                    searchId={searchId}
                />)
                : indexName === creatorIndex
                    ? (<MenuFilterCreators
                        label={<FormattedMessage id="SearchPageFilters.category" />}
                        intl={intl}
                        history={history}
                        routes={routeConfiguration}
                        currentUser={currentUser}
                        indexName={indexName}
                        hasOnlyKeywords={hasOnlyKeywords}
                    />)
                    : null}

            {!hasOnlyKeywords ? filters.map((filter, index) => {
                const { type, attribute, label } = filter;

                // Ensure necessary properties exist before rendering
                if (!type || !attribute) {
                    console.warn("Invalid filter configuration:", filter);
                    return null;
                }

                // Render based on filter type
                switch (type) {

                    case FILTER_TYPE_REFINEMENT_LIST:
                        return (
                            <CustomRefinementList
                                key={`${attribute}-${index}`}
                                attribute={attribute}
                                label={label}
                                intl={intl}
                                history={history}
                                routes={routeConfiguration}
                                initialCategory={initialCategory}
                                searchId={searchId}
                                queryParams={queryParams}
                                currentUser={currentUser}
                                indexName={indexName}
                            />
                        );

                    case FILTER_RANGE_INPUT:
                        return (
                            <CustomRangeInput
                                key={`${attribute}-${index}`}
                                attribute={attribute}
                                precision={2}
                                intl={intl}
                                history={history}
                                routes={routeConfiguration}
                                searchId={searchId}
                                queryParams={queryParams}
                                initialCategory={initialCategory}
                                currentUser={currentUser}
                                indexName={indexName}
                            />
                        );

                    default:
                        console.warn(`Unsupported filter type: ${type}`);
                        return null;
                }
            }) : null}
            {canClear ? (<Button
                disabled={!canClear}
                className={css.clearButton}
                onClick={() => {
                    history.push(
                        createResourceLocatorString(
                            'SearchPage',
                            routeConfiguration,
                            {
                                searchId: ALL_SEARCH_ID,
                            }
                        )
                    );
                    // clearRefine()
                }}>
                <FormattedMessage id="SearchPageFilters.resetAll" />
            </Button>) : null}
        </div>
    );
};
export default Filters;