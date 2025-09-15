import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import styles from './YearView.module.css';

function YearView({ currentDate, onYearSelect, onPrevDecade, onNextDecade }) {
  const currentYear = currentDate.getFullYear();
  const startYear = Math.floor(currentYear / 12) * 12;
  const endYear = startYear + 11;

  const years = Array.from({ length: 12 }, (_, i) => startYear + i);

  return (
    <div className={styles.yearViewContainer}>
      {/* Header */}
      <div className={styles.yearViewHeader}>


        <div className={styles.yearViewRange}>
          {startYear} - {endYear}
        </div>

        <div className={styles.yearViewArrowBtnContainer}>
          <button
            onClick={onPrevDecade}
            className={styles.yearViewArrowBtn}
          >
            <FaChevronLeft className={styles.yearViewArrowIcon} />
          </button>

          <button
            onClick={onNextDecade}
            className={styles.yearViewArrowBtn}
          >
            <FaChevronRight className={styles.yearViewArrowIcon} />
          </button>
        </div>
      </div>

      {/* Years grid */}
      <div className={styles.yearViewGrid}>
        {years.map((year) => (
          <button
            key={year}
            onClick={() => onYearSelect(year)}
            className={`${styles.yearCell} ${year === currentYear ? styles.yearCellSelected : ''}`}
          >
            {year}
          </button>
        ))}
      </div>
    </div>
  );
}

export default YearView;
