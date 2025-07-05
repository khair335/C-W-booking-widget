import loadable from '@loadable/component';
import React from 'react';

import { bool, object } from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { camelize } from '../../util/string';
import { propTypes } from '../../util/types';

import FallbackPage from './FallbackPage';
import { LANDING_PAGE } from './LandingPage.duck';

const PageBuilder = loadable(() =>
  import(/* webpackChunkName: "PageBuilder" */ '../PageBuilder/PageBuilder')
);

export const LandingPageComponent = props => {
  const { pageAssetsData, inProgress, error, isAuthenticated } = props;
  const ASSET_NAME = LANDING_PAGE;

  return (
    <PageBuilder
      pageAssetsData={pageAssetsData?.[camelize(ASSET_NAME)]?.data}
      inProgress={inProgress}
      error={error}
      fallbackPage={<FallbackPage error={error} />}
      options={{ isAuthenticated, pageType: LANDING_PAGE }}
    />
  );
};

LandingPageComponent.propTypes = {
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
const LandingPage = compose(connect(mapStateToProps))(LandingPageComponent);

export default LandingPage;
