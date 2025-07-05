import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { normalizeText } from '../../../util/data';
import CustomFilterListings from './CustomFilterListings';
import css from './Filters.module.css'; // Import CSS module
import classNames from 'classnames';

const GenreFilterListings = forwardRef(({ items, refine, clearRefine, isMobile }, ref) => {
  const [selected, setSelected] = useState("");
  const genreItems = [
    {
      label: 'All Genre',
      value: () => clearRefine(),
    },
  ];

  const handleAction = v => {
    const item = isMobile ? [...items, ...genreItems].find(i => i.label == v) : v;
    if (!genreItems.find(elm => elm?.label == item?.label)) {
      refine(item.value);
    }
    clearRefine();
    setSelected(item?.label ?? item);
  };

  // Expose setSelected via useImperativeHandle
  useImperativeHandle(ref, () => ({
    changeSelectedFilter: val => setSelected(val),
  }));

  return isMobile ? (
    <select onChange={e => handleAction(e.target.value)} value={selected}>
      {[...genreItems, ...items].map(item => (
        <option value={item.label}>{item?.label}</option>
      ))}
    </select>
  ) : (
    <>
      <div
        className={classNames(css.genreItems, css.activeItem)}
        onClick={() => setSelected('')}
      >
        <CustomFilterListings items={genreItems} />
      </div>

      {items.map(item => (
        <div
          key={item.label}
          onClick={() => {
            clearRefine();
            refine(item.value);
            setSelected(item?.label ?? item);
          }}
          style={{ cursor: 'pointer' }}
        >
          <div className={`${css.menuItem} ${selected == item?.label ? css.activeItem : null}`}>
            <span className={css.itemLabel}>{normalizeText(item.label)}</span>
          </div>
        </div>
      ))}
    </>
  );
})

export default GenreFilterListings;
