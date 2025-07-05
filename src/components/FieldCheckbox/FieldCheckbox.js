import React from 'react';
import { node, string } from 'prop-types';
import classNames from 'classnames';
import { Field } from 'react-final-form';

import css from './FieldCheckbox.module.css';

const IconCheckbox = props => {
  const { className, checkedClassName, boxClassName, isRadio, variant } = props;
  return (
    <>
      {isRadio ? <>
        <span className={css.beforeCheck}>
          <span className={css.radio}></span>
        </span>
        <svg className={css.afterCheck} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20ZM12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17Z" fill="white" />
        </svg>

      </> : <><span className={css.beforeCheck}>
      <svg width="16px" height="16px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path width="20" height="20" x="2" y="2" fill="none" stroke="#fff" stroke-width="1.3333333333333333" d="M1.333 1.333H14.667V14.667H1.333V1.333z"/></svg>
      </span>
        {variant == "yellow" ? 
        <svg className={css.afterCheck} width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M10.6 15.508L16.996 9.112L16.289 8.404L10.6 14.092L7.75 11.242L7.042 11.95L10.6 15.508ZM5.616 20C5.15533 20 4.771 19.846 4.463 19.538C4.155 19.23 4.00067 18.8453 4 18.384V5.616C4 5.15533 4.15433 4.771 4.463 4.463C4.77167 4.155 5.156 4.00067 5.616 4H18.385C18.845 4 19.2293 4.15433 19.538 4.463C19.8467 4.77167 20.0007 5.156 20 5.616V18.385C20 18.845 19.846 19.2293 19.538 19.538C19.23 19.8467 18.8453 20.0007 18.384 20H5.616Z" fill="#F5D90A"/>
      </svg>
   
        :<svg className={css.afterCheck} xmlns="http://www.w3.org/2000/svg" width="24" height="25" viewBox="0 0 24 25" fill="none">
        <path d="M10.6 16.008L16.996 9.612L16.289 8.904L10.6 14.592L7.75 11.742L7.042 12.45L10.6 16.008ZM5.616 20.5C5.15533 20.5 4.771 20.346 4.463 20.038C4.155 19.73 4.00067 19.3453 4 18.884V6.116C4 5.65533 4.15433 5.271 4.463 4.963C4.77167 4.655 5.156 4.50067 5.616 4.5H18.385C18.845 4.5 19.2293 4.65433 19.538 4.963C19.8467 5.27167 20.0007 5.656 20 6.116V18.885C20 19.345 19.846 19.7293 19.538 20.038C19.23 20.3467 18.8453 20.5007 18.384 20.5H5.616Z" fill="#41B870" />
      </svg>}
      </>}
    </>
  );
};

IconCheckbox.defaultProps = { className: null, checkedClassName: null, boxClassName: null };

IconCheckbox.propTypes = { className: string, checkedClassName: string, boxClassName: string };

const FieldCheckboxComponent = props => {
  const {
    rootClassName,
    className,
    svgClassName,
    textClassName,
    id,
    label,
    useSuccessColor,
    isRadio,
    variant,
    ...rest
  } = props;

  const classes = classNames(rootClassName || css.root, className);

  // This is a workaround for a bug in Firefox & React Final Form.
  // https://github.com/final-form/react-final-form/issues/134
  const handleOnChange = (input, event) => {
    const { onBlur, onChange } = input;
    onChange(event);
    onBlur(event);

    // If onChange has been passed as a props to FieldCheckbox
    if (rest.onChange) {
      rest.onChange(event);
    }
  };

  const successColorVariantMaybe = useSuccessColor
    ? {
      checkedClassName: css.checkedSuccess,
      boxClassName: css.boxSuccess,
    }
    : {};
  const disabledColorMaybe = rest.disabled
    ? {
      checkedClassName: css.checkedDisabled,
      boxClassName: css.boxDisabled,
    }
    : {};

  return (
    <span className={classes}>
      <Field type="checkbox" {...rest}>
        {props => {
          const { input, disabled } = props;
          return (
            <input
              id={id}
              className={css.input}
              {...input}
              onChange={event => handleOnChange(input, event)}
              disabled={disabled}
            />
          );
        }}
      </Field>
      <label htmlFor={id} className={css.label}>
        <span className={css.checkboxWrapper}>
          <IconCheckbox
            variant={variant}
            isRadio={isRadio}
            className={svgClassName}
            {...successColorVariantMaybe}
            {...disabledColorMaybe}
          />
        </span>
        <span className={classNames(css.text, textClassName || css.textRoot)}>{label}</span>
      </label>
    </span>
  );
};

FieldCheckboxComponent.defaultProps = {
  className: null,
  rootClassName: null,
  svgClassName: null,
  textClassName: null,
  label: null,
};

FieldCheckboxComponent.propTypes = {
  className: string,
  rootClassName: string,
  svgClassName: string,
  textClassName: string,

  // Id is needed to connect the label with input.
  id: string.isRequired,
  label: node,

  // Name groups several checkboxes to an array of selected values
  name: string.isRequired,

  // Checkbox needs a value that is passed forward when user checks the checkbox
  value: string.isRequired,
};

export default FieldCheckboxComponent;
