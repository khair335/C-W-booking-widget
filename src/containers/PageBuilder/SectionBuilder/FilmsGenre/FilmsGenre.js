import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFilmsGenres, genreFacetsSelector } from '../../../FilmsPage/FilmsPage.duck';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import { createResourceLocatorString } from '../../../../util/routes';
import { useRouteConfiguration } from '../../../../context/routeConfigurationContext';
import { LISTING_SEARCH_ID, PRIMARY_GENRE_FILTER } from '../../../../constants';
import { HorizontalItemsSlider } from '../../../../components';
import { FILM_PRODUCTS } from '../../../../util/types';

const FilmsGenre = () => {
    const dispatch = useDispatch();
    const history = useHistory();
    const routeConfiguration = useRouteConfiguration();
    const genreFacets = useSelector(genreFacetsSelector);

    useEffect(() => {
        dispatch(fetchFilmsGenres());
    }, [dispatch]);

    const handleGenreClick = (genre) => {
        history.push(
            createResourceLocatorString(
                'SearchPageGenre',
                routeConfiguration,
                { searchId: LISTING_SEARCH_ID, genre: FILM_PRODUCTS },
                { [PRIMARY_GENRE_FILTER]: genre }
            )
        );
    };

    return (
        <HorizontalItemsSlider items={genreFacets || []} onClick={(item) => handleGenreClick(item)} />
    );
};

export default FilmsGenre;
