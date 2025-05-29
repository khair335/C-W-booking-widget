import React from "react";
import logo from "../../images/Griffin Black.png";
import sectionimage from "../../images/79205c0e916b529d8d136ce69e32e592.png";
import styles from "./Updated.module.css";
import { Link } from "react-router-dom";
import PubImageHeader from '../../components/PubImageHeader/PubImageHeader';
import CustomButton from '../../components/ui/CustomButton/CustomButton';
export default function Updated() {
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
          <h5>174 Main St, Swithland, Leicester LE12 8TJ, United Kingdom</h5>
          <a href="tel:+441509890535" className="numbrtag">
            +441509890535
          </a>
        </div>
       <div className={`${styles.Data_type} ${styles.BookedbtonMain}`}>
            <CustomButton
            label="Add to calender"
             to="/"

          />
          <CustomButton
            label="Back To the table"
            to="/TopHome"
            color="#FFFFFF"
            bgColor="#C39A7B"
          />
        </div>
               <div className={`${styles.Data_type} mt-5`}>
          <Link to="/" className="exist__link">
            Exit And Cancel Booking
          </Link>
        </div>
      </div>
    </div>
  );
}
