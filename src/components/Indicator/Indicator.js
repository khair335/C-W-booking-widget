import React from 'react';
import styles from './Indicator.module.css';

const Indicator = ({ step, stepLength }) => {
  return (
    <div className={styles.indicatorMain}>
      {Array.from({ length: stepLength }).map((_, index) => {
        // Determine the class based on the step
        const getTabClass = () => {
          if (index === step - 1) {
            return styles.active; // Current step
          } else if (index < step - 1) {
            return styles.fill; // Completed steps
          }
          return ''; // Future steps
        };

        return (
          <div
            key={index}

             style={{ width: `calc(100% / ${stepLength} - 24px)` }}
            className={`${styles.indicatorTab} ${getTabClass()}`}
          />
        );
      })}
    </div>
  );
};

export default Indicator;