
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CarouselSection, IconCollection } from '../../../../components';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import { createResourceLocatorString } from '../../../../util/routes';
import { useRouteConfiguration } from '../../../../context/routeConfigurationContext';
import { CREATOR_SEARCH_ID, USER_TYPE_AUDIENCE } from '../../../../constants';
import { getUserType } from '../../../../util/data';
import { creatorsWithRecentlyReleasesSelector, fetchCreatorsWithRecentlyReleases } from '../../../CreatorLandingPage/CreatorLandingPage.duck';

const CreatorsWithRecentlyReleases = ({ sectionName, description, currentUser }) => {
    const dispatch = useDispatch();
    const history = useHistory();
    const routeConfiguration = useRouteConfiguration();
    const featuredCreators = useSelector(creatorsWithRecentlyReleasesSelector);

    const userType = getUserType(currentUser);
    useEffect(() => {
        dispatch(fetchCreatorsWithRecentlyReleases());
    }, []);

    const showMoreFilms = () => {
        history.push(
            createResourceLocatorString(
                'SearchPage',
                routeConfiguration,
                { searchId: CREATOR_SEARCH_ID }
            )
        );
    };

    const linkprops = (userType === USER_TYPE_AUDIENCE)
        ? { name: 'AudienceProfileSettingsPage', params: { userType: USER_TYPE_AUDIENCE } }
        : null;

    const emptyCardDataMaybe = userType === USER_TYPE_AUDIENCE
        ? { emptyCardData: { icon: <IconCollection icon="icon-film" />, title: 'creators Wanted', text: 'Become A Creator And Start Earning', linkprops } }
        : {};

    return featuredCreators?.length ? (
        <CarouselSection
            name={sectionName}
            description={description}
            items={featuredCreators}
            handleAction={showMoreFilms}
            {...emptyCardDataMaybe}
        />
    ) : null;
};

export default CreatorsWithRecentlyReleases;
