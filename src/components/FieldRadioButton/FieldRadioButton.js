import React from 'react';
import { node, string } from 'prop-types';
import classNames from 'classnames';
import { Field } from 'react-final-form';

import css from './FieldRadioButton.module.css';

const IconRadioButton = props => {
  const { checkedClassName } = props;
  return (
    <div>
      <svg className={classNames(props.className, css.uncheckedIcon)} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20Z" fill="#9D9D9D" />
      </svg>

      <svg className={css.checkedIcon} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20ZM12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17Z" fill="white" />
      </svg>

    </div>
  );
};

IconRadioButton.defaultProps = { className: null };

IconRadioButton.propTypes = { className: string };

const FieldRadioButtonComponent = props => {
  const {
    rootClassName,
    className,
    svgClassName,
    checkedClassName,
    id,
    label,
    showAsRequired,
    description,
    ...rest
  } = props;

  const classes = classNames(rootClassName || css.root, className);
  const radioButtonProps = {
    id,
    className: css.input,
    component: 'input',
    type: 'radio',
    ...rest,
  };

  return (
    <span className={classes}>
      <Field {...radioButtonProps} />
      <label htmlFor={id} className={css.label}>
        <span className={css.radioButtonWrapper}>
          <IconRadioButton
            className={svgClassName}
            checkedClassName={checkedClassName}
            showAsRequired={showAsRequired}
          />
        </span>
        <span>
          {
            label?.startsWith('Refund Policy') || label?.startsWith('All') ?
              <>
                <span className={css.text}>{label.split('\n')[0]}</span>
                <br />
                <span className={css.description}>{label.split('\n')[1]}</span>
              </>
              :
              <>
                <span className={css.text}>{label}</span>
                {description && <span className={css.description}><br />{description}</span>}
              </>
          }
        </span>
      </label>
    </span>
  );
};

FieldRadioButtonComponent.defaultProps = {
  className: null,
  rootClassName: null,
  svgClassName: null,
  checkedClassName: null,
  label: null,
};

FieldRadioButtonComponent.propTypes = {
  className: string,
  rootClassName: string,
  svgClassName: string,
  checkedClassName: string,

  // Id is needed to connect the label with input.
  id: string.isRequired,
  label: node,

  // Name groups several RadioButtones to an array of selected values
  name: string.isRequired,

  // RadioButton needs a value that is passed forward when user checks the RadioButton
  value: string.isRequired,
};

export default FieldRadioButtonComponent;
