import React from "react";
import styles from "./InfoChip.module.css";

export default function InfoChip({ icon, label, alt }) {
  return (
    <div className={styles.titlewithicon}>
      <img src={icon} alt={alt} />
      {label}
    </div>
  );
}