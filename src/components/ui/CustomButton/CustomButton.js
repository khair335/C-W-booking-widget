import React from "react";
import { Link } from "react-router-dom";
import styles from "./CustomButton.module.css";

export default function CustomButton({
  label,
  to,
  onClick,
  disabled = false,
  bgColor = "#3D3D3D",
  color = "#FFFCF7",
  style = {},
  type = "button",
}) {
  const btnStyle = {
    backgroundColor: bgColor,
    color: color,
    cursor: disabled ? "not-allowed" : "pointer",
    ...style,
  };

  if (to) {
    // Render as a Link
    return (
      <Link
        to={to}
        className={styles.customBtn}
        style={btnStyle}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        onClick={e => disabled && e.preventDefault()}
      >
        {label}
      </Link>
    );
  }

  // Render as a button
  return (
    <button
      type={type}
      className={styles.customBtn}
      style={btnStyle}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
}