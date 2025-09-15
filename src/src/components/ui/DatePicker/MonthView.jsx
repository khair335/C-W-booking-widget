import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { MONTHS } from '../../../utils/dateUtils';
import styles from './MonthView.module.css';

const MonthView = ({
  currentDate,
  onMonthSelect,
  onPrevYear,
  onNextYear,
  onYearClick
}) => {
  const year = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  return (
    <div className={styles.monthViewContainer}>
      {/* Header */}
      <div className={styles.monthViewHeader}>

        <button
          onClick={onYearClick}
          className={styles.monthViewYearBtn}
        >
          {year}
        </button>

        <div className={styles.monthViewYearBtnContainer}>
          <button
            onClick={onPrevYear}
            className={styles.monthViewArrowBtn}
          >
            <FaChevronLeft className={styles.monthViewArrowIcon} />
          </button>

          <button
            onClick={onNextYear}
            className={styles.monthViewArrowBtn}
          >
            <FaChevronRight className={styles.monthViewArrowIcon} />
          </button>
        </div>
      </div>

      {/* Months grid */}
      <div className={styles.monthViewGrid}>
        {MONTHS.map((month, index) => (
          <button
            key={month}
            onClick={() => onMonthSelect(index)}
            className={`${styles.monthCell} ${index === currentMonth ? styles.monthCellSelected : ''}`}
          >
            {month.substring(0, 3)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MonthView;
