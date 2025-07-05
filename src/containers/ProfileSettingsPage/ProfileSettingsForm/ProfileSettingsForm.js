import React, { Component, useCallback, useEffect, useRef, useState } from 'react';
import { bool, string } from 'prop-types';
import { compose } from 'redux';
import { Field, Form as FinalForm } from 'react-final-form';
import isEqual from 'lodash/isEqual';
import classNames from 'classnames';
import arrayMutators from 'final-form-arrays';

import { FormattedMessage, injectIntl, intlShape } from '../../../util/reactIntl';
import { ensureCurrentUser } from '../../../util/data';
import { AUDIENCE_USER_TYPE, CREATOR_USER_TYPE, CUSTOM_ROLE, propTypes } from '../../../util/types';
import * as validators from '../../../util/validators';
import { isUploadImageOverLimitError } from '../../../util/errors';
import { getPropsForCustomUserFieldInputs } from '../../../util/userHelpers';

import {
  Form,
  Avatar,
  Button,
  ImageFromFile,
  IconSpinner,
  FieldTextInput,
  H4,
  CustomExtendedDataField,
  NamedLink,
  DragAndDrop,
} from '../../../components';

import css from './ProfileSettingsForm.module.css';
import IconCollection from '../../../components/IconCollection/IconCollection';
import { FieldSelectCategory } from '../../EditListingPage/EditListingWizard/EditListingDetailsPanel/EditListingDetailsForm';
import { ASSET_USER_PROFILE_BANNER, ASSET_USER_PROFILE_IMAGE } from '../../../constants';

const ACCEPT_IMAGES = 'image/*';
const UPLOAD_CHANGE_DELAY = 2000; // Show spinner so that browser has time to load img srcset

const USER_NAME_MAX_LENGTH = 20;
const USER_NAME_MIN_LENGTH = 3;

const DISPLAY_NAME_MAX_LENGTH = 20;
const DISPLAY_NAME_MIN_LENGTH = 3;

const BIO_MAX_LENGTH = 500;

const imageMinimumWidth = 250;
const imageMinimumHeight = 250;
const bannerMinimumWidth = 800;
const bannerMinimumHeight = 400;

const DisplayNameMaybe = props => {
  const { userTypeConfig, intl, userType, isCreatorType } = props;

  const isDisabled = userTypeConfig?.defaultUserFields?.displayName === false;
  if (isDisabled) {
    return null;
  }

  const { required } = userTypeConfig?.displayNameSettings || {};
  const isRequired = required === true;

  const maxLengthMessage = intl.formatMessage(
    { id: 'EditListingDetailsForm.maxLength' },
    {
      maxLength: DISPLAY_NAME_MAX_LENGTH,
    }
  );
  const maxLength20Message = validators.maxLength(maxLengthMessage, DISPLAY_NAME_MAX_LENGTH);

  const minLengthMessage = intl.formatMessage(
    { id: 'EditListingDetailsForm.minLength' },
    {
      minLength: DISPLAY_NAME_MIN_LENGTH,
    }
  );
  const minLength3Message = validators.minLength(minLengthMessage, DISPLAY_NAME_MIN_LENGTH);

  const validateMaybe = {
    validate: validators.composeValidators(validators.required(
      intl.formatMessage({
        id: 'ProfileSettingsForm.displayNameRequired',
      })
    ), maxLength20Message, minLength3Message),
  };

  return (
    <div className={css.sectionContainer}>
      {/* {(userType == AUDIENCE_USER_TYPE && !isCreatorType) ? <H4 as="h2" className={css.audienceTitle}>
        <FormattedMessage id="ProfileSettingsForm.displayNameHeading" />
      </H4> : null} */}
      <FieldTextInput
        className={css.row}
        type="text"
        id="displayName"
        name="displayName"
        label={intl.formatMessage({
          id: 'ProfileSettingsForm.displayNameLabel',
        })}
        placeholder={intl.formatMessage({
          id: 'ProfileSettingsForm.displayNamePlaceholder',
        })}
        {...validateMaybe}
        maxLength={DISPLAY_NAME_MAX_LENGTH}
        minLength={3}
      />
      {/* <p className={css.extraInfo}>
        <FormattedMessage id="ProfileSettingsForm.displayNameInfo" />
      </p> */}
    </div>
  );
};

// Simple debounce hook
const useDebounce = (func, delay) => {
  const timerId = useRef(null);

  // The debounced function
  const debouncedFunction = useCallback((...args) => {
    // Clear the existing timer
    if (timerId.current) {
      clearTimeout(timerId.current);
    }

    // Set a new timer
    timerId.current = setTimeout(() => {
      func(...args); // Call the original function after the delay
    }, delay);
  }, [func, delay]);

  // Clean up the timer when the component is unmounted
  useEffect(() => {
    return () => {
      if (timerId.current) {
        clearTimeout(timerId.current);
      }
    };
  }, []);

  return debouncedFunction;
};

class ProfileSettingsFormComponent extends Component {
  constructor(props) {
    super(props);

    this.uploadDelayTimeoutId = null;
    this.state = { uploadDelay: false, profileImageError: {}, profileBannerError: {} };
    this.submittedValues = {};
  }

  componentDidUpdate(prevProps) {
    // Upload delay is additional time window where Avatar is added to the DOM,
    // but not yet visible (time to load image URL from srcset)
    if (prevProps.uploadInProgress && !this.props.uploadInProgress) {
      this.setState({ uploadDelay: true });
      this.uploadDelayTimeoutId = window.setTimeout(() => {
        this.setState({ uploadDelay: false });
      }, UPLOAD_CHANGE_DELAY);
    }
  }

  componentWillUnmount() {
    window.clearTimeout(this.uploadDelayTimeoutId);
  }

  render() {
    return (
      <FinalForm
        {...this.props}
        mutators={{ ...arrayMutators }}
        render={fieldRenderProps => {
          const {
            className,
            currentUser,
            handleSubmit,
            intl,
            invalid,
            onImageUpload,
            pristine,
            profileImage,
            rootClassName,
            updateInProgress,
            updateProfileError,
            uploadImageError,
            uploadInProgress,
            form,
            formId,
            marketplaceName,
            values,
            userFields,
            userTypeConfig,
            onValidateUserName,
            userNameExist,
            profileBanner,
            onBannerImageUpload,
            categoryPrefix,
            selectableCategories,
            onCreateProfileAssets,
            userProfileAssetsInProgress,
            isCreatorType,
            updateViewInProgress
          } = fieldRenderProps;
          const { userProfileImage, userProfileBanner } = userProfileAssetsInProgress || {};

          const [allCategoriesChosen, setAllCategoriesChosen] = useState(false);
          const user = ensureCurrentUser(currentUser);
          const { publicData } = user?.attributes.profile || {};
          const { userType, userName } = publicData || {};

          // Bio
          const bioLabel = intl.formatMessage({
            id: 'ProfileSettingsForm.bioLabel',
          });
          const bioPlaceholder = intl.formatMessage({
            id: 'ProfileSettingsForm.bioPlaceholder',
          });

          // User name
          const userNameLabel = intl.formatMessage({
            id: 'ProfileSettingsForm.userNameLabel',
          });
          const usernameInvalidFormatMessage = intl.formatMessage({
            id: 'ProfileSettingsForm.usernameInvalidFormat',
          });
          

          const userNameRequiredMessage = intl.formatMessage({
            id: 'ProfileSettingsForm.userNameRequired',
          });
          const userNameRequired = validators.required(userNameRequiredMessage);

          const maxLengthMessage = intl.formatMessage(
            { id: 'EditListingDetailsForm.maxLength' },
            {
              maxLength: USER_NAME_MAX_LENGTH,
            }
          );
          const maxLength20Message = validators.maxLength(maxLengthMessage, USER_NAME_MAX_LENGTH);

          const minLengthMessage = intl.formatMessage(
            { id: 'EditListingDetailsForm.minLength' },
            {
              minLength: USER_NAME_MIN_LENGTH,
            }
          );
          const minLength3Message = validators.minLength(minLengthMessage, USER_NAME_MIN_LENGTH);

          const userNameTakenMessage = intl.formatMessage({
            id: 'ProfileSettingsForm.userNameTakenMessage',
          });

          const useNameValidate = validators.userNameValidator(userNameTakenMessage, userNameExist)

          const uploadingOverlay =
            (uploadInProgress || this.state.uploadDelay || userProfileImage || userProfileBanner) ? (
              <div className={css.uploadingImageOverlay}>
                <IconSpinner />
              </div>
            ) : null;

          const hasUploadError = !!uploadImageError && !uploadInProgress;
          const errorClasses = classNames({ [css.avatarUploadError]: hasUploadError });
          const transientUserProfileImage = profileImage.uploadedImage || user.profileImage;
          const transientUser = { ...user, profileImage: transientUserProfileImage };

          const transientUserProfileBanner = (profileBanner?.uploadedImage || user?.profile?.publicaData?.profile_banner);

          const transientUserForBanner = { ...user, profileImage: transientUserProfileBanner };


          // Ensure that file exists if imageFromFile is used
          const fileExists = !!profileImage.file;
          const fileUploadInProgress = uploadInProgress && fileExists;
          const delayAfterUpload = (profileImage.imageId && this.state.uploadDelay);

          const imageFromFile =
            (fileExists && (fileUploadInProgress || delayAfterUpload)) || userProfileImage ? (
              <ImageFromFile
                id={profileImage.id}
                className={errorClasses}
                rootClassName={css.uploadingImage}
                aspectWidth={1}
                aspectHeight={1}
                file={profileImage.file}
              >
                {uploadingOverlay}
              </ImageFromFile>
            ) : null;

          const imageFromBannerFile =
            !!profileBanner.file && (uploadInProgress && !!profileBanner.file || (profileBanner.imageId && this.state.uploadDelay)) || userProfileBanner ? (
              <ImageFromFile
                id={profileBanner.id}
                className={errorClasses}
                rootClassName={css.uploadingImage}
                aspectWidth={1}
                aspectHeight={1}
                file={profileBanner.file}
              >
                {uploadingOverlay}
              </ImageFromFile>
            ) : null;
          // Avatar is rendered in hidden during the upload delay
          // Upload delay smoothes image change process:
          // responsive img has time to load srcset stuff before it is shown to user.
          const avatarClasses = classNames(errorClasses, css.avatar, {
            [css.avatarInvisible]: this.state.uploadDelay,
          });
          const avatarComponent =
            !(fileUploadInProgress || userProfileImage) && profileImage.imageId ? (
              <Avatar
                className={avatarClasses}
                renderSizes="(max-width: 767px) 96px, 240px"
                user={transientUser}
                disableProfileLink
              />
            ) : null;

          const avatarComponentForBanner =
            (!(uploadInProgress && !!profileBanner.file || userProfileBanner)) && profileBanner?.imageId ? (
              <Avatar
                className={avatarClasses}
                renderSizes="(max-width: 767px) 96px, 240px"
                user={transientUserForBanner}
                disableProfileLink
                isBannerImage={true}
              />
            ) : null;

          const chooseAvatarLabel =
            (profileImage.imageId && values.profileImage) || fileUploadInProgress || userProfileImage ? (
              <div className={css.avatarContainer}>
                {imageFromFile}
                {avatarComponent}
              </div>
            ) : (
              <div className={css.avatarPlaceholder}>
                <div className={css.avatarPlaceholderText}>
                  <FormattedMessage id="ProfileSettingsForm.addYourProfilePicture" />
                </div>
                <div className={css.avatarPlaceholderTextMobile}>
                  <FormattedMessage id="ProfileSettingsForm.addYourProfilePictureMobile" />
                </div>
              </div>
            );

          const chooseBannerAvatarLabel = (profileBanner?.imageId && values.profile_banner) || fileUploadInProgress || userProfileBanner ?
            <div className={css.avatarContainer}>
              {imageFromBannerFile}
              {avatarComponentForBanner}
            </div>
            :
            (
              <div className={css.avatarPlaceholder}>
                <IconCollection icon="icon-image-upload" />
                <h4 className={css.avatarPlaceholderHeading}>
                  <FormattedMessage id="ProfileSettingsForm.addYourProfileBannerPicture" />
                </h4>

                <h5 className={css.avatarPlaceholderSubHeading}>
                  <FormattedMessage id="ProfileSettingsForm.addYourProfileBanner" />
                </h5>

                <div className={css.avatarPlaceholderTextMobile}>
                  <FormattedMessage id="ProfileSettingsForm.addYourProfileBannerPictureMobile" />
                </div>
              </div>
            );

          const submitError = updateProfileError ? (
            <div className={css.error}>
              <FormattedMessage id="ProfileSettingsForm.updateProfileFailed" />
            </div>
          ) : null;

          const classes = classNames(rootClassName || css.root, className, (userType == AUDIENCE_USER_TYPE && !isCreatorType) && css.audienceProfileRoot);
          const submitInProgress = updateInProgress;
          const submittedOnce = Object.keys(this.submittedValues).length > 0;
          const pristineSinceLastSubmit = submittedOnce && isEqual(values, this.submittedValues);
          const submitDisabled =
            invalid || pristineSinceLastSubmit || uploadInProgress || submitInProgress || !values?.userProfileImage || (!values?.userProfileBanner && userType == CREATOR_USER_TYPE) || isEqual(form.getState().values, form.getState().initialValues);

          const userFieldProps = getPropsForCustomUserFieldInputs(
            userFields,
            intl,
            userTypeConfig?.userType,
            false
          );

          // Create a debounced version of the validation function
          const debouncedForUserName = useDebounce(onValidateUserName, 500);


          const handleImageFileUpload = (event, assetName, formApi) => {
            const file = event?.target?.files ? event.target.files[0] : event[0]; // Get the uploaded file

            // Check if a file was selected
            if (!file) {
              console.log("No file selected.");
              this.setState(assetName == ASSET_USER_PROFILE_IMAGE ? { profileImageError: { error: "Please select a file.", fileType: assetName } } : { profileBannerError: { error: "Please select a file.", fileType: assetName } });
              return; // Stop execution if no file is selected
            }

            // Check if file size is exactly 1 MB (1 MB = 1048576 bytes)
            if (file.size > 1048576) {
              this.setState(assetName == ASSET_USER_PROFILE_IMAGE ? { profileImageError: { error: "File size must be 1 MB or less", fileType: assetName } } : { profileBannerError: { error: "File size must be 1 MB or less", fileType: assetName } });
              return; // Stop execution if the file size exceeds the limit
            }

            // Check if the file is an image by inspecting the MIME type
            const validImageTypes = ["image/jpeg", "image/png"];
            if (!validImageTypes.includes(file.type)) {
              console.log("The selected file is not an image.");
              this.setState(assetName == ASSET_USER_PROFILE_IMAGE ? { profileImageError: { error: "Please upload an image file (JPEG or PNG).", fileType: assetName } } : { profileBannerError: { error: "Please upload an image file (JPEG or PNG).", fileType: assetName } });
              return; // Stop execution if the file type is invalid
            }

            // Validate the resolutions
            const imageElement = document.createElement("img");
            imageElement.src = URL.createObjectURL(file);

            imageElement.onload = () => {
              const imageWidth = imageElement.naturalWidth;
              const imageHeight = imageElement.naturalHeight;

              // Check resolution for profile image
              if (assetName === ASSET_USER_PROFILE_IMAGE) {
                if (imageWidth < imageMinimumWidth || imageHeight < imageMinimumHeight) {
                  this.setState({
                    profileImageError: { error: `Please upload an image with a minimum resolution of ${imageMinimumWidth}x${imageMinimumHeight} pixels.`, fileType: assetName },
                  });
                  return; // Stop execution if resolution is invalid
                }
              }

              // Check resolution for profile banner
              if (assetName === ASSET_USER_PROFILE_BANNER) {
                if (imageWidth < bannerMinimumWidth || imageHeight < bannerMinimumHeight) {
                  this.setState({
                    profileBannerError: { error: `Please upload a banner image with a minimum resolution of ${bannerMinimumWidth}x${bannerMinimumHeight} pixels.`, fileType: assetName },
                  });
                  return; // Stop execution if resolution is invalid
                }
              }

              // Proceed with asset creation only if all validations pass
              const tempId = `${file.name}_${Date.now()}`;
              const imageType =
                assetName === ASSET_USER_PROFILE_BANNER ? "profileBanner" : "profileImage";

              const uploadHandler =
                assetName === ASSET_USER_PROFILE_BANNER ? onBannerImageUpload : onImageUpload;

              Promise.all([
                uploadHandler({ id: tempId, file, imageType }),
                onCreateProfileAssets({
                  file,
                  userId: user.id.uuid,
                  assetName,
                }),
                this.setState(assetName === ASSET_USER_PROFILE_IMAGE ? { profileImageError: null } : { profileBannerError: null }),
              ])
                .then(([uploadData, assetData]) => {
                  if (uploadData && assetData) {
                    formApi.change(assetName, assetData);
                  } else {
                    this.setState(assetName == ASSET_USER_PROFILE_IMAGE ? { profileImageError: { error: "An error occurred while uploading the image.", fileType: assetName } } : { profileBannerError: { error: "An error occurred while uploading the image.", fileType: assetName } });
                  }
                })
                .catch((error) => {
                  console.error("Error uploading image:", error);
                  this.setState(assetName == ASSET_USER_PROFILE_IMAGE ? {
                    profileImageError: { error: "An error occurred while uploading the image. Please try again.", fileType: assetName },
                  } : {
                    profileBannerError: { error: "An error occurred while uploading the image. Please try again.", fileType: assetName },
                  });
                });
            };

            imageElement.onerror = () => {
              console.error("Failed to load the image for resolution validation.");
              this.setState(assetName == ASSET_USER_PROFILE_IMAGE ? {
                profileImageError: { error: "An error occurred while processing the image. Please try again.", fileType: assetName },
              } : {
                profileBannerError: { error: "An error occurred while processing the image. Please try again.", fileType: assetName },
              });
            };
          };

          return (
            <Form
              className={classes}
              onSubmit={e => {
                this.submittedValues = values;
                handleSubmit(e);
              }}
            >
              {userType == AUDIENCE_USER_TYPE && !isCreatorType ? (
                <H4 as="h2" className={css.audienceTitle}>
                  <FormattedMessage id="ProfileSettingsForm.yourProfilePicture" />
                </H4>
              ) : null}
              <div
                className={classNames(
                  css.ProfileImgContainer,
                  userType == AUDIENCE_USER_TYPE && !isCreatorType && css.audienceProfile
                )}
              >
                <div>
                  <span className={css.profileSizeText}><FormattedMessage id='ProfileSettingsForm.profileSizeRecommendation' /></span>
                  <Field
                    accept={ACCEPT_IMAGES}
                    id="profileImage"
                    name="profileImage"
                    label={chooseAvatarLabel}
                    type="file"
                    form={null}
                    uploadImageError={uploadImageError}
                    disabled={uploadInProgress}
                    validate={validators.composeValidators(userNameRequired)}
                  >
                    {fieldProps => {
                      const {
                        accept,
                        id,
                        input,
                        label,
                        disabled,
                        uploadImageError,
                        userProfileAssetsError,
                      } = fieldProps;
                      const { name, type } = input;
                      const onChange = e => {
                        const file = e.target.files[0];
                        form.change(`profileImage`, file);
                        form.blur(`profileImage`);
                        if (file != null) {
                          handleImageFileUpload(e, ASSET_USER_PROFILE_IMAGE, form);
                        }
                      };

                      let error = null;

                      if (isUploadImageOverLimitError(uploadImageError)) {
                        error = (
                          <div className={css.error}>
                            <FormattedMessage id="ProfileSettingsForm.imageUploadFailedFileTooLarge" />
                          </div>
                        );
                      } else if (uploadImageError || userProfileAssetsError) {
                        error = (
                          <div className={css.error}>
                            <FormattedMessage id="ProfileSettingsForm.imageUploadFailed" />
                          </div>
                        );
                      }

                      return (
                        <div className={css.uploadAvatarWrapper}>
                          {(values.profileImage && !this.state.profileImageError?.error) ? (
                            <div
                              className={css.changeAvatar}
                              onClick={() => {
                                form.change('profileImage', null);
                              }}
                            >
                              <IconCollection icon="icon-close-white" />
                            </div>
                          ) : null}
                          <label className={css.label} htmlFor={id}>
                            {label}
                          </label>
                          <input
                            accept={accept}
                            id={id}
                            name={name}
                            className={css.uploadAvatarInput}
                            disabled={disabled}
                            onChange={onChange}
                            type={type}
                          />
                          {error}
                        </div>
                      );
                    }}
                  </Field>
                </div>
                {userType == AUDIENCE_USER_TYPE ? <span className={css.uploadError}>{this.state.profileImageError?.error}</span> : null}
                <div className={css.profileNameContainer}>
                  <div
                    className={classNames(
                      css.nameContainer,
                      userType == AUDIENCE_USER_TYPE &&
                      !isCreatorType &&
                      css.audienceUserNameContainer
                    )}
                  >
                    <div className={css.firstName}>
                      <DisplayNameMaybe
                        userTypeConfig={userTypeConfig}
                        intl={intl}
                        userType={userType}
                        isCreatorType={isCreatorType}
                      />
                      <div className={classNames(css.charaterCountBio)}>
                        {values?.displayName ? values?.displayName?.length : 0}/{DISPLAY_NAME_MAX_LENGTH}
                      </div>
                    </div>
                    {isCreatorType ? (
                      <div className={classNames(css.lastName, css.userNameContainer)}>
                        <span className={css.atSymbol}>@</span>
                        <FieldTextInput
                          type="text"
                          id="userName"
                          name="userName"
                          placeholder="username"
                          label={userNameLabel}
                          validate={validators.composeValidators(
                            validators.validUsernameFormat(usernameInvalidFormatMessage),
                            userNameRequired,
                            maxLength20Message,
                            minLength3Message,
                            useNameValidate,
                          )}
                          onKeyUp={event => {
                            const userName = event.target.value;
                            if (userName) debouncedForUserName({ userName: `@${userName}` });
                          }}
                          maxLength={USER_NAME_MAX_LENGTH}
                          minLength={2}
                        />
                        <div className={classNames(css.charaterCountBio)}>
                          {values?.userName ? values?.userName?.length : 0}/{USER_NAME_MAX_LENGTH}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* <div className={css.tip}>
                  <FormattedMessage id="ProfileSettingsForm.tip" />
                </div>
                <div className={css.fileInfo}>
                  <FormattedMessage id="ProfileSettingsForm.fileInfo" />
                </div> */}
              </div>
              {userType == CREATOR_USER_TYPE ? <span className={css.uploadError}>{this.state.profileImageError?.error}</span> : null}
              {isCreatorType ? (
                <>
                  <div className={classNames(css.sectionContainer)}>
                    <FieldTextInput
                      type="textarea"
                      id="bio"
                      name="bio"
                      label={`${bioLabel}`}
                      validate={validators.composeValidators(userNameRequired)}
                      placeholder={bioPlaceholder}
                      maxLength={BIO_MAX_LENGTH}
                    />
                    <div className={classNames(css.charaterCountBio)}>
                      {values?.bio ? values?.bio?.length : 0}/{BIO_MAX_LENGTH}
                    </div>
                  </div>
                  <div className={classNames(css.sectionContainer, css.lastSection)}>
                    <FieldSelectCategory
                      values={values}
                      prefix={categoryPrefix}
                      listingCategories={selectableCategories}
                      formApi={form}
                      intl={intl}
                      allCategoriesChosen={allCategoriesChosen}
                      setAllCategoriesChosen={setAllCategoriesChosen}
                      tab={'profile'}
                    />
                    {values.subRole == CUSTOM_ROLE && (
                      <FieldTextInput
                        id={`${formId}custom_role`}
                        name="custom_role"
                        className={css.description}
                        type="text"
                        label={intl.formatMessage({ id: 'EditListingCreditsForm.customRole' })}
                        maxLength={20}
                        minLength={3}
                      />
                    )}
                    {userFieldProps.map(fieldProps => (
                      <CustomExtendedDataField {...fieldProps} formId={formId} />
                    ))}
                  </div>
                  <DragAndDrop
                    acceptedFileType="image"
                    handleDrop={file => {
                      form.change(`profile_banner`, file);
                      form.blur(`profile_banner`);
                      if (file != null) {
                        handleImageFileUpload(file, ASSET_USER_PROFILE_BANNER, form);
                      }
                    }}
                  >
                    <Field
                      accept={ACCEPT_IMAGES}
                      id="profile_banner"
                      name="profile_banner"
                      label={chooseBannerAvatarLabel}
                      type="file"
                      form={null}
                      uploadImageError={uploadImageError}
                      disabled={uploadInProgress}
                    >
                      {fieldProps => {
                        const { accept, id, input, label, disabled, uploadImageError } = fieldProps;
                        const { name, type } = input;
                        const onChange = e => {
                          const file = e.target.files[0];
                          form.change(`profile_banner`, file);
                          form.blur(`profile_banner`);
                          if (file != null) {
                            handleImageFileUpload(e, ASSET_USER_PROFILE_BANNER, form);
                          }
                        };

                        let error = null;

                        if (isUploadImageOverLimitError(uploadImageError)) {
                          error = (
                            <div className={css.error}>
                              <FormattedMessage id="ProfileSettingsForm.imageUploadFailedFileTooLarge" />
                            </div>
                          );
                        } else if (uploadImageError) {
                          error = (
                            <div className={css.error}>
                              <FormattedMessage id="ProfileSettingsForm.imageUploadFailed" />
                            </div>
                          );
                        }

                        return (
                          <>
                            <FormattedMessage id="ProfileSettingsForm.profileBannerLabel" />
                            <div className={css.bannerWrapper}>
                              {(values.profile_banner && !this.state.profileBannerError?.error) ? (
                                <div
                                  className={css.changeAvatar}
                                  onClick={() => {
                                    form.change('profile_banner', null);
                                  }}
                                >
                                  <IconCollection icon="icon-close-white" />
                                </div>
                              ) : null}
                              <label className={css.Bannerlabel} htmlFor={id}>
                                {label}
                              </label>
                              <input
                                accept={accept}
                                id={id}
                                name={name}
                                className={css.uploadAvatarInput}
                                disabled={disabled}
                                onChange={onChange}
                                type={type}
                              />
                              {error}
                            </div>
                          </>
                        );
                      }}
                    </Field>
                  </DragAndDrop>
                </>
              ) : null}
              <span className={css.uploadError}>{this.state.profileBannerError?.error}</span>

              {submitError}
              <div className={css.buttonsGroup}>
                <Button
                  className={css.submitButton}
                  type="submit"
                  inProgress={updateViewInProgress ? false : submitInProgress}
                  disabled={submitDisabled}
                  // ready={pristineSinceLastSubmit}
                >
                  {isCreatorType ? (
                    <FormattedMessage id="ProfileSettingsForm.saveChanges" />
                  ) : (
                    <FormattedMessage id="ProfileSettingsForm.saveProfileChanges" />
                  )}
                </Button>

                {isCreatorType && userName ? (
                  <Button
                    type="button"
                    inProgress={updateViewInProgress}
                    className={css.saveDraftButton}
                    onClick={() => {
                      form.change('saveAndViewProfile', true);
                      form.submit();
                    }}
                  >
                    <FormattedMessage id="ProfileSettingsForm.viewProfile" />
                  </Button>
                ) : null}
              </div>
            </Form>
          );
        }}
      />
    );
  }
}

ProfileSettingsFormComponent.defaultProps = {
  rootClassName: null,
  className: null,
  formId: null,
  uploadImageError: null,
  updateProfileError: null,
  updateProfileReady: false,
};

ProfileSettingsFormComponent.propTypes = {
  rootClassName: string,
  className: string,
  formId: string,

  uploadImageError: propTypes.error,
  uploadInProgress: bool.isRequired,
  updateInProgress: bool.isRequired,
  updateProfileError: propTypes.error,
  updateProfileReady: bool,

  // from injectIntl
  intl: intlShape.isRequired,
};

const ProfileSettingsForm = compose(injectIntl)(ProfileSettingsFormComponent);

ProfileSettingsForm.displayName = 'ProfileSettingsForm';

export default ProfileSettingsForm;
