import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import css from './IconClose.module.css';
const SIZE_SMALL = 'small';

const IconClose = props => {
  const { className, rootClassName, size } = props;
  const classes = classNames(rootClassName || css.root, className);

  if (size === SIZE_SMALL) {
    return (
      <svg className={classes} width="9" height="9" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M2.175 8.396l2.482-2.482 2.482 2.482a.889.889 0 1 0 1.258-1.257L5.914 4.657l2.482-2.483A.89.89 0 0 0 7.139.917L4.657 3.4 2.175.918A.888.888 0 1 0 .917 2.174L3.4 4.657.918 7.139a.889.889 0 1 0 1.257 1.257"
          fillRule="evenodd"
        />
      </svg>
    );
  }

  return (
    <svg className={classes} width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.4946 16.2559C17.5758 16.3372 17.6403 16.4337 17.6843 16.54C17.7283 16.6462 17.751 16.76 17.751 16.875C17.751 16.99 17.7283 17.1038 17.6843 17.21C17.6403 17.3163 17.5758 17.4128 17.4946 17.4941C17.4133 17.5754 17.3167 17.6398 17.2105 17.6838C17.1043 17.7278 16.9905 17.7505 16.8755 17.7505C16.7605 17.7505 16.6467 17.7278 16.5405 17.6838C16.4342 17.6398 16.3377 17.5754 16.2564 17.4941L9.00049 10.237L1.74455 17.4941C1.58036 17.6582 1.35768 17.7505 1.12549 17.7505C0.893293 17.7505 0.67061 17.6582 0.506424 17.4941C0.342238 17.3299 0.25 17.1072 0.25 16.875C0.25 16.6428 0.342238 16.4201 0.506424 16.2559L7.76346 9L0.506424 1.74406C0.342238 1.57988 0.25 1.35719 0.25 1.125C0.25 0.892805 0.342238 0.670121 0.506424 0.505936C0.67061 0.34175 0.893293 0.249512 1.12549 0.249512C1.35768 0.249512 1.58036 0.34175 1.74455 0.505936L9.00049 7.76297L16.2564 0.505936C16.4206 0.34175 16.6433 0.249512 16.8755 0.249512C17.1077 0.249512 17.3304 0.34175 17.4946 0.505936C17.6587 0.670121 17.751 0.892805 17.751 1.125C17.751 1.35719 17.6587 1.57988 17.4946 1.74406L10.2375 9L17.4946 16.2559Z" fill="#ED2124" />
    </svg>

  );
};

const { string } = PropTypes;

IconClose.defaultProps = {
  className: null,
  rootClassName: null,
};

IconClose.propTypes = {
  className: string,
  rootClassName: string,
};

export default IconClose;
