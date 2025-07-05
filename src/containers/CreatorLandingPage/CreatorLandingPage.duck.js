import { CREATORS_ASSET_PAGE } from '../../constants';
import { fetchPageAssets } from '../../ducks/hostedAssets.duck';
import { getCreatorsHeroData, getCreatorsWithRecentlyReleasedApi } from '../../util/api';

export const FETCH_CREATORS_HERO_DATA = 'app/CreatorsLandingPage/FETCH_CREATORS_HERO_DATA';
export const FETCH_CREATORS_HERO_DATA_SUCCESS = 'app/CreatorsLandingPage/FETCH_CREATORS_HERO_DATA_SUCCESS';
export const FETCH_CREATORS_HERO_DATA_ERROR = 'app/CreatorsLandingPage/FETCH_CREATORS_HERO_DATA_ERROR';

export const FETCH_CREATORS_WITH_RECENTLY_RELEASES = 'app/CreatorsLandingPage/FETCH_CREATORS_WITH_RECENTLY_RELEASES';
export const FETCH_CREATORS_WITH_RECENTLY_RELEASES_SUCCESS = 'app/CreatorsLandingPage/FETCH_CREATORS_WITH_RECENTLY_RELEASES_SUCCESS';
export const FETCH_CREATORS_WITH_RECENTLY_RELEASES_ERROR = 'app/CreatorsLandingPage/FETCH_CREATORS_WITH_RECENTLY_RELEASES_ERROR';

const initialState = {
  creatorsHeroData: null,
  creatorsHeroDataError: null,
  creatorsHeroDataInProgress: false,

  creatorsWithRecentlyReleases: [],
  creatorsWithRecentlyReleasesError: null,
  creatorsWithRecentlyReleasesInProgress: false,
};

export default function reducer(state = initialState, action = {}) {
  const { type, payload } = action;
  switch (type) {
    case FETCH_CREATORS_HERO_DATA:
      return { ...state, creatorsHeroDataInProgress: true, creatorsHeroDataError: null };
    case FETCH_CREATORS_HERO_DATA_SUCCESS:
      return {
        ...state,
        creatorsHeroData: payload,
        creatorsHeroDataInProgress: false,
        creatorsHeroDataError: null,
      };
    case FETCH_CREATORS_HERO_DATA_ERROR:
      return {
        ...state,
        creatorsHeroData: null,
        creatorsHeroDataInProgress: false,
        creatorsHeroDataError: payload,
      };

    case FETCH_CREATORS_WITH_RECENTLY_RELEASES:
      return {
        ...state,
        creatorsWithRecentlyReleasesInProgress: true,
        creatorsWithRecentlyReleasesError: null
      };
    case FETCH_CREATORS_WITH_RECENTLY_RELEASES_SUCCESS:
      return {
        ...state,
        creatorsWithRecentlyReleases: payload,
        creatorsWithRecentlyReleasesInProgress: false,
        creatorsWithRecentlyReleasesError: null,
      };
    case FETCH_CREATORS_WITH_RECENTLY_RELEASES_ERROR:
      return {
        ...state,
        creatorsWithRecentlyReleases: [],
        creatorsWithRecentlyReleasesInProgress: false,
        creatorsWithRecentlyReleasesError: payload,
      };
    default:
      return state;
  }
}

// ================ Action creators ================ //
const requestAction = actionType => params => ({ type: actionType, payload: { params } });
const successAction = actionType => result => ({ type: actionType, payload: result.data });
const errorAction = actionType => payload => ({ type: actionType, payload, error: true });

export const fetchCreatorsHeroDataRequest = requestAction(FETCH_CREATORS_HERO_DATA);
export const fetchCreatorsHeroDataSuccess = successAction(FETCH_CREATORS_HERO_DATA_SUCCESS);
export const fetchCreatorsHeroDataError = errorAction(FETCH_CREATORS_HERO_DATA_ERROR);

export const fetchCreatorsWithRecentlyReleasesRequest = requestAction(FETCH_CREATORS_WITH_RECENTLY_RELEASES);
export const fetchCreatorsWithRecentlyReleasesSuccess = successAction(FETCH_CREATORS_WITH_RECENTLY_RELEASES_SUCCESS);
export const fetchCreatorsWithRecentlyReleasesError = errorAction(FETCH_CREATORS_WITH_RECENTLY_RELEASES_ERROR);


export const fetchCreatorsHeroData = () => async (dispatch, getState) => {
  dispatch(fetchCreatorsHeroDataRequest());
  try {
    const response = await getCreatorsHeroData();

    dispatch(fetchCreatorsHeroDataSuccess(response?.data));
  } catch (error) {
    dispatch(fetchCreatorsHeroDataError(error));
  }
};

export const fetchCreatorsWithRecentlyReleases = () => async (dispatch, getState) => {
  dispatch(fetchCreatorsWithRecentlyReleasesRequest());
  try {
    const result = await getCreatorsWithRecentlyReleasedApi();
    dispatch(fetchCreatorsWithRecentlyReleasesSuccess(result));
  } catch (err) {
    console.error(err, 'failed to fetch creators with recently released');
    dispatch(fetchCreatorsWithRecentlyReleasesError(err));
  }
};

// ================ Selectors ================ //

export const creatorsWithRecentlyReleasesSelector = state => state.CreatorLandingPage.creatorsWithRecentlyReleases;
export const creatorsHeroDataSelector = state => state.CreatorLandingPage.creatorsHeroData;

export const loadData = (params, search) => (dispatch, getState) => {
  const ASSET_NAME = CREATORS_ASSET_PAGE;
  const pageAsset = { creatorPage: `content/pages/${ASSET_NAME}.json` };
  return dispatch(fetchPageAssets(pageAsset, true));
};
