import React from "react";
import logo from "../../images/The Long Hop - text.png";
import sectionimage from "../../images/TheLongHop_MainiMAGE.jpg";
import styles from "./LongHopUpdated.module.css";
import { Link } from "react-router-dom";
import PubImageHeader from '../../components/PubImageHeader/PubImageHeader';
import CustomButton from '../../components/ui/CustomButton/CustomButton';

export default function LongHopUpdated() {
  return (
     <div className={styles.BookeddMain} id="choose">


      <PubImageHeader

        sectionImg={sectionimage}

      />

      <div className={styles.Confirm_main}>
        <div className={styles.Data_type}>
          <h1 className={`${styles.logo_large} ${styles.datetilte}`}>Your Booking Has Been <br /> Successfully Updated

        </h1>
          <h6 className={styles.subtext}>See You Soon At</h6>
        </div>
        <div className={`${styles.Data_type} `} >
          <img src={logo} alt="logo" />
        </div>
        <div className={styles.booked_info} >
          <h5>The Long Hop</h5>
          <h5>The Long Hop, Manor Dr, Burton-on-Trent DE14 3RW</h5>
          <a href="tel:+4401283 392800" className={styles.numbrtag}>
            +44 01283 392800
          </a>
        </div>
       <div className={`${styles.Data_type} ${styles.BookedbtonMain}`}>
            <CustomButton
            label="Add to calender"
             to="/"

          />
          <CustomButton
            label="Back To the table"
            to="/longhopHome"
            color="#FFFFFF"
            bgColor="#C39A7B"
          />
        </div>
               <div className={`${styles.Data_type} mt-5`}>
          <Link to="/longhopHome" className="exist__link">
            Exit And Cancel Booking
          </Link>
        </div>
      </div>
    </div>
  );
}

