import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLatestContent, recentListingsSelector } from '../../../LandingPage/LandingPage.duck';
import { CarouselSection } from '../../../../components';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import { LISTING_SEARCH_ID } from '../../../../constants';
import { useRouteConfiguration } from '../../../../context/routeConfigurationContext';
import { createResourceLocatorString } from '../../../../util/routes';

const NewReleaseSection = ({ sectionName, description }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const routeConfiguration = useRouteConfiguration();
  const recentListing = useSelector(recentListingsSelector);

  const handleClick = () => {
    history.push(
      createResourceLocatorString(
        'SearchPage',
        routeConfiguration,
        { searchId: LISTING_SEARCH_ID },
        {}
      )
    );
  };

  useEffect(() => {
    if (!recentListing?.length) {
      dispatch(fetchLatestContent());
    }
  }, []);

  return recentListing?.length ? (
    <CarouselSection
      name={sectionName}
      description={description}
      items={recentListing}
      handleAction={handleClick}
    />
  ) : null;
};

export default NewReleaseSection;
