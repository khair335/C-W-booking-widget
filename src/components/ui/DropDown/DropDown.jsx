import React, { useState, useRef, useEffect } from 'react';
import styles from './DropDown.module.css';
import { MdOutlineCheck } from "react-icons/md";
import { IoMdArrowDropdown } from 'react-icons/io';

const DropDown = ({
  options = [],
  multi = false,
  value,
  onChange,
  placeholder = "Select...",
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isSelected = (option) =>
    multi
      ? Array.isArray(value) && value.includes(option.value)
      : value === option.value;

  const handleSelect = (option) => {
    if (disabled) return;
    if (multi) {
      if (Array.isArray(value) && value.includes(option.value)) {
        onChange(value.filter((v) => v !== option.value));
      } else {
        onChange([...(value || []), option.value]);
      }
    } else {
      onChange(option.value);
      setOpen(false);
    }
  };

  return (
    <div ref={ref} className={styles.container}>
      <div
        onClick={() => !disabled && setOpen((o) => !o)}
        className={`${styles.trigger} ${disabled ? styles.disabled : ''}`}
      >
        {multi
          ? (options.filter((opt) => value?.includes(opt.value)).map((opt) => opt.label).join(", ") || placeholder)
          : (options.find((opt) => opt.value === value)?.label || placeholder)}

        <IoMdArrowDropdown className={`${styles.arrowDown} ${open ? styles.rotate : ''}`} />
      </div>
      {open && !disabled && (
        <div className={styles.dropdown}>
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => handleSelect(option)}
              className={`${styles.option} ${isSelected(option) ? styles.selected : ''}`}
            >
              <span>{option.label}</span>
              {isSelected(option) && (
                <span className={styles.checkmark}>

                  <MdOutlineCheck color="#1C1C1C" />

                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DropDown;