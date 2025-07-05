import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import css from './Topbar.module.css';

const SearchIcon = props => {
  const { className, rootClassName } = props;
  const classes = classNames(rootClassName || css.rootSearchIcon, className);

  return (
    <svg
      className={classes}
      style={{fill:"transparent"}}
      xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25" fill="none">
      <path d="M8.26318 17.3176L1.91866 23.4263" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <ellipse cx="9.07895" cy="8.74155" rx="9.07895" ry="8.74155" transform="matrix(-1 0 0 1 24 1)" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const { string } = PropTypes;

SearchIcon.defaultProps = {
  className: null,
  rootClassName: null,
};

SearchIcon.propTypes = {
  className: string,
  rootClassName: string,
};

export default SearchIcon;
