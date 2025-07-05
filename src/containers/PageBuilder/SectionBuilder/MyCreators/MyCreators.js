import React, { useEffect } from 'react';
import { fetchMyCreators, myCreatorsSelector } from '../../../LandingPage/LandingPage.duck';
import { useDispatch, useSelector } from 'react-redux';
import { CarouselSection } from '../../../../components';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import { useRouteConfiguration } from '../../../../context/routeConfigurationContext';
import { createResourceLocatorString } from '../../../../util/routes';
import { CREATOR_SEARCH_ID, TAB_WISHLIST } from '../../../../constants';

const MyCreatorsSection = ({ sectionName, description }) => {
    const dispatch = useDispatch();
    const history = useHistory();
    const routeConfiguration = useRouteConfiguration();
    const myCreators = useSelector(myCreatorsSelector);

    useEffect(() => {
        dispatch(fetchMyCreators());
    }, []);

    const showMoreCreators = () => {
        history.push(
            createResourceLocatorString(
                'MyLibraryPage',
                routeConfiguration,
                { tab: TAB_WISHLIST }
            )
        );
    }

    return myCreators?.length ? (
        <CarouselSection
            name={sectionName}
            description={description}
            items={myCreators}
            handleAction={showMoreCreators}
        />
    ) : null;
};

export default MyCreatorsSection;
