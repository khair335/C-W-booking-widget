import React, { useEffect } from 'react';
import { fetchSeriesListings, seriesListingsSelector } from '../../../LandingPage/LandingPage.duck';
import { useDispatch, useSelector } from 'react-redux';
import { CarouselSection, IconCollection } from '../../../../components';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import { LISTING_SEARCH_ID, LISTING_TYPE_SERIES, USER_TYPE_AUDIENCE, USER_TYPE_CREATOR } from '../../../../constants';
import { useRouteConfiguration } from '../../../../context/routeConfigurationContext';
import { createResourceLocatorString } from '../../../../util/routes';
import { getUserType } from '../../../../util/data';

const SeriesSection = ({ sectionName, description, currentUser }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const routeConfiguration = useRouteConfiguration();
  const seriesListings = useSelector(seriesListingsSelector);

  const userType = getUserType(currentUser);

  useEffect(() => {
    dispatch(fetchSeriesListings());
  }, []);

  const showMoreSeries = () => {
    history.push(
      createResourceLocatorString(
        'SearchPageGenre',
        routeConfiguration,
        { searchId: LISTING_SEARCH_ID, genre: LISTING_TYPE_SERIES },
      )
    );
  }

  // For Creators - Routes to Manage Listings
  // For Viewers - Routes to Creator Profile Application
  const linkprops = (userType === USER_TYPE_CREATOR)
    ? { name: 'ManageListingsPage' }
    : { name: 'AudienceProfileSettingsPage', params: { userType: USER_TYPE_AUDIENCE } };

  return seriesListings?.length ? (
    <CarouselSection
      name={sectionName}
      description={description}
      items={seriesListings}
      handleAction={showMoreSeries}
      emptyCardData={{ icon: <IconCollection icon="icon-series" />, title: 'Series Wanted', text: 'Upload My Series And Start Earning', linkprops }}
    />
  ) : null;
};

export default SeriesSection;
