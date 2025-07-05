import React from 'react';
import { useIntl } from "react-intl";
import LandingPageFilters from "../Filters/LandingPageFilters";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { useRouteConfiguration } from "../../../context/routeConfigurationContext";
import { LandingPageFilter } from "../../../constants";
import css from '../AlgoliaLandingPage.module.css';
import CustomHits from '../../AlgoliaSearchPage/Hits/Hits';

const GuestAlgoliaLandingPage = ({ indexName }) => {
  const intl = useIntl();
  const history = useHistory();
  const routeConfiguration = useRouteConfiguration();

  return (
    <div className={css.filtersContainer}>
      <div className={css.filters}>
        <LandingPageFilters filters={LandingPageFilter} indexName={indexName} />
      </div>
      <div className={css.hitsContainer}>
        <CustomHits
          routeConfiguration={routeConfiguration}
          history={history}
          indexName={indexName}
          intl={intl}
          isLandingPage={true}
        />
      </div>
    </div>
  );
};

export default GuestAlgoliaLandingPage;
