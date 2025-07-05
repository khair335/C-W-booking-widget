import React from 'react';
import { bool, func, object, shape, string } from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import Switch from 'react-switch';

import { useConfiguration } from '../../context/configurationContext';
import { FormattedMessage, injectIntl, intlShape } from '../../util/reactIntl';
import { CREATOR_USER_TYPE, CUSTOM_ROLE, propTypes } from '../../util/types';
import { PROFILE_PAGE_PENDING_APPROVAL_VARIANT } from '../../util/urlHelpers';
import { ensureCurrentUser, useQuery } from '../../util/data';
import {
  initialValuesForUserFields,
  isUserAuthorized,
  pickUserFieldsData,
} from '../../util/userHelpers';
import { isScrollingDisabled } from '../../ducks/ui.duck';

import { Page, NamedLink, LayoutSideNavigation, H5, IconCollection } from '../../components';

import TopbarContainer from '../../containers/TopbarContainer/TopbarContainer';
import FooterContainer from '../../containers/FooterContainer/FooterContainer';

import ProfileSettingsForm from './ProfileSettingsForm/ProfileSettingsForm';

import { createProfileAssets, togglePrivateMode, updateProfile, uploadImage, uploadProfileBanner, validateUserName } from './ProfileSettingsPage.duck';
import css from './ProfileSettingsPage.module.css';
import { withRouter } from 'react-router-dom';
import { useRouteConfiguration } from '../../context/routeConfigurationContext';
import { createResourceLocatorString } from '../../util/routes';
import { Tooltip } from 'react-tooltip';

const onImageUploadHandler = (values, fn) => {
  const { id, imageId, file, imageType } = values;
  if (file) {
    fn({ id, imageId, file, imageType });
  }
  return true
};

const ViewProfileLink = props => {
  const { userUUID, isUnauthorizedUser, userType, username, displayName } = props;
  return userUUID && isUnauthorizedUser ? (
    <NamedLink
      className={css.profileLink}
      name="ProfilePageVariant"
      params={{ id: userUUID, variant: PROFILE_PAGE_PENDING_APPROVAL_VARIANT, username: username || displayName }}
    >
      <FormattedMessage id="ProfileSettingsPage.viewProfileLink" />
    </NamedLink>
  ) : userUUID ? (
      <NamedLink className={css.profileLink} name="ProfilePage" params={{ id: userUUID, username: username || displayName }}>
      {userType == CREATOR_USER_TYPE ? <FormattedMessage id="ProfileSettingsPage.viewProfileLink" /> : <FormattedMessage id="ProfileSettingsPage.viewProfile" />}
    </NamedLink>
  ) : null;
};

export const ProfileSettingsPageComponent = props => {
  const config = useConfiguration();
  const routeConfiguration = useRouteConfiguration();
  const {
    currentUser,
    image,
    onImageUpload,
    onUpdateProfile,
    scrollingDisabled,
    updateInProgress,
    updateViewInProgress,
    updateProfileError,
    uploadImageError,
    uploadInProgress,
    intl,
    onValidateUserName,
    userNameExist,
    bannerImage,
    onBannerImageUpload,
    onCreateProfileAssets,
    userProfileAssetsInProgress,
    userProfileAssetsError,
    params,
    history,
    privateModeInProgress,
    privateModeError,
    onTogglePrivateMode
  } = props;

  const { userType: audienceType } = params;
  const redirectUrlMaybe = useQuery(props?.location.search)?.get('redirectUrl');

  const { userFields, userTypes = [] } = config.user;

  const handleSubmit = (values, userType) => {
    const { firstName, lastName, displayName, bio: rawBio, userName, profileImage, mainRole, subRole, custom_role, userProfileImage, userProfileBanner, saveAndViewProfile, ...rest } = values;
    const { profile_banner: profileBannerImage } = user?.attributes?.profile?.publicData || {};
    const displayNameMaybe = displayName
      ? { displayName: displayName.trim() }
      : { displayName: null };

    // Ensure that the optional bio is a string
    const bio = rawBio || '';
    const uploadedBannerImage = props.bannerImage;

    const profile = {
      bio,
      publicData: {
        ...displayNameMaybe,
        ...pickUserFieldsData(rest, 'public', userType, userFields),
        profile_banner: uploadedBannerImage ? {
          attributes: {
            ...uploadedBannerImage.uploadedImage.attributes
          },
          id: uploadedBannerImage.imageId.uuid,
          type: uploadedBannerImage.uploadedImage.type
        } : profileBannerImage,
        userName: `@${userName}`,
        professional_role: { main_role: mainRole, sub_role: subRole },
        custom_role: subRole == CUSTOM_ROLE ? custom_role : '',
        userProfileImage, userProfileBanner,
        userType: audienceType ? CREATOR_USER_TYPE : userType,
      },
      protectedData: {
        ...pickUserFieldsData(rest, 'protected', userType, userFields),
      },
      privateData: {
        ...pickUserFieldsData(rest, 'private', userType, userFields),
      },
    };

    const uploadedImage = props.image;

    // Update profileImage only if file system has been accessed
    const updatedValues =
      uploadedImage && uploadedImage.imageId && uploadedImage.file && profileImage
        ? { ...profile, profileImageId: uploadedImage.imageId }
        : !profileImage ? { ...profile, profileImageId: null } : profile;

    onUpdateProfile(updatedValues, saveAndViewProfile).then(() => {
      if (redirectUrlMaybe) {
        return history.push(redirectUrlMaybe);
      };

      if (saveAndViewProfile) {
        history.push(
          createResourceLocatorString(
            'ProfilePage',
            routeConfiguration,
            { id: user && user.id && user.id.uuid, username: userName },
            {}
          )
        );
      }
    });
  };

  const MakeProfilePrivateSwitch = (props) => {
    const { isCreatorType, onSwichChange, checked, className, intl, privateModeInProgress, privateModeError } = props;
    const switchLabel = intl.formatMessage({ id: 'ProfileSettingsPage.makeProfilePrivateSwitch' });

    if (!isCreatorType) return null;

    return (
      <>
        <div className={className}>
          <Switch disabled={privateModeInProgress} onChange={onSwichChange} checked={checked} height={20} width={40} />
          <span>{switchLabel}</span>
          <div>
            <span data-tooltip-id="private-switch-tooltip">
              <IconCollection icon="icon-info" width={18} height={18} />
            </span>
            <Tooltip
              id="private-switch-tooltip"
              place="right"
              content={intl.formatMessage({ id: "ProfileSettingsPage.makeProfilePrivateSwitchTooltip" })}
            />
          </div>
        </div>
        {privateModeError ? (
          <div className={css.error}><FormattedMessage id='ProfileSettingsPage.makeProfilePrivateSwitchError' /></div>
        ) : null}
      </>
    )
  };

  const user = ensureCurrentUser(currentUser);
  const {
    firstName,
    lastName,
    bio,
    publicData,
    protectedData,
    privateData,
  } = user?.attributes.profile;
  // I.e. the status is active, not pending-approval or banned
  const isUnauthorizedUser = currentUser && !isUserAuthorized(currentUser);

  const {
    userType,
    profile_banner: profileBannerImage,
    userName,
    professional_role,
    custom_role,
    userProfileImage,
    userProfileBanner,
    displayName = '',
    privateMode
  } = publicData || {};
  const profileImageId = user.profileImage ? user.profileImage.id : null;
  const profileImage = image || { imageId: profileImageId };
  const profileBanner = bannerImage || { imageId: (profileBannerImage && profileBannerImage.id) };
  const userTypeConfig = userTypes.find(config => config.userType === userType);
  const isDisplayNameIncluded = userTypeConfig?.defaultUserFields?.displayName !== false;
  // ProfileSettingsForm decides if it's allowed to show the input field.
  const displayNameMaybe = isDisplayNameIncluded && displayName ? { displayName } : {};
  const listingCategories = config.categoryConfiguration.categories;
  const categoryKey = config.categoryConfiguration.key;
  const isCreatorType = (userType == CREATOR_USER_TYPE || audienceType);


  const profileSettingsForm = user.id ? (
    <ProfileSettingsForm
      className={css.form}
      currentUser={currentUser}
      initialValues={{
        ...displayNameMaybe,
        displayName: displayName || "",
        bio,
        profileImage: user.profileImage,
        profile_banner: profileBannerImage,
        userName: userName?.split('@')[1],
        mainRole: professional_role?.main_role,
        subRole: professional_role?.sub_role,
        custom_role,
        userProfileImage, userProfileBanner,
        ...initialValuesForUserFields(publicData, 'public', userType, userFields),
        ...initialValuesForUserFields(protectedData, 'protected', userType, userFields),
        ...initialValuesForUserFields(privateData, 'private', userType, userFields),
      }}
      profileImage={profileImage}
      onImageUpload={e => onImageUploadHandler(e, onImageUpload)}
      onBannerImageUpload={e => onImageUploadHandler(e, onBannerImageUpload)}
      uploadInProgress={uploadInProgress}
      updateInProgress={updateInProgress}
      uploadImageError={uploadImageError}
      updateProfileError={updateProfileError}
      onSubmit={values => handleSubmit(values, userType)}
      marketplaceName={config.marketplaceName}
      userFields={userFields}
      userTypeConfig={userTypeConfig}
      onValidateUserName={onValidateUserName}
      userNameExist={userNameExist}
      profileBanner={profileBanner}
      selectableCategories={listingCategories}
      categoryPrefix={categoryKey}
      onCreateProfileAssets={onCreateProfileAssets}
      userProfileAssetsInProgress={userProfileAssetsInProgress}
      userProfileAssetsError={userProfileAssetsError}
      isCreatorType={isCreatorType}
      history={history}
      routeConfiguration={routeConfiguration}
      updateViewInProgress={updateViewInProgress}
    />
  ) : null;

  const title = intl.formatMessage({ id: 'ProfileSettingsPage.title' });

  return (
    <Page className={css.root} title={title} scrollingDisabled={scrollingDisabled}>
      <LayoutSideNavigation
        topbar={
          <>
            <TopbarContainer />
            {/* <UserNav currentPage="ProfileSettingsPage" /> */}
          </>
        }
        sideNav={null}
        useAccountSettingsNav
        currentPage="ProfileSettingsPage"
        footer={<FooterContainer />}
        className={css.layoutSideNavigation}
        mainColumnClassName={css.mainColumn}
        isCreatorType={audienceType}
      >
        <div className={css.content}>
          <div className={css.headingContainer}>
            <H5 as="h5" className={css.heading}>
              {(isCreatorType) ? (
                <FormattedMessage id="ProfileSettingsPage.heading" />
              ) : (
                <FormattedMessage id="ProfileSettingsPage.audienceHeading" />
              )}
            </H5>
          </div>
          <MakeProfilePrivateSwitch
            className={css.makeProfilePrivateSwitch}
            intl={intl}
            isCreatorType={isCreatorType}
            onSwichChange={onTogglePrivateMode}
            privateModeInProgress={privateModeInProgress}
            privateModeError={privateModeError}
            checked={privateMode}
          />
          {profileSettingsForm}
        </div>
      </LayoutSideNavigation>
    </Page>
  );
};

ProfileSettingsPageComponent.defaultProps = {
  currentUser: null,
  uploadImageError: null,
  updateProfileError: null,
  image: null,
  config: null,
};

ProfileSettingsPageComponent.propTypes = {
  currentUser: propTypes.currentUser,
  image: shape({
    id: string,
    imageId: propTypes.uuid,
    file: object,
    uploadedImage: propTypes.image,
  }),
  onImageUpload: func.isRequired,
  onUpdateProfile: func.isRequired,
  scrollingDisabled: bool.isRequired,
  updateInProgress: bool.isRequired,
  updateProfileError: propTypes.error,
  uploadImageError: propTypes.error,
  uploadInProgress: bool.isRequired,

  // from useConfiguration()
  config: object,

  // from injectIntl
  intl: intlShape.isRequired,
};

const mapStateToProps = state => {
  const { currentUser } = state.user;
  const {
    image,
    uploadImageError,
    uploadInProgress,
    updateViewInProgress,
    updateInProgress,
    updateProfileError,
    userNameExist,
    bannerImage,
    userProfileAssetsInProgress,
    userProfileAssetsError,
    privateModeInProgress,
    privateModeError,
  } = state.ProfileSettingsPage;
  return {
    currentUser,
    image,
    scrollingDisabled: isScrollingDisabled(state),
    updateInProgress,
    updateViewInProgress,
    updateProfileError,
    uploadImageError,
    uploadInProgress,
    userNameExist,
    bannerImage,
    userProfileAssetsInProgress,
    userProfileAssetsError,
    privateModeInProgress,
    privateModeError
  };
};

const mapDispatchToProps = dispatch => ({
  onImageUpload: data => dispatch(uploadImage(data)),
  onBannerImageUpload: data => dispatch(uploadProfileBanner(data)),
  onUpdateProfile: (data, saveAndViewProfile) => dispatch(updateProfile(data, saveAndViewProfile, true)),
  onValidateUserName: data => dispatch(validateUserName(data)),
  onCreateProfileAssets: (data) => dispatch(createProfileAssets(data)),
  onTogglePrivateMode: () => dispatch(togglePrivateMode()),
});

const ProfileSettingsPage = compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  ),
  injectIntl,
  withRouter
)(ProfileSettingsPageComponent);

export default ProfileSettingsPage;
