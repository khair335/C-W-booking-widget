import React from "react";
import { CREATOR_SEARCH_ID, LISTING_SEARCH_ID, LISTING_TYPE_FILMS, LISTING_TYPE_SERIES } from "../../../constants";
import { IconCollection, ResponsiveImage } from '../../../components';
import css from "./SearchDropdown.module.css";
import CreatorsImage from "../../../assets/creators.png";
import SeriesImage from "../../../assets/series.png";
import SolosImage from "../../../assets/solos.png";

const SearchDropdown = ({ onClick }) => {
    const categories = [
        {
            name: "Creators",
            image: CreatorsImage,
            icon: "icon-creators",
            description: "Explore amazing creators",
            linkProps: {
                name: "SearchPage",
                params: {
                    searchId: CREATOR_SEARCH_ID,
                },
            },
        },
        {
            name: "Series",
            image: SeriesImage,
            icon: "icon-series-white",
            description: "Find top-rated series",
            linkProps: {
                name: "SearchPageGenre",
                params: {
                    searchId: LISTING_SEARCH_ID,
                    genre: LISTING_TYPE_SERIES,
                }
            }
        },
        {
            name: "Solos",
            image: SolosImage,
            icon: "icon-film-white",
            description: "Discover solo adventures",
            linkProps: {
                name: "SearchPageGenre",
                params: {
                    searchId: LISTING_SEARCH_ID,
                    genre: LISTING_TYPE_FILMS,
                }
            }
        },
    ];

    return (
        <div className={css.dropdown}>
            <div className={css.categories}>
                {categories.map((category, index) => (
                    <div
                        key={index}
                        className={css.categoryCard}
                        onClick={() => {
                            onClick(category.linkProps);
                        }}
                    >
                        <ResponsiveImage url={category.image} alt={category.name} className={css.image} />
                        <div className={css.textContent}>
                            <IconCollection icon={category.icon} />
                            <h3>{category.name}</h3>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SearchDropdown;
