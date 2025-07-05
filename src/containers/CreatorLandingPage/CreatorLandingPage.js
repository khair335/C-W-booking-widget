import loadable from '@loadable/component';
import React from 'react';

import { bool, object } from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { propTypes } from '../../util/types';

import FallbackPage from './FallbackPage';
import { CREATORS_PAGE } from '../../constants';

const PageBuilder = loadable(() =>
  import(/* webpackChunkName: "PageBuilder" */ '../PageBuilder/PageBuilder')
);

export const CreatorLandingPageComponent = props => {
  const { pageAssetsData, inProgress, error, isAuthenticated } = props;
  const ASSET_NAME = CREATORS_PAGE;
  return (
    <PageBuilder
      pageAssetsData={pageAssetsData?.[ASSET_NAME]?.data}
      inProgress={inProgress}
      error={error}
      fallbackPage={<FallbackPage error={error} />}
      options={{ isAuthenticated, pageType: CREATORS_PAGE }}
    />
  );
};

CreatorLandingPageComponent.propTypes = {
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
const CreatorLandingPage = compose(connect(mapStateToProps))(CreatorLandingPageComponent);

export default CreatorLandingPage;
