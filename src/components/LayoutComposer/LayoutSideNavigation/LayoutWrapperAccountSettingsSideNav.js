/**
 * This is a wrapper component for different Layouts.
 * Navigational 'aside' content should be added to this wrapper.
 */
import React, { useEffect } from 'react';
import { node, number, string, shape } from 'prop-types';
import { compose } from 'redux';

import { FormattedMessage } from '../../../util/reactIntl';
import { withViewport } from '../../../util/uiHelpers';

import { NamedLink, TabNav } from '../../../components';

import { createGlobalState } from './hookGlobalState';

import css from './LayoutSideNavigation.module.css';
import { useSelector } from 'react-redux';
import { AUDIENCE_USER_TYPE, CREATOR_USER_TYPE } from '../../../util/types';

const MAX_HORIZONTAL_NAV_SCREEN_WIDTH = 1023;

// Add global state for tab scrolling effect
const initialScrollState = { scrollLeft: 0 };
const { useGlobalState } = createGlobalState(initialScrollState);

// Horizontal scroll animation using element.scrollTo()
const scrollToTab = (currentPage, scrollLeft, setScrollLeft) => {
  const el = document.querySelector(`#${currentPage}Tab`);

  if (el) {
    // el.scrollIntoView doesn't work with Safari and it considers vertical positioning too.
    // This scroll behaviour affects horizontal scrolling only
    // and it expects that the immediate parent element is scrollable.
    const parent = el.parentElement;
    const parentRect = parent.getBoundingClientRect();
    const maxScrollDistance = parent.scrollWidth - parentRect.width;

    const hasParentScrolled = parent.scrollLeft > 0;
    const scrollPositionCurrent = hasParentScrolled ? parent.scrollLeft : scrollLeft;

    const tabRect = el.getBoundingClientRect();
    const diffLeftBetweenTabAndParent = tabRect.left - parentRect.left;
    const tabScrollPosition = parent.scrollLeft + diffLeftBetweenTabAndParent;

    const scrollPositionNew =
      tabScrollPosition > maxScrollDistance
        ? maxScrollDistance
        : parent.scrollLeft + diffLeftBetweenTabAndParent;

    const needsSmoothScroll = scrollPositionCurrent !== scrollPositionNew;

    if (!hasParentScrolled || (hasParentScrolled && needsSmoothScroll)) {
      // Ensure that smooth scroll animation uses old position as starting point after navigation.
      parent.scrollTo({ left: scrollPositionCurrent });
      // Scroll to new position
      parent.scrollTo({ left: scrollPositionNew, behavior: 'smooth' });
    }
    // Always keep track of new position (even if smooth scrolling is not applied)
    setScrollLeft(scrollPositionNew);
  }
};

const LayoutWrapperAccountSettingsSideNavComponent = props => {
  const [scrollLeft, setScrollLeft] = useGlobalState('scrollLeft');
  const { currentUser } = useSelector(state => state.user);
  const { userType } = (currentUser && currentUser.id && currentUser.attributes.profile.publicData) || {};
  useEffect(() => {
    const { currentPage, viewport } = props;
    let scrollTimeout = null;

    const { width } = viewport;
    const hasViewport = width > 0;
    const hasHorizontalTabLayout = hasViewport && width <= MAX_HORIZONTAL_NAV_SCREEN_WIDTH;

    // Check if scrollToTab call is needed (tab is not visible on mobile)
    if (hasHorizontalTabLayout) {
      scrollTimeout = window.setTimeout(() => {
        scrollToTab(currentPage, scrollLeft, setScrollLeft);
      }, 300);
    }

    return () => {
      // Update scroll position when unmounting
      const el = document.querySelector(`#${currentPage}Tab`);
      setScrollLeft(el?.parentElement?.scrollLeft);
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
    };
  });

  const { currentPage, isCreatorType } = props;

  const creatorTabs = [
    {
      text: <FormattedMessage id="LayoutWrapperAccountSettingsSideNav.ManageListingsTabTitle" />,
      selected: currentPage === 'ManageListingsPage',
      disabled: (isCreatorType && userType == AUDIENCE_USER_TYPE) ? true : false,
      id: 'ManageListingsPageTab',
      linkProps: {
        name: 'ManageListingsPage',
      },
    },
    {
      text: <FormattedMessage id="LayoutWrapperAccountSettingsSideNav.profileSettingsTabTitle" />,
      selected: currentPage === 'ProfileSettingsPage',
      id: 'ProfileSettingsPageTab',
      linkProps: {
        name: (isCreatorType && userType == AUDIENCE_USER_TYPE) ? 'AudienceProfileSettingsPage' : 'ProfileSettingsPage',
        params: (isCreatorType && userType == AUDIENCE_USER_TYPE) ? { userType: AUDIENCE_USER_TYPE } : {},
      },
    },
    {
      text: <FormattedMessage id="LayoutWrapperAccountSettingsSideNav.SalesTabTitle" />,
      selected: currentPage === 'InboxPage',
      disabled: (isCreatorType && userType == AUDIENCE_USER_TYPE) ? true : false,
      id: 'InboxPageTab',
      linkProps: {
        name: "InboxPage",
        params: { tab: 'sales' }
      },
    },
    {
      text: <FormattedMessage id="LayoutWrapperAccountSettingsSideNav.payoutTabTitle" />,
      selected: currentPage === 'StripePayoutPage',
      disabled: (isCreatorType && userType == AUDIENCE_USER_TYPE) ? true : false,
      id: 'StripePayoutPageTab',
      linkProps: {
        name: 'StripePayoutPage',
      },
    },
  ];

  const audienceTabs = [
    {
      text: <FormattedMessage id="LayoutWrapperAccountSettingsSideNav.profileSettingsTitle" />,
      selected: currentPage === 'ProfileSettingsPage',
      id: 'ProfileSettingsPageTab',
      linkProps: {
        name: (isCreatorType && userType == AUDIENCE_USER_TYPE) ? 'AudienceProfileSettingsPage' : 'ProfileSettingsPage',
        params: (isCreatorType && userType == AUDIENCE_USER_TYPE) ? { userType: AUDIENCE_USER_TYPE } : {},
      },
    },
    {
      text: <FormattedMessage id="LayoutWrapperAccountSettingsSideNav.contactDetailsTabTitle" />,
      selected: currentPage === 'ContactDetailsPage',
      id: 'ContactDetailsPageTab',
      linkProps: {
        name: 'ContactDetailsPage',
      },
    },
    {
      text: <FormattedMessage id="LayoutWrapperAccountSettingsSideNav.passwordTabTitle" />,
      selected: currentPage === 'PasswordChangePage',
      id: 'PasswordChangePageTab',
      linkProps: {
        name: 'PasswordChangePage',
      },
    },
    {
      text: <FormattedMessage id="LayoutWrapperAccountSettingsSideNav.paymentMethodsTabTitle" />,
      selected: currentPage === 'PaymentMethodsPage',
      id: 'PaymentMethodsPageTab',
      linkProps: {
        name: 'PaymentMethodsPage',
      },
    },
    {
      text: <FormattedMessage id="LayoutWrapperAccountSettingsSideNav.InboxPageTabTitle" />,
      selected: currentPage === 'InboxPage',
      id: 'InboxPageTab',
      linkProps: {
        name: "InboxPage",
        params: { tab: 'orders' }
      },
    },
  ];

  const tabs = (isCreatorType || userType === CREATOR_USER_TYPE) ? creatorTabs : audienceTabs;

  return <>
    <TabNav rootClassName={css.tabs} tabRootClassName={css.tab} tabs={tabs} />
    {/* {userType == CREATOR_USER_TYPE ? <NamedLink name="ContactDetailsPage" className={css.settingsLink}><span>Settings</span></NamedLink> : null} */}
  </>
};

LayoutWrapperAccountSettingsSideNavComponent.defaultProps = {
  className: null,
  rootClassName: null,
  children: null,
  currentPage: null,
};

LayoutWrapperAccountSettingsSideNavComponent.propTypes = {
  children: node,
  className: string,
  rootClassName: string,
  currentPage: string,

  // from withViewport
  viewport: shape({
    width: number.isRequired,
    height: number.isRequired,
  }).isRequired,
};

const LayoutWrapperAccountSettingsSideNav = compose(withViewport)(
  LayoutWrapperAccountSettingsSideNavComponent
);

export default LayoutWrapperAccountSettingsSideNav;
