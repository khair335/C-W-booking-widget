import React from 'react';
import styles from './PubImageHeader.module.css';
import { Link } from 'react-router-dom';
import Indicator from '../Indicator/Indicator';
const PubImageHeader = (props) => {
  const {pubLogo, sectionImg,pubLinkLabel,pubLink,step ,stepLength = 4 } = props;
  return (
    <div className={styles.pubImgMain}>
      {
        pubLogo && <img src={pubLogo} alt="logo" className={styles.publogo} />
      }
      {
        sectionImg && <img src={sectionImg} alt="section_" className={styles.pubImg} />
      }


      {/* Indicator */}
      {
        step && <Indicator step={step} stepLength={stepLength} />
      }

      {
        pubLink && <Link to={pubLink} className='chose__another__link'>
        {pubLinkLabel}
      </Link>
      }

    </div>
  );
};

export default PubImageHeader;