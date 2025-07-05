import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSeriesGenres, genreFacetsSelector } from '../../../SeriesPage/SeriesPage.duck';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import { createResourceLocatorString } from '../../../../util/routes';
import { useRouteConfiguration } from '../../../../context/routeConfigurationContext';
import { LISTING_SEARCH_ID, PRIMARY_GENRE_FILTER } from '../../../../constants';
import { SERIES_PRODUCTS } from '../../../../util/types';
import { HorizontalItemsSlider } from '../../../../components';

const SeriesGenre = () => {
    const dispatch = useDispatch();
    const history = useHistory();
    const routeConfiguration = useRouteConfiguration();
    const genreFacets = useSelector(genreFacetsSelector);

    useEffect(() => {
        dispatch(fetchSeriesGenres());
    }, [dispatch]);

    const handleGenreClick = (genre) => {
        history.push(
            createResourceLocatorString(
                'SearchPageGenre',
                routeConfiguration,
                { searchId: LISTING_SEARCH_ID, genre: SERIES_PRODUCTS },
                { [PRIMARY_GENRE_FILTER]: genre }
            )
        );
    };

    return (
        <HorizontalItemsSlider items={genreFacets || []} onClick={(item) => handleGenreClick(item)} />
    );
};

export default SeriesGenre;
