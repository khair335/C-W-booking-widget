import React from 'react';
import TextField from '@mui/material/TextField';
import PropTypes from 'prop-types';
import styles from './CustomTextarea.module.css';

const CustomTextarea = ({
  label,
  value,
  onChange,
  required = false,
  className = '',
  helperText,
  error = false,
  placeholder,
  fullWidth = true,
  rows = 3,
  minRows = 3,
  maxRows = 5,
  disabled = false,
  ...props
}) => {
  return (
    <div className={styles.textareaContainer}>
      <TextField
        label={label}
        value={value}
        onChange={onChange}
        required={required}
        className={`${styles.textarea} ${className}`}
        error={error}
        placeholder={placeholder}
        fullWidth={fullWidth}
        multiline
        minRows={minRows}
        maxRows={maxRows}
        rows={rows}
        disabled={disabled}
        helperText={helperText}
        variant="outlined"
        inputProps={{
          autoCapitalize: 'none',
          ...props.inputProps
        }}
        {...props}
      />
    </div>
  );
};

CustomTextarea.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  required: PropTypes.bool,
  className: PropTypes.string,
  helperText: PropTypes.string,
  error: PropTypes.bool,
  placeholder: PropTypes.string,
  fullWidth: PropTypes.bool,
  rows: PropTypes.number,
  minRows: PropTypes.number,
  maxRows: PropTypes.number,
  disabled: PropTypes.bool,
};

export default CustomTextarea;