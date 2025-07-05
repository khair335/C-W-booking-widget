import React, { useState } from 'react';
import css from './Filters.module.css';

const CustomFilterListings = ({ items, showUnderLine = false, isMobile }) => {
  const [selectedOption, setSelectedOption] = useState(items?.[0]?.label ?? '');

  const handleAction = v => {
    const item = isMobile ? items.find(elm => elm.label == v) : v;
    item?.value();
    setSelectedOption(item?.label);
  };

  if (isMobile) {
    return (
      <select className={css.select} onChange={e => handleAction(e.target.value)} value={selectedOption}>
        {items.map((item, i) => (
          <option key={i} value={item.label}>
            {item?.label}
          </option>
        ))}
      </select>
    );
  } else {
    return items.map(item => (
      <div
        onClick={() => handleAction(item)}
        className={
          showUnderLine && selectedOption == item.label ? css.activeItem : css.customFilterItem
        }
      >
        {item.label}
      </div>
    ));
  }
};

export default CustomFilterListings;
