import React from 'react';
import { CarouselSection } from '../../../components';
import { useHits } from 'react-instantsearch';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import { useRouteConfiguration } from '../../../context/routeConfigurationContext';
import { CREATOR_SEARCH_ID, CREATORS_WITH_SERIES, FILMS_CREATORS_SECTION, LISTING_SEARCH_ID, NEW_TO_RABEL, NEWLY_RELEASED_FILMS, NEWLY_RELEASED_SERIES, POPULAR_CREATORS, RECENT_RELEASES, TRENDING_CREATORS, TRENDING_FILMS, TRENDING_SERIES_CONTENT } from '../../../constants';
import { createResourceLocatorString } from '../../../util/routes';
import { FILM_PRODUCTS, SERIES_PRODUCTS } from '../../../util/types';

const AuthAlogliaLandingPage = ({ sectionName, description, title }) => {
  const { items, sendEvent } = useHits();
  const history = useHistory();
  const routeConfiguration = useRouteConfiguration();

  const routeToPage = () => {
    const creatorSections = [TRENDING_CREATORS, POPULAR_CREATORS, NEW_TO_RABEL, RECENT_RELEASES, FILMS_CREATORS_SECTION, CREATORS_WITH_SERIES];
    const filmSections = [TRENDING_FILMS, NEWLY_RELEASED_FILMS];
    const seriesSections = [TRENDING_SERIES_CONTENT, NEWLY_RELEASED_SERIES];

    const searchId = creatorSections.includes(sectionName) ? CREATOR_SEARCH_ID : LISTING_SEARCH_ID;
    const genrePageSections = [...filmSections, ...seriesSections];

    const isGenreSection = genrePageSections.includes(sectionName);
    const genre = isGenreSection && filmSections.includes(sectionName) ? FILM_PRODUCTS : isGenreSection && seriesSections.includes(sectionName) ? SERIES_PRODUCTS : null;
    const pageName = isGenreSection ? 'SearchPageGenre' : 'SearchPage';

    history.push(
      createResourceLocatorString(pageName, routeConfiguration, { searchId, genre })
    )
  };

  return items?.length ? (
    <CarouselSection
      name={title?.trim() || sectionName}
      description={description}
      items={items}
      algolia={true}
      handleAction={routeToPage}
    />
  ) : null;
};

export default AuthAlogliaLandingPage;
