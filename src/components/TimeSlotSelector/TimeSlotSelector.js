import React from 'react';
import './TimeSlotSelector.css';

const TimeSlotSelector = ({
  timeSlots,
  selectedTimeISO,
  onTimeSelect,
  disabled = false,
  className = ''
}) => {
  // Group time slots by hour
  const groupedSlots = timeSlots.reduce((groups, slot) => {
    const date = new Date(slot.TimeSlot);
    const hour = date.getHours();
    const key = `${hour}:00`;
    
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(slot);
    return groups;
  }, {});

  const handleTimeSelect = (slot) => {
    if (disabled) return;
    
    const dateObj = new Date(slot.TimeSlot);
    const formatted24Hour = dateObj.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    
    onTimeSelect({
      iso: slot.TimeSlot,
      formatted: formatted24Hour,
      leaveTime: slot.LeaveTime
    });
  };

  const isSlotSelected = (slot) => {
    return selectedTimeISO === slot.TimeSlot;
  };

  const formatTimeLabel = (iso) => {
    return new Date(iso).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={`time-slot-selector ${className}`}>
      {Object.entries(groupedSlots).map(([hour, slots]) => (
        <div key={hour} className="time-slot-group">
          <h3 className="time-slot-hour">{hour}</h3>
          <div className="time-slot-grid">
            {slots.map((slot) => (
              <button
                key={slot.TimeSlot}
                className={`time-slot-button ${isSlotSelected(slot) ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
                onClick={() => handleTimeSelect(slot)}
                disabled={disabled}
              >
                {formatTimeLabel(slot.TimeSlot)}
              </button>
            ))}
          </div>
        </div>
      ))}
      {timeSlots.length === 0 && (
        <div className="no-slots-message">
          No available time slots for this date
        </div>
      )}
    </div>
  );
};

export default TimeSlotSelector; 