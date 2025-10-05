import React, { useState, useEffect } from 'react';
import { IoMdArrowDropdown } from "react-icons/io";

import CalendarView from './CalendarView';
import MonthView from './MonthView';
import YearView from './YearView';

import styles from './DatePicker.module.css';
import { formatDate } from '../../../utils/dateUtils';

const DatePicker = ({
  value,
   selected,
  onChange,
  placeholder = "Select a date",
  disablePastDates = false,
  isDateDisabled = null,
  onMonthChange = null
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState('calendar');
   const dateValue = value || selected;
   const [currentDate, setCurrentDate] = useState(dateValue || new Date());
  const [selectedDate, setSelectedDate] = useState(dateValue || null);

  // Update selectedDate when value/selected prop changes
  useEffect(() => {
    setSelectedDate(dateValue || null);
    if (dateValue) {
      setCurrentDate(dateValue);
    }
  }, [dateValue]);
  
  const checkDateDisabled = (date) => {
    // Check if date is in the past (if disablePastDates is true)
    if (disablePastDates) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date < today) return true;
    }
    
    // Check custom date disabling function
    if (isDateDisabled && isDateDisabled(date)) return true;
    
    return false;
  };

  const handleDateSelect = (date) => {
    if (checkDateDisabled(date)) return;

    setSelectedDate(date);
    if (onChange) onChange(date);
    setIsOpen(false);
    setView('calendar');
  };

  const handleMonthSelect = (month) => {
    const newDate = new Date(currentDate.getFullYear(), month, 1);
    setCurrentDate(newDate);
    setView('calendar');
    
    // Notify parent component about month change
    if (onMonthChange) {
      onMonthChange(newDate);
    }
  };

  const handleYearSelect = (year) => {
    setCurrentDate(new Date(year, currentDate.getMonth(), 1));
    setView('month');
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
    
    // Notify parent component about month change
    if (onMonthChange) {
      onMonthChange(newDate);
    }
  };

  const navigateYear = (direction) => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setFullYear(newDate.getFullYear() - 1);
    } else {
      newDate.setFullYear(newDate.getFullYear() + 1);
    }
    setCurrentDate(newDate);
  };

  const navigateDecade = (direction) => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setFullYear(newDate.getFullYear() - 12);
    } else {
      newDate.setFullYear(newDate.getFullYear() + 12);
    }
    setCurrentDate(newDate);
  };

  const renderView = () => {
    switch (view) {
      case 'calendar':
        return (
          <CalendarView
            currentDate={currentDate}
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            onPrevMonth={() => navigateMonth('prev')}
            onNextMonth={() => navigateMonth('next')}
            onMonthClick={() => setView('month')}
            onYearClick={() => setView('year')}
            isDateDisabled={checkDateDisabled}
          />
        );
      case 'month':
        return (
          <MonthView
            currentDate={currentDate}
            onMonthSelect={handleMonthSelect}
            onPrevYear={() => navigateYear('prev')}
            onNextYear={() => navigateYear('next')}
            onYearClick={() => setView('year')}
          />
        );
      case 'year':
        return (
          <YearView
            currentDate={currentDate}
            onYearSelect={handleYearSelect}
            onPrevDecade={() => navigateDecade('prev')}
            onNextDecade={() => navigateDecade('next')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.datepickerContainer}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={styles.datepickerButton}
      >
        <div className={styles.datepickerFlex}>
          <span className={`${styles.datepickerLabel}${selectedDate ? ' selected' : ''}`}>
         {selectedDate ? formatDate(selectedDate) : placeholder}
          </span>
          <IoMdArrowDropdown className={`${styles.datepickerCalendarIcon} ${isOpen ? styles.rotate : ''}`} />
        </div>
      </button>
      {isOpen && (
        <>
          <div
            className={styles.datepickerBackdrop}
            onClick={() => {
              setIsOpen(false);
              setView('calendar');
            }}
          />
          <div className={styles.datepickerContent}>
            {renderView()}
          </div>
        </>
      )}
    </div>
  );
};

export default DatePicker;
