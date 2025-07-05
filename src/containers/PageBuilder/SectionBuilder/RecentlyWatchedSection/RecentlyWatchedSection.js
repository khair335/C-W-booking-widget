import React, { useEffect } from 'react';
import { fetchWatchListings, watchlistSelector } from '../../../LandingPage/LandingPage.duck';
import { useDispatch, useSelector } from 'react-redux';
import { CarouselSection } from '../../../../components';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import { useRouteConfiguration } from '../../../../context/routeConfigurationContext';
import { createResourceLocatorString } from '../../../../util/routes';

const RecentlyWatchedSection = ({ sectionName, description }) => {
    const dispatch = useDispatch();
    const history = useHistory();
    const routeConfiguration = useRouteConfiguration();
    const watchListListings = useSelector(watchlistSelector);

    useEffect(() => {
        dispatch(fetchWatchListings());
    }, []);

    const showMoreWatchlist = () => {
        history.push(
            createResourceLocatorString(
                'MyLibraryPage',
                routeConfiguration,
                { tab: 'purchases' }
            )
        );
    }

    return watchListListings?.length ? (
        <CarouselSection
            name={sectionName}
            description={description}
            items={watchListListings}
            handleAction={showMoreWatchlist}
        />
    ) : null;
};

export default RecentlyWatchedSection;
