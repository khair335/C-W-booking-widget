import React, { useState } from "react";
import { useMenu } from "react-instantsearch";
import { normalizeText } from "../../../util/data";
import { FormattedMessage } from '../../../util/reactIntl';
import IconCollection from "../../../components/IconCollection/IconCollection";
import { createResourceLocatorString } from "../../../util/routes";
import { ALL_SEARCH_ID, CATEGORY_CLICKED_EVENT, CREATOR_SEARCH_ID, LISTING_SEARCH_ID, USER_TYPE_CREATOR } from "../../../constants";
import { Button } from "../../../components";
import css from "./Filters.module.css"; // Import CSS module
import { clickedFilter } from "../../../util/searchInsight";

function MenuFilterListings({ attribute, label, history, routes, currentUser, indexName, hasOnlyKeywords, searchId }) {
    const [isOpened, setIsOpened] = useState(true);
    const { items, refine } = useMenu({ attribute });
    const isRefined = !!items.find(i => i.isRefined);

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
                            className={`${css.menuItem} ${item.isRefined ? css.activeItem : ""}`}
                            onClick={() => {
                                if (!item.isRefined) {
                                    history.push(
                                        createResourceLocatorString(
                                            'SearchPageGenre',
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
                                        index: indexName,
                                        eventName: CATEGORY_CLICKED_EVENT,
                                        filters: [`${attribute}:${item.value}`]
                                    });
                                }
                            }}
                        >
                            <span className={css.itemLabel}>
                                {normalizeText(item.label)
                                    .replace('Products', '')
                                    .replace('Film', 'Films')
                                }
                            </span>
                        </li>
                    ))}
                    <li
                        className={`${css.menuItem}`}
                        key="creators"
                        value="creators"
                        onClick={() => {
                            // change the url to render creators
                            history.push(createResourceLocatorString('SearchPage', routes, { searchId: CREATOR_SEARCH_ID }))

                             // Trigger the click filter event
                            clickedFilter({
                                userToken: currentUser?.id?.uuid,
                                index: process.env.REACT_APP_ALGOLIA_USERS_INDEX,
                                eventName: CATEGORY_CLICKED_EVENT,
                                filters: [`userType:${USER_TYPE_CREATOR}`]
                            });
                        }}
                    >
                        <FormattedMessage id="MenuFilterListings.creators" />
                    </li>
                </ul>
                <Button className={css.clearButton} onClick={() => {
                    if (isRefined) {
                        history.push(
                            createResourceLocatorString(
                                'SearchPage',
                                routes,
                                {
                                    searchId: ALL_SEARCH_ID,
                                }
                            )
                        );
                    }
                }}> <FormattedMessage id="MenuFilter.clear" /></Button>
            </div>
        </div>
    );
}

export default MenuFilterListings;
