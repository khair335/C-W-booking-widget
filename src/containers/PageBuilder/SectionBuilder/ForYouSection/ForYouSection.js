import React, { useEffect } from 'react';
import { getWishlistListings, wishlistSelector } from '../../../LandingPage/LandingPage.duck';
import { useDispatch, useSelector } from 'react-redux';
import { CarouselSection } from '../../../../components';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import { TAB_WISHLIST } from '../../../../constants';
import { useRouteConfiguration } from '../../../../context/routeConfigurationContext';
import { createResourceLocatorString } from '../../../../util/routes';

const ForYouSection = ({ sectionName, description }) => {
    const dispatch = useDispatch();
    const history = useHistory();
    const routeConfiguration = useRouteConfiguration();
    const wishlist = useSelector(wishlistSelector);    

    useEffect(() => {
        dispatch(getWishlistListings());
    }, []);

    const showMore = () => {
        history.push(
            createResourceLocatorString(
                'MyLibraryPage',
                routeConfiguration,
                { tab: TAB_WISHLIST },
            )
        );
    }

    return wishlist?.length ? (
        <CarouselSection
            name={sectionName}
            description={description}
            items={wishlist}
            handleAction={showMore}
        />
    ) : null;
};

export default ForYouSection;
