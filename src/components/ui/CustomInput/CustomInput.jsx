import React from 'react';
import TextField from '@mui/material/TextField';
import PropTypes from 'prop-types';
import styles from './CustomInput.module.css';

const CustomInput = ({
  label,
  value,
  onChange,
  required = false,
  className = '',
  helperText,
  error = false,
  type = 'text',
  placeholder,
  fullWidth = true,
  multiline = false,
  rows,
  disabled = false,
  ...props
}) => {
  return (
    <div className={styles.inputContainer}>
      <TextField
        label={label}
        value={value}
        onChange={onChange}
        required={required}
        className={`${styles.input} ${className}`}
        error={error}
        type={type}
        placeholder={placeholder}
        fullWidth={fullWidth}
        multiline={multiline}
        rows={rows}
        disabled={disabled}
        helperText={helperText}
        variant="outlined"
        {...props}
      />

    </div>
  );
};

CustomInput.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  required: PropTypes.bool,
  className: PropTypes.string,
  helperText: PropTypes.string,
  error: PropTypes.bool,
  type: PropTypes.string,
  placeholder: PropTypes.string,
  fullWidth: PropTypes.bool,
  multiline: PropTypes.bool,
  rows: PropTypes.number,
  disabled: PropTypes.bool,
};

export default CustomInput;