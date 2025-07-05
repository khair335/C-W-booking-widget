import React from 'react';
import CustomFilterSection from '../CustomFilterSection/CustomFilterSection';
import CustomHeroSection from '../CustomHeroSection/CustomHeroSection';
import NewReleaseSection from '../NewReleaseSection/NewReleaseSection';
import SeriesSection from '../SeriesSection/SeriesSection';
import FilmsSection from '../FilmsSection/FilmsSection';
import { CURRENTLY_WATCHING, FILMS_GENRE_FILTERS, FILMS_HERO, GENRE_FILTERS, SERIES, SERIES_HERO, CREATOR_GENRE_FILTERS, CREATOR_HERO, CUSTOM_FILTERS, FEATURED_CREATORS, FILMS, FOR_YOU, HERO, MY_CREATORS, NEW_RELEASES, RECENT_RELEASES } from '../../../../constants';
import ForYouSection from '../ForYouSection/ForYouSection';
import FeaturedCreators from '../FeaturedCreators/FeaturedCreators';
import RecentlyWatchedSection from '../RecentlyWatchedSection/RecentlyWatchedSection';
import MyCreatorsSection from '../MyCreators/MyCreators';
import CreatorHeroSection from '../CreatorHeroSection/CreatorHeroSection';
import SeriesHero from '../SeriesHero/SeriesHero';
import SeriesGenre from '../SeriesGenre/SeriesGenre';
import FilmsHero from '../FilmsHero/FilmsHero';
import FilmsGenre from '../FilmsGenre/FilmsGenre';
import CreatorsWithRecentlyReleases from '../CreatorsWithRecentlyReleases/CreatorsWithRecentlyReleases';

const OtherSection = ({ sectionName, description, currentUser }) => {
  const renderComponent = sectionName => {
    switch (sectionName) {

      // Landing Page Sections
      case HERO:
        return <CustomHeroSection />;

      case CUSTOM_FILTERS:
        return <CustomFilterSection />;

      case FOR_YOU:
        return <ForYouSection sectionName={sectionName} description={description} />;

      case CURRENTLY_WATCHING:
        return <RecentlyWatchedSection sectionName={sectionName} description={description} />;

      case MY_CREATORS:
        return <MyCreatorsSection sectionName={sectionName} description={description} />;

      case NEW_RELEASES:
        return <NewReleaseSection sectionName={sectionName} description={description} />;

      case SERIES:
        return <SeriesSection sectionName={sectionName} description={description} currentUser={currentUser} />;

      case FILMS:
        return <FilmsSection sectionName={sectionName} description={description} currentUser={currentUser} />;

      case FEATURED_CREATORS:
        return <FeaturedCreators sectionName={sectionName} description={description} currentUser={currentUser} />;

      case RECENT_RELEASES:
        return <CreatorsWithRecentlyReleases sectionName={sectionName} description={description} currentUser={currentUser} />;

      case CREATOR_GENRE_FILTERS:
        return null; // Not clear

      case CREATOR_HERO:
        return <CreatorHeroSection />;

      // Series Page Sections
      case SERIES_HERO:
        return <SeriesHero />;

      case GENRE_FILTERS:
        return <SeriesGenre />;


      // Films Page Sections
      case FILMS_HERO:
        return <FilmsHero />;

      case FILMS_GENRE_FILTERS:
        return <FilmsGenre />;

      default:
        console.warn(`Section ${sectionName} not found in Other sections!`);
        return null;
    }
  };

  return renderComponent(sectionName);
};

export default OtherSection;
