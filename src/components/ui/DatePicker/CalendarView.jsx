import React from 'react';
import { FaChevronLeft, FaChevronRight, FaChevronDown } from 'react-icons/fa';
import { DAYS, getDaysInMonth, getPreviousMonthDays, getNextMonthDays, isToday, isSameDate } from '../../../utils/dateUtils';
import styles from './CalendarView.module.css';

const CalendarView = ({
  currentDate,
  selectedDate,
  onDateSelect,
  onPrevMonth,
  onNextMonth,
  onMonthClick,
  onYearClick,
  isDateDisabled
}) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long' });

  const daysInMonth = getDaysInMonth(year, month);
  const prevMonthDays = getPreviousMonthDays(year, month);
  const nextMonthDays = getNextMonthDays(year, month);

  const handleDateClick = (day, isCurrentMonth = true) => {
    if (isCurrentMonth) {
      const newDate = new Date(year, month, day);
      if (isDateDisabled && isDateDisabled(newDate)) return;
      onDateSelect(newDate);
    }
  };

  return (
    <div className={styles.calendarContainer}>
      {/* Header */}
      <div className={styles.calendarHeader}>
        <div className={styles.calendarHeaderLeft}>
          <button
            onClick={onMonthClick}
            className={styles.calendarHeaderMonth}
          >
            {monthName}
          </button>
          <button
            onClick={onYearClick}
            className={styles.calendarHeaderYear}
          >
            {year}
          </button>
          <FaChevronDown className={styles.calendarHeaderChevron} />
        </div>

        <div className={styles.calendarHeaderRight}>
          <button
            onClick={onPrevMonth}
            className={styles.calendarNavBtn}
          >
            <FaChevronLeft className={styles.calendarNavIcon} />
          </button>
          <button
            onClick={onNextMonth}
            className={styles.calendarNavBtn}
          >
            <FaChevronRight className={styles.calendarNavIcon} />
          </button>
        </div>
      </div>

      {/* Days of week */}
      <div className={styles.calendarDaysRow}>
        {DAYS.map((day) => (
          <div
            key={day}
            className={styles.calendarDay}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className={styles.calendarGrid}>
        {/* Previous month days */}
        {prevMonthDays.map((day) => (
          <div
            key={`prev-${day}`}
            className={`${styles.calendarCell} ${styles.calendarCellOtherMonth}`}
          >
            {day}
          </div>
        ))}

        {/* Current month days */}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const date = new Date(year, month, day);
          const isTodayDate = isToday(date);
          const isSelected = selectedDate && isSameDate(date, selectedDate);
          const disabled = isDateDisabled && isDateDisabled(date);

          return (
            <button
              key={day}
              onClick={() => handleDateClick(day)}
              disabled={disabled}
              className={`${styles.calendarCell}
                ${isSelected ? styles.calendarCellSelected : ''}
                ${isTodayDate ? styles.calendarCellToday : ''}
                ${disabled ? styles.calendarCellDisabled : ''}
              `}
            >
              {day}
            </button>
          );
        })}

        {/* Next month days */}
        {nextMonthDays.map((day) => (
          <div
            key={`next-${day}`}
            className={`${styles.calendarCell} ${styles.calendarCellOtherMonth}`}
          >
            {day}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarView;
