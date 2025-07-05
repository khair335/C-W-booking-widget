import React from 'react';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import css from './CustomFilterSection.module.css';
import IconCollection from '../../../../components/IconCollection/IconCollection';
import RabbelLogo from '../../../../assets/rabel-logo-white.png';
import { createResourceLocatorString } from '../../../../util/routes';
import { useRouteConfiguration } from '../../../../context/routeConfigurationContext';
import { CREATOR_SEARCH_ID, LISTING_SEARCH_ID, LISTING_TYPE_FILMS, LISTING_TYPE_SERIES } from '../../../../constants';
import { ResponsiveImage } from '../../../../components';
import classNames from 'classnames';
import { useSelector } from 'react-redux';
import { getUserType } from '../../../../util/data';
import { AUDIENCE_USER_TYPE, CREATOR_USER_TYPE } from '../../../../util/types';


const CustomFilterSection = () => {
  const history = useHistory();
  const routeConfiguration = useRouteConfiguration();
  const { currentUser } = useSelector(state => state.user);
  const userType = getUserType(currentUser);

  const handleClick = (pathname, pathParams) => {
    history.push(createResourceLocatorString(pathname, routeConfiguration, pathParams, {}));
  };

  return (
    <div className={css.customFilterContainer}>
      <div className={css.customFilterSection}>
        <div className={css.customFilterItem} onClick={() => handleClick('SearchPage', { searchId: CREATOR_SEARCH_ID })}>
          <div className={css.customFilterItemTitle}>
            <ResponsiveImage url={RabbelLogo} alt={'Rabel logo'} /> Creators
          </div>
        </div>
        <div className={classNames(css.customFilterItem)}
          onClick={() => handleClick('SearchPageGenre', { searchId: LISTING_SEARCH_ID, genre: LISTING_TYPE_SERIES })}
        >
          <div className={css.customFilterItemTitle}>
            <IconCollection icon="icon-series-white" />
            <div>
              <span>Series</span>
            </div>
          </div>
        </div>
        <div
          className={css.customFilterItem}
          onClick={() => handleClick('SearchPageGenre', { searchId: LISTING_SEARCH_ID, genre: LISTING_TYPE_FILMS })}
        >
          <div className={css.customFilterItemTitle}>
            <IconCollection icon="icon-film-white" /> Films
          </div>
        </div>
        <div className={classNames(css.customFilterItem, css.customFilterItemCreator)}
          onClick={() => {
            const pathName = userType === CREATOR_USER_TYPE ? 'ManageListingsPage' : 'AudienceProfileSettingsPage';
            const pathParams = userType === CREATOR_USER_TYPE ? {} : { userType: AUDIENCE_USER_TYPE };
            handleClick(pathName, pathParams);
          }}
        >
          <div className={css.customFilterItemTitle}>
            <>
              <IconCollection icon="icon-live-white" />
              <span className={css.customFilterTitle}>Creator Universe</span>
            </>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomFilterSection;
