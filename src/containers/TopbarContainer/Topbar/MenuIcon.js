import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import css from './Topbar.module.css';

const MenuIcon = props => {
  const { className, rootClassName } = props;
  const classes = classNames(rootClassName || css.rootMenuIcon, className);

  return (
    <svg className={classes} xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" fill="none">
      <path d="M6 36H42V31.9997H6V36ZM6 25.9997H42V22.0003H6V25.9997ZM6 12V16.0003H42V12H6Z" fill="white" />
    </svg>
  );
};

const { string } = PropTypes;

MenuIcon.defaultProps = {
  className: null,
  rootClassName: null,
};

MenuIcon.propTypes = {
  className: string,
  rootClassName: string,
};

export default MenuIcon;
