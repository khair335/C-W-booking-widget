import React, { useState, useEffect } from 'react';
import { bool, func, object, number, string } from 'prop-types';
import classNames from 'classnames';

import { FormattedMessage, intlShape } from '../../../../util/reactIntl';
import { ACCOUNT_SETTINGS_PAGES } from '../../../../routing/routeConfiguration';
import { AUDIENCE_USER_TYPE, CREATOR_USER_TYPE, FILM_PRODUCTS, propTypes, PURCHASES_TAB, SERIES_PRODUCTS, WISHLIST_TAB } from '../../../../util/types';
import {
  Avatar,
  InlineTextButton,
  LinkedLogo,
  Menu,
  MenuLabel,
  MenuContent,
  MenuItem,
  NamedLink,
} from '../../../../components';

import TopbarSearchForm from '../TopbarSearchForm/TopbarSearchForm';
import CustomLinksMenu from './CustomLinksMenu/CustomLinksMenu';

import css from './TopbarDesktop.module.css';
import IconCollection from '../../../../components/IconCollection/IconCollection';
import { CREATOR_SEARCH_ID, LISTING_SEARCH_ID, SERIES } from '../../../../constants';

const SignupLink = () => {
  return (
    <div>
      <NamedLink name="SignupForUserTypePage" params={{ userType: CREATOR_USER_TYPE }} className={classNames(css.signupLink)}>
        <span >
          <FormattedMessage id="TopbarDesktop.signup" />
        </span>
      </NamedLink>
    </div>
  );
};

const LoginLink = () => {
  return (
    <NamedLink name="LoginPage" className={classNames(css.topbarLink, css.loginLink)}>
      <span className={css.topbarLinkLabel}>
        <FormattedMessage id="TopbarDesktop.login" />
      </span>
    </NamedLink>
  );
};

const LibraryLink = () => {
  return (
    <NamedLink name="MyLibraryPage" params={{ tab: PURCHASES_TAB }} className={classNames(css.topbarLink, css.libraryLink)}>
      <span className={css.topbarLibraryLinkLabel}>
        <FormattedMessage id="TopbarDesktop.MyLibrary" />
      </span>
    </NamedLink>
  );
};

const WishlistLink = () => {
  return (
    <NamedLink name="MyLibraryPage" params={{ tab: WISHLIST_TAB }} className={classNames(css.topbarLink, css.libraryLink)}>
      <span className={css.topbarLibraryLinkLabel}>
        <FormattedMessage id="TopbarDesktop.Wishlist" />
      </span>
    </NamedLink>
  );
};


const InboxLink = ({ notificationCount, currentUserHasListings }) => {
  const notificationDot = notificationCount > 0 ? <div className={css.notificationDot} /> : null;
  return (
    <NamedLink
      className={css.topbarLink}
      name="InboxPage"
      params={{ tab: currentUserHasListings ? 'sales' : 'orders' }}
    >
      <span className={css.topbarLinkLabel}>
        <FormattedMessage id="TopbarDesktop.inbox" />
        {notificationDot}
      </span>
    </NamedLink>
  );
};

const ProfileMenu = ({ currentPage, currentUser, onLogout }) => {
  const currentPageClass = page => {
    const isAccountSettingsPage =
      page === 'AccountSettingsPage' && ACCOUNT_SETTINGS_PAGES.includes(currentPage);
    return currentPage === page || isAccountSettingsPage ? css.currentPage : null;
  };


  const { publicData, displayName } = currentUser?.attributes?.profile || {};
  const { userName } = publicData || {};

  return (
    <Menu>
      <MenuLabel className={css.profileMenuLabel} isOpenClassName={css.profileMenuIsOpen}>
        <div className={css.loggedInMenu}>
          {/* <Avatar className={css.avatar} user={currentUser} disableProfileLink /> */}
          <IconCollection icon="menu" />
        </div>
      </MenuLabel>
      <MenuContent className={css.profileMenuContent}>
        <MenuItem key="ManageListingsPage">
          <NamedLink
            className={classNames(css.menuLink, currentPageClass('ManageListingsPage'))}
            name="ManageListingsPage"
          >
            <span className={css.menuItemBorder} />
            <FormattedMessage id="TopbarDesktop.profileSettingsLink" />
          </NamedLink>
        </MenuItem>
        <MenuItem key="ProfilePage">
          <NamedLink
            className={classNames(css.menuLink, currentPageClass('ProfilePage'))}
            name="ProfileSettingsPage"
          >
            <span className={css.menuItemBorder} />
            <FormattedMessage id="TopbarDesktop.profilePageLink" />
          </NamedLink>
        </MenuItem>
        <MenuItem key="ManageListingsPage">
          <NamedLink
            className={classNames(css.menuLink, currentPageClass('ManageListingsPage'))}
            name="ManageListingsPage"
          >
            <span className={css.menuItemBorder} />
            <FormattedMessage id="TopbarDesktop.yourListingsLink" />
          </NamedLink>
        </MenuItem>
        <MenuItem key="InboxPage">
          <NamedLink
            className={classNames(css.menuLink, currentPageClass('InboxPage'))}
            name="InboxPage"
            params={{ tab: 'sales' }}
          >
            <span className={css.menuItemBorder} />
            <FormattedMessage id="TopbarDesktop.inboxLink" />
          </NamedLink>
        </MenuItem>
        {/* Films */}
        <MenuItem key="FilmsPage">
          <div className={css.divider} />
          <NamedLink
            className={classNames(css.menuLink, currentPageClass('FilmsPage'))}
            name="FilmsPage"
          >
            <span className={css.menuItemBorder} />
            <FormattedMessage id="TopbarDesktop.filmPageLink" />
          </NamedLink>
        </MenuItem>
        {/* Series */}
        <MenuItem key="SeriesPage">
          <NamedLink
            className={classNames(css.menuLink, currentPageClass('SeriesPage'))}
            name="SeriesPage"
          >
            <span className={css.menuItemBorder} />
            <FormattedMessage id="TopbarDesktop.seriesPageLink" />
          </NamedLink>
        </MenuItem>
        {/* Creators */}
        <MenuItem key="CreatorLandingPage">
          <NamedLink
            className={classNames(css.menuLink, currentPageClass('CreatorLandingPage'))}
            name="CreatorLandingPage"
            params={{ searchId: CREATOR_SEARCH_ID }}
          >
            <span className={css.menuItemBorder} />
            <FormattedMessage id="TopbarDesktop.creatorPageLink" />
          </NamedLink>
        </MenuItem>
        <MenuItem key="MyLibrary">
          <div className={css.divider} />
          <NamedLink
            className={classNames(css.menuLink, currentPageClass('MyLibrary'))}
            name="MyLibraryPage"
            params={{ tab: PURCHASES_TAB }}
          >
            <span className={css.menuItemBorder} />
            <FormattedMessage id="TopbarDesktop.myLibraryLink" />
          </NamedLink>
        </MenuItem>
        <MenuItem key="WishlistPage">
          <NamedLink
            className={classNames(css.menuLink, currentPageClass('WishlistPage'))}
            name="MyLibraryPage"
            params={{ tab: WISHLIST_TAB }}
          >
            <span className={css.menuItemBorder} />
            <FormattedMessage id="TopbarDesktop.wishlistLink" />
          </NamedLink>
        </MenuItem>
        <MenuItem key="Settings">
          <div className={css.divider} />
          <NamedLink
            className={classNames(css.menuLink, currentPageClass('Settings'))}
            name="ContactDetailsPage"
          >
            <span className={css.menuItemBorder} />
            <FormattedMessage id="TopbarDesktop.settingsLink" />
          </NamedLink>
        </MenuItem>
        <MenuItem key="logout">
          <InlineTextButton rootClassName={css.logoutButton} onClick={onLogout}>
            <span className={css.menuItemBorder} />
            <FormattedMessage id="TopbarDesktop.logout" />
          </InlineTextButton>
        </MenuItem>
      </MenuContent>
    </Menu>
  );
};

const AudienceProfileMenu = ({ currentPage, currentUser, onLogout }) => {
  const currentPageClass = page => {
    const isAccountSettingsPage =
      page === 'AccountSettingsPage' && ACCOUNT_SETTINGS_PAGES.includes(currentPage);
    return currentPage === page || isAccountSettingsPage ? css.currentPage : null;
  };

  return (
    <Menu>
      <MenuLabel className={css.profileMenuLabel} isOpenClassName={css.profileMenuIsOpen}>
        <div className={css.loggedInMenu}>
          {/* <Avatar className={css.avatar} user={currentUser} disableProfileLink /> */}
          <IconCollection icon="menu" />
        </div>
      </MenuLabel>
      <MenuContent className={css.profileMenuContent}>
        <MenuItem key="FilmsPage">
          <NamedLink
            className={classNames(css.menuLink, currentPageClass('FilmsPage'))}
            name="FilmsPage"
          >
            <span className={css.menuItemBorder} />
            <FormattedMessage id="TopbarDesktop.filmPageLink" />
          </NamedLink>
        </MenuItem>
        <MenuItem key="SeriesPage">
          <NamedLink
            className={classNames(css.menuLink, currentPageClass('SeriesPage'))}
            name="SeriesPage"
          >
            <span className={css.menuItemBorder} />
            <FormattedMessage id="TopbarDesktop.seriesPageLink" />
          </NamedLink>
        </MenuItem>
        <MenuItem key="CreatorLandingPage">
          <NamedLink
            className={classNames(css.menuLink, currentPageClass('CreatorLandingPage'))}
            name="CreatorLandingPage"
            params={{ searchId: CREATOR_SEARCH_ID }}
          >
            <span className={css.menuItemBorder} />
            <FormattedMessage id="TopbarDesktop.creatorPageLink" />
          </NamedLink>
        </MenuItem>
        <MenuItem key="MyLibrary">
          <div className={css.divider} />
          <NamedLink
            className={classNames(css.menuLink, currentPageClass('MyLibrary'))}
            name="MyLibraryPage"
            params={{ tab: PURCHASES_TAB }}
          >
            <span className={css.menuItemBorder} />
            <FormattedMessage id="TopbarDesktop.myLibraryLink" />
          </NamedLink>
        </MenuItem>
        <MenuItem key="WishlistPage">
          <NamedLink
            className={classNames(css.menuLink, currentPageClass('WishlistPage'))}
            name="MyLibraryPage"
            params={{ tab: WISHLIST_TAB }}
          >
            <span className={css.menuItemBorder} />
            <FormattedMessage id="TopbarDesktop.wishlistLink" />
          </NamedLink>
        </MenuItem>
        <MenuItem key="AudienceProfileSettingsPage">
          <NamedLink
            className={classNames(css.menuLink, currentPageClass('AudienceProfileSettingsPage'))}
            name="AudienceProfileSettingsPage"
            params={{ userType: AUDIENCE_USER_TYPE }}
          >
            <span className={css.menuItemBorder} />
            <FormattedMessage id="TopbarDesktop.beComeCreatorLink" />
          </NamedLink>
        </MenuItem>
        <MenuItem key="ProfileSettingsPage">
          <div className={css.divider} />
          <NamedLink
            className={classNames(css.menuLink, currentPageClass('ProfileSettingsPage'))}
            name="ProfileSettingsPage"
          >
            <span className={css.menuItemBorder} />
            <FormattedMessage id="TopbarDesktop.settingsLink" />
          </NamedLink>
        </MenuItem>
        <MenuItem key="logout">
          <InlineTextButton rootClassName={css.logoutButton} onClick={onLogout}>
            <span className={css.menuItemBorder} />
            <FormattedMessage id="TopbarDesktop.logout" />
          </InlineTextButton>
        </MenuItem>
      </MenuContent>
    </Menu>
  );
};

const NotSignedInMenu = ({ currentPage, currentUser, onLogout }) => {
  const currentPageClass = page => {
    const isAccountSettingsPage =
      page === 'AccountSettingsPage' && ACCOUNT_SETTINGS_PAGES.includes(currentPage);
    return currentPage === page || isAccountSettingsPage ? css.currentPage : null;
  };

  return (
    <Menu>
      <MenuLabel className={css.profileMenuLabel} isOpenClassName={css.profileMenuIsOpen}>
        <IconCollection icon="menu" />
      </MenuLabel>
      <MenuContent className={css.profileMenuContent}>
        <MenuItem key="FilmsPage">
          <NamedLink
            className={classNames(css.menuLink, currentPageClass('FilmsPage'))}
            name="FilmsPage"
          >
            <span className={css.menuItemBorder} />
            <FormattedMessage id="TopbarDesktop.filmPageLink" />
          </NamedLink>
        </MenuItem>
        <MenuItem key="SeriesPage">
          <NamedLink
            className={classNames(css.menuLink, currentPageClass('SeriesPage'))}
            name="SeriesPage"
          >
            <span className={css.menuItemBorder} />
            <FormattedMessage id="TopbarDesktop.seriesPageLink" />
          </NamedLink>
        </MenuItem>
        <MenuItem key="CreatorLandingPage">
          <NamedLink
            className={classNames(css.menuLink, currentPageClass('CreatorLandingPage'))}
            name="CreatorLandingPage"
            params={{ searchId: CREATOR_SEARCH_ID }}
          >
            <span className={css.menuItemBorder} />
            <FormattedMessage id="TopbarDesktop.creatorPageLink" />
          </NamedLink>
        </MenuItem>
        <MenuItem key="SignupForUserTypePage">
          <div className={css.divider} />
          <NamedLink
            className={classNames(css.menuLink, currentPageClass('SignupForUserTypePage'))}
            name="SignupForUserTypePage"
            params={{ userType: CREATOR_USER_TYPE }}
          >
            <span className={css.menuItemBorder} />
            <FormattedMessage id="TopbarDesktop.beComeCreatorLink" />
          </NamedLink>
        </MenuItem>
        <MenuItem key="logout">
          <div className={css.divider} />
          <NamedLink
            className={classNames(css.menuLink, currentPageClass('SignupForUserTypePage'))}
            name="SignupForUserTypePage"
            params={{ userType: CREATOR_USER_TYPE }}
          >
            <span className={css.menuItemBorder} />
            <FormattedMessage id="Join Now" />
          </NamedLink>
          <NamedLink
            className={classNames(css.menuLink, currentPageClass('ManageListingsPage'))}
            name="LoginPage"
          >
            <span className={css.menuItemBorder} />
            <FormattedMessage id="Topbar.login" />
          </NamedLink>
        </MenuItem>
      </MenuContent>
    </Menu>
  );
};

const TopbarDesktop = props => {
  const {
    className,
    config,
    customLinks,
    currentUser,
    currentPage,
    rootClassName,
    currentUserHasListings,
    notificationCount,
    intl,
    isAuthenticated,
    onLogout,
    onSearchSubmit,
    initialSearchFormValues,
    setShowDropdownOpen,
  } = props;
  const [mounted, setMounted] = useState(false);


  useEffect(() => {
    setMounted(true);
  }, []);

  const marketplaceName = config.marketplaceName;
  const authenticatedOnClientSide = mounted && isAuthenticated;
  const isAuthenticatedOrJustHydrated = isAuthenticated || !mounted;

  const giveSpaceForSearch = customLinks == null || customLinks?.length === 0;
  const isCreator = false;
  const isViewerLoggedIn = isAuthenticated;
  const classes = classNames(rootClassName || css.root, className, !isAuthenticated && css.headerwithoutLogin, isViewerLoggedIn && css.viewerLoggedInHeader, isCreator && css.fixedHeader);

  const inboxLinkMaybe = authenticatedOnClientSide ? (
    <InboxLink
      notificationCount={notificationCount}
      currentUserHasListings={currentUserHasListings}
    />
  ) : null;

  const CreatorLinkMaybe = authenticatedOnClientSide ? (
    <div className={css.topbarLink}>
      <span className={css.topbarLinkLabel}>

        <IconCollection icon="plus-icon" />
      </span>
    </div>
  ) : null;

  const { displayName, publicData } = currentUser?.attributes?.profile || {};
  const { userType, userName, userProfileImage } = publicData || {};


  const profileMenuProps = userName && userProfileImage ? {
    name: "ProfilePage",
    params: {
      id: currentUser?.id?.uuid,
      username: userName
    }
  } : { name: "ProfileSettingsPage" };

  const profileMenuMaybe = authenticatedOnClientSide ? (<>
    <NamedLink
      className={css.menuProfile}
      {...profileMenuProps}
    >
      <Avatar className={css.avatar} user={currentUser} disableProfileLink />
    </NamedLink>
    <ProfileMenu currentPage={currentPage} currentUser={currentUser} onLogout={onLogout} />
  </>

  ) : <NotSignedInMenu currentPage={currentPage} />;

  const audienceProfileMenuMaybe = authenticatedOnClientSide ? (
    <AudienceProfileMenu currentPage={currentPage} currentUser={currentUser} onLogout={onLogout} />
  ) : <NotSignedInMenu currentPage={currentPage} />;

  const signupLinkMaybe = isAuthenticatedOrJustHydrated ? null : <SignupLink />;
  const loginLinkMaybe = isAuthenticatedOrJustHydrated ? null : <LoginLink />;
  const libraryLinkMaybe =
    isAuthenticatedOrJustHydrated && userType === AUDIENCE_USER_TYPE ? <LibraryLink /> : null;
  const wishlistLinkMaybe =
    isAuthenticatedOrJustHydrated && userType === AUDIENCE_USER_TYPE ? <WishlistLink /> : null;

  return (
    <nav className={classes}>
      <LinkedLogo
        className={css.logoLink}
        layout="desktop"
        alt={intl.formatMessage({ id: 'TopbarDesktop.logo' }, { marketplaceName })}
        linkToExternalSite={config?.topbar?.logoLink}
      />
      <TopbarSearchForm
        className={classNames(css.searchLink, { [css.takeAvailableSpace]: giveSpaceForSearch })}
        desktopInputRoot={css.topbarSearchWithLeftPadding}
        onSubmit={onSearchSubmit}
        initialValues={initialSearchFormValues}
        appConfig={config}
        setShowDropdownOpen={setShowDropdownOpen}
      />

      {(authenticatedOnClientSide && userType == CREATOR_USER_TYPE) ? <CustomLinksMenu
        currentPage={currentPage}
        customLinks={customLinks}
        intl={intl}
        hasClientSideContentReady={authenticatedOnClientSide || !isAuthenticatedOrJustHydrated}
      /> : null}
      {/* {inboxLinkMaybe} */}
      {/* {CreatorLinkMaybe} */}
      {loginLinkMaybe}
      {signupLinkMaybe}
      {libraryLinkMaybe}
      {wishlistLinkMaybe}
      {userType == CREATOR_USER_TYPE ? profileMenuMaybe : audienceProfileMenuMaybe}
    </nav>
  );
};

TopbarDesktop.defaultProps = {
  rootClassName: null,
  className: null,
  currentUser: null,
  currentPage: null,
  notificationCount: 0,
  initialSearchFormValues: {},
  config: null,
};

TopbarDesktop.propTypes = {
  rootClassName: string,
  className: string,
  currentUserHasListings: bool.isRequired,
  currentUser: propTypes.currentUser,
  currentPage: string,
  isAuthenticated: bool.isRequired,
  onLogout: func.isRequired,
  notificationCount: number,
  onSearchSubmit: func.isRequired,
  initialSearchFormValues: object,
  intl: intlShape.isRequired,
  config: object,
};

export default TopbarDesktop;