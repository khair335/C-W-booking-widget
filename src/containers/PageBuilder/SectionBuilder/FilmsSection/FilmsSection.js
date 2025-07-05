import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFilmsListings, filmsListingsSelector } from '../../../LandingPage/LandingPage.duck';
import { CarouselSection, IconCollection } from '../../../../components';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import { createResourceLocatorString } from '../../../../util/routes';
import { useRouteConfiguration } from '../../../../context/routeConfigurationContext';
import { LISTING_SEARCH_ID, LISTING_TYPE_FILMS, USER_TYPE_AUDIENCE, USER_TYPE_CREATOR } from '../../../../constants';
import { getUserType } from '../../../../util/data';

const FilmsSection = ({ sectionName, description, currentUser }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const routeConfiguration = useRouteConfiguration();
  const filmListings = useSelector(filmsListingsSelector);

  const userType = getUserType(currentUser);

  useEffect(() => {
    dispatch(fetchFilmsListings());
  }, []);

  const showMoreFilms = () => {
    history.push(
      createResourceLocatorString(
        'SearchPageGenre',
        routeConfiguration,
        { searchId: LISTING_SEARCH_ID, genre: LISTING_TYPE_FILMS },
        {}
      )
    );
  };

  // For Creators - Routes to Manage Listings
  // For Viewers - Routes to Creator Profile Application
  const linkprops = (userType === USER_TYPE_CREATOR)
    ? { name: 'ManageListingsPage' }
    : { name: 'AudienceProfileSettingsPage', params: { userType: USER_TYPE_AUDIENCE } };

  return filmListings?.length ? (
    <CarouselSection
      name={sectionName}
      description={description}
      items={filmListings}
      handleAction={showMoreFilms}
      emptyCardData={{ icon: <IconCollection icon="icon-film" />, title: 'Films Wanted', text: 'Upload My Video And Start Earning', linkprops }}
    />
  ) : null;
};

export default FilmsSection;
