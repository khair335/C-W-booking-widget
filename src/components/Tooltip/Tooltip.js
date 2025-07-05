import React from 'react';
import { Tooltip } from 'react-tooltip';
import css from './TootlTip.module.css';  // Import CSS Module
import IconCollection from '../IconCollection/IconCollection';

const CustomTooltip = ({ id, content, children, variant,place="top" }) => {
  const isLongTip = variant === 'long';

  return (
    <>
      <div data-tooltip-id={id} className={css.tooltipWrapper}>
        {children}
      </div>

      <Tooltip 
      clickable
        id={id} 
        place={place}
        effect="solid" 
        arrowColor="white" 
        className="custom-tooltip" // Global tooltip class from global.css
      >
        <div className={css.tooltipContent}>
         <div>
         <span className={css.tooltipIcon}><IconCollection icon="icon-info" /></span>
         </div>
          <div className={css.tooltipTextWrapper}>
         <strong className={css.tooltipStrong}>{isLongTip ? 'Long Tip' : 'Short Tip'}</strong>
          
            <p className={css.tooltipText}>{content}</p>
          </div>
        </div>
      </Tooltip>
    </>
  );
};

export default CustomTooltip;
