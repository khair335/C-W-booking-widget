import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';

import { useConfiguration } from '../../context/configurationContext';

import { FormattedMessage, injectIntl, intlShape } from '../../util/reactIntl';
import { propTypes } from '../../util/types';
import { ensureCurrentUser } from '../../util/data';

import { sendVerificationEmail } from '../../ducks/user.duck';
import { isScrollingDisabled } from '../../ducks/ui.duck';

import { H3, Page, UserNav, H5, LayoutSettingsSideNavigation } from '../../components';

import TopbarContainer from '../../containers/TopbarContainer/TopbarContainer';
import FooterContainer from '../../containers/FooterContainer/FooterContainer';

import ContactDetailsForm from './ContactDetailsForm/ContactDetailsForm';

import {
  saveContactDetails,
  saveContactDetailsClear,
  resetPassword,
} from './ContactDetailsPage.duck';
import css from './ContactDetailsPage.module.css';

export const ContactDetailsPageComponent = props => {
  const config = useConfiguration();
  const {
    saveEmailError,
    savePhoneNumberError,
    saveContactDetailsInProgress,
    currentUser,
    contactDetailsChanged,
    onChange,
    scrollingDisabled,
    sendVerificationEmailInProgress,
    sendVerificationEmailError,
    onResendVerificationEmail,
    onSubmitContactDetails,
    onResetPassword,
    resetPasswordInProgress,
    resetPasswordError,
    intl,
  } = props;
  const { userTypes = [] } = config.user;

  const user = ensureCurrentUser(currentUser);
  const currentEmail = user.attributes.email || '';
  const {
    firstName,
    lastName,
    publicData = {},
    protectedData = {},
  } = user?.attributes.profile;
  const userType = publicData?.userType;
  const currentPhoneNumber = protectedData.phoneNumber || '';
  const userTypeConfig = userType && userTypes.find(config => config.userType === userType);
  const isPhoneNumberIncluded = userTypeConfig?.defaultUserFields?.phoneNumber !== false;
  // ContactDetailsForm decides if it's allowed to show the input field.
  const phoneNumberMaybe =
    isPhoneNumberIncluded && currentPhoneNumber ? { phoneNumber: currentPhoneNumber } : {};

  const handleSubmit = values => {
    const {
      phoneNumber = null,
      firstName: updatedFirstName = '',
      lastName: updatedLastName = '',
    } = values;

    return onSubmitContactDetails({
      ...values,
      phoneNumber,
      firstName: updatedFirstName.trim(),
      lastName: updatedLastName.trim(),
      currentFirstName: firstName,
      currentLastName: lastName,
      currentEmail,
      currentPhoneNumber,
    });
  };

  const contactInfoForm = user.id ? (
    <ContactDetailsForm
      className={css.form}
      initialValues={{ email: currentEmail, firstName, lastName, ...phoneNumberMaybe }}
      saveEmailError={saveEmailError}
      savePhoneNumberError={savePhoneNumberError}
      currentUser={currentUser}
      onResendVerificationEmail={onResendVerificationEmail}
      onResetPassword={onResetPassword}
      onSubmit={handleSubmit}
      onChange={onChange}
      inProgress={saveContactDetailsInProgress}
      ready={contactDetailsChanged}
      sendVerificationEmailInProgress={sendVerificationEmailInProgress}
      sendVerificationEmailError={sendVerificationEmailError}
      resetPasswordInProgress={resetPasswordInProgress}
      resetPasswordError={resetPasswordError}
      userTypeConfig={userTypeConfig}
    />
  ) : null;

  const title = intl.formatMessage({ id: 'ContactDetailsPage.title' });

  return (
    <Page title={title} scrollingDisabled={scrollingDisabled}>
      <LayoutSettingsSideNavigation
        topbar={
          <>
            <TopbarContainer
              desktopClassName={css.desktopTopbar}
              mobileClassName={css.mobileTopbar}
            />
            <UserNav currentPage="ContactDetailsPage" />
          </>
        }
        sideNav={null}
        useAccountSettingsNav
        currentPage="ContactDetailsPage"
        footer={<FooterContainer />}
        className={css.layout}
      >
        <div className={css.content}>
          <H5 as="h1" className={css.heading}>
            <FormattedMessage id="ContactDetailsPage.heading" />
          </H5>
          {contactInfoForm}
        </div>
      </LayoutSettingsSideNavigation>
    </Page>
  );
};

ContactDetailsPageComponent.defaultProps = {
  saveEmailError: null,
  savePhoneNumberError: null,
  currentUser: null,
  sendVerificationEmailError: null,
  resetPasswordInProgress: false,
  resetPasswordError: null,
};

const { bool, func } = PropTypes;

ContactDetailsPageComponent.propTypes = {
  saveEmailError: propTypes.error,
  savePhoneNumberError: propTypes.error,
  saveContactDetailsInProgress: bool.isRequired,
  currentUser: propTypes.currentUser,
  contactDetailsChanged: bool.isRequired,
  onChange: func.isRequired,
  onSubmitContactDetails: func.isRequired,
  scrollingDisabled: bool.isRequired,
  sendVerificationEmailInProgress: bool.isRequired,
  sendVerificationEmailError: propTypes.error,
  onResendVerificationEmail: func.isRequired,
  resetPasswordInProgress: bool,
  resetPasswordError: propTypes.error,

  // from injectIntl
  intl: intlShape.isRequired,
};

const mapStateToProps = state => {
  // Topbar needs user info.
  const { currentUser, sendVerificationEmailInProgress, sendVerificationEmailError } = state.user;
  const {
    saveEmailError,
    savePhoneNumberError,
    saveContactDetailsInProgress,
    contactDetailsChanged,
    resetPasswordInProgress,
    resetPasswordError,
  } = state.ContactDetailsPage;
  return {
    saveEmailError,
    savePhoneNumberError,
    saveContactDetailsInProgress,
    currentUser,
    contactDetailsChanged,
    scrollingDisabled: isScrollingDisabled(state),
    sendVerificationEmailInProgress,
    sendVerificationEmailError,
    resetPasswordInProgress,
    resetPasswordError,
  };
};

const mapDispatchToProps = dispatch => ({
  onChange: () => dispatch(saveContactDetailsClear()),
  onResendVerificationEmail: () => dispatch(sendVerificationEmail()),
  onSubmitContactDetails: values => dispatch(saveContactDetails(values)),
  onResetPassword: values => dispatch(resetPassword(values)),
});

const ContactDetailsPage = compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  ),
  injectIntl
)(ContactDetailsPageComponent);

export default ContactDetailsPage;
