import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { NamedLink } from '../../components';

import css from './TabNav.module.css';

const Tab = props => {
  const { className, id, disabled, text, selected, linkProps, isEditWizard, isDone } = props;
  const linkClasses = classNames(css.link, {
    [css.selectedLink]: selected,
    [css.disabled]: disabled,
    [css.editWizard]: isEditWizard,
    [css.done]: isDone,
  });

  return (
    <div id={id} className={className}>
      <NamedLink className={linkClasses} {...linkProps}>
        {text}
      </NamedLink>
    </div>
  );
};

Tab.defaultProps = { className: null, disabled: false, selected: false, isDone: false };

const { arrayOf, bool, node, object, string } = PropTypes;

Tab.propTypes = {
  id: string.isRequired,
  className: string,
  text: node.isRequired,
  disabled: bool,
  selected: bool,
  linkProps: object.isRequired,
  isDone: bool,
};

const TabNav = props => {
  const { className, rootClassName, tabRootClassName, tabs, isEditWizard } = props;
  const classes = classNames(rootClassName || css.root, className);
  const tabClasses = tabRootClassName || css.tab;

  // Find the index of the last non-disabled tab
  const lastActiveTabIndex = tabs.reduce((lastIndex, tab, index) => {
    return !tab.disabled ? index : lastIndex;
  }, -1);

  return (
    <nav className={classes}>
      {tabs.map((tab, index) => {
        const id = typeof tab.id === 'string' ? tab.id : `${index}`;
        // A tab is considered done if it's not disabled and not the last active tab
        const isDone = !tab.disabled && index < lastActiveTabIndex;
        return (
          <Tab
            key={id}
            id={id}
            className={tabClasses}
            {...tab}
            isEditWizard={isEditWizard}
            isDone={isDone}
          />
        );
      })}
    </nav>
  );
};

TabNav.defaultProps = {
  className: null,
  rootClassName: null,
  tabRootClassName: null,
  tabClassName: null,
};

TabNav.propTypes = {
  className: string,
  rootClassName: string,
  tabRootClassName: string,
  tabs: arrayOf(object).isRequired,
};

export default TabNav;
