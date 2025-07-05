import React from 'react';

import css from './Skeleton.module.css';
import classNames from 'classnames';

const Skeleton = ({
  width = '50%',
  height = 16,
  bottom = 14,
  left = 0,
  top = 0,
  right = 0,
  circle = false,
  rounded = 0,
  className,
}) => {
  return (
    <div
      className={classNames(css.skeleton, className)}
      style={{
        width,
        height,
        marginLeft: left,
        marginRight: right,
        marginBottom: bottom,
        borderRadius: rounded,
        marginTop: top,
        ...(circle && { borderRadius: '100%', height: width }),
      }}
    />
  );
};

export default Skeleton;
