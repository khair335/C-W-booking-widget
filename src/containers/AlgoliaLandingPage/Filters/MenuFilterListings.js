import React from 'react';
import { useMenu } from 'react-instantsearch';
import { normalizeText } from '../../../util/data';
import css from './Filters.module.css'; // Import CSS module

function MenuFilterListings({ key, attribute }) {
  const { items, refine } = useMenu({ attribute });

  return (
    <>

      {items.map(item => (
        <div
          key={item.label}
          className={`${css.menuItem} ${item.isRefined ? css.activeItem : ''}`}
          onClick={() => refine(item.value)}
        >
          <span className={css.itemLabel}>{normalizeText(item.label)}</span>
        </div>
      ))}

    </>
  );
}

export default MenuFilterListings;
