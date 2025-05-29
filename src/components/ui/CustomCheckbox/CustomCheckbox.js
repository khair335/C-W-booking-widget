import React from "react";
import "./CustomCheckbox.css";

const CustomCheckbox = ({ checked,labelStyle, onChange, id, label, ...props }) => (
  <label className="custom-checkbox-label">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      id={id}
      className="custom-checkbox-input"
      {...props}
    />
    <span className="custom-checkbox-box">
      {checked && (
        <svg width="16" height="16" viewBox="0 0 16 16">
          <polyline
            points="3.5 8.5 7 12 12.5 5.5"
            style={{
              fill: "none",
              stroke: "#222",
              strokeWidth: 2,
              strokeLinecap: "round",
              strokeLinejoin: "round",
            }}
          />
        </svg>
      )}
    </span>
    {label && <span className={`${labelStyle} custom-checkbox-text`}>{label}</span>}
  </label>
);

export default CustomCheckbox;