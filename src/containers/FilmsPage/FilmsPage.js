import loadable from '@loadable/component';
import React from 'react';

import { bool, object } from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { camelize } from '../../util/string';
import { propTypes } from '../../util/types';
import FallbackPage from './FallbackPage';
import { FILMS_PAGE } from './FilmsPage.duck';


const PageBuilder = loadable(() =>
  import(/* webpackChunkName: "PageBuilder" */ '../PageBuilder/PageBuilder')
);

export const FilmsPageComponent = props => {
  const { pageAssetsData, inProgress, error, isAuthenticated } = props;
  
  return (
    <PageBuilder
      pageAssetsData={pageAssetsData?.[camelize(FILMS_PAGE)]?.data}
      inProgress={inProgress}
      error={error}
      fallbackPage={<FallbackPage error={error} />}
      options={{ isAuthenticated, pageType: FILMS_PAGE }}
    />
  );
};

FilmsPageComponent.propTypes = {
  pageAssetsData: object,
  inProgress: bool,
  error: propTypes.error,
};

const mapStateToProps = state => {
  const { pageAssetsData, inProgress, error } = state.hostedAssets || {};
  const { isAuthenticated } = state.auth;
  return { pageAssetsData, inProgress, error, isAuthenticated };
};

// Note: it is important that the withRouter HOC is **outside** the
// connect HOC, otherwise React Router won't rerender any Route
// components since connect implements a shouldComponentUpdate
// lifecycle hook.
//
// See: https://github.com/ReactTraining/react-router/issues/4671
const FilmsPage = compose(connect(mapStateToProps))(FilmsPageComponent);

export default FilmsPage;
