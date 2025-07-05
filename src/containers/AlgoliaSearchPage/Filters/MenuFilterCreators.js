import React, { useState } from "react";
import IconCollection from "../../../components/IconCollection/IconCollection";
import { FormattedMessage } from "../../../util/reactIntl";
import { normalizeText } from "../../../util/data";
import { createResourceLocatorString } from "../../../util/routes";
import { ALL_SEARCH_ID, CATEGORY_CLICKED_EVENT, LISTING_SEARCH_ID, LISTING_TYPE_FILMS, LISTING_TYPE_SERIES } from "../../../constants";
import css from "./Filters.module.css"; // Import CSS module
import { Button } from "../../../components";
import { clickedFilter } from "../../../util/searchInsight";


const items = [
    { label: "Films", value: LISTING_TYPE_FILMS, attribute: 'publicData.listingType', },
    { label: "Series", value: LISTING_TYPE_SERIES, attribute:'publicData.listingType' },
    { label: "Creators", active: true }
];

function MenuFilterCreators({ label, history, routes, currentUser, indexName, hasOnlyKeywords }) {
    const [isOpened, setIsOpened] = useState(true);

    return (
        <div className={css.menuContainer}>
            <div className={css.menuHandlers}>
                <span className={css.categoryTitle}>{label}</span>
                {isOpened
                    ? <Button className={css.minusBtn} onClick={() => setIsOpened(false)}><IconCollection icon="minus-icon" /></Button>
                    : <Button className={css.plusBtn} onClick={() => setIsOpened(true)}><IconCollection icon="plus-transparent" /></Button>}
            </div>

            <div className={isOpened ? css.active : css.inActive}>
                <ul className={css.menuList}>
                    <span className={hasOnlyKeywords ? css.allLabel : css.inActiveAll} onClick={() => {
                        history.push(
                            createResourceLocatorString(
                                'SearchPage',
                                routes,
                                {
                                    searchId: ALL_SEARCH_ID,
                                },
                            )
                        );
                    }}><FormattedMessage id="MenuFilterListings.all" />
                    </span>
                    {items.map((item) => (
                        <li
                            key={item.label}
                            className={`${css.menuItem} ${item.active ? css.activeItem : ""}`}
                            onClick={() => {
                                // change the url to render listings
                                if(!item.active){
                                    history.push(
                                      createResourceLocatorString(
                                        item.value ? 'SearchPageGenre' : 'SearchPage',
                                        routes,
                                        {
                                          searchId: LISTING_SEARCH_ID,
                                          genre: item.value,
                                        }
                                      )
                                    );

                                    // Trigger the click filter event
                                    clickedFilter({
                                        userToken: currentUser?.id?.uuid,
                                        index: process.env.REACT_APP_ALGOLIA_LISTINGS_INDEX,
                                        eventName: CATEGORY_CLICKED_EVENT,
                                        filters: [`${item.attribute}:${item.value}`]
                                    });
                                }
                            }}
                        >
                            <span className={css.itemLabel}>{normalizeText(item.label)}</span>
                        </li>
                    ))}
                </ul>
                <Button className={css.clearButton} onClick={() => {
                    // move to listings
                    history.push(createResourceLocatorString('SearchPage', routes, { searchId: ALL_SEARCH_ID }, {}))
                }}> <FormattedMessage id="MenuFilter.clear" /></Button>
            </div>
        </div>
    );
}

export default MenuFilterCreators;
