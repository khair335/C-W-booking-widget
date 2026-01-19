import React from "react";
import styles from "./TopUpdate.module.css";
import whitelogo from "../../images/T&R White.png"
import logo1 from "../../images/Logo (1).png";
import sectionimg2 from "../../images/Tap & Run_MainImage 1.png";
import { Link } from "react-router-dom";
import PubImageHeader from '../../components/PubImageHeader/PubImageHeader';
import CustomButton from '../../components/ui/CustomButton/CustomButton';


export default function TopUpdated() {
  return (
    <div className={styles.BookeddMain} id="choose">


      <PubImageHeader

        sectionImg={sectionimg2}

      />

      <div className={styles.Confirm_main}>
        <div className={styles.Data_type}>
          <h1 className={`${styles.logo_large} ${styles.datetilte}`}>Your Booking Has Been <br /> Successfully Updated

        </h1>
          <h6 className={styles.subtext}>See You Soon At</h6>
        </div>
        <div className={`${styles.Data_type} `} >
          <img src={logo1} alt="logo" />
        </div>
        <div className={styles.booked_info} >
          <h5>Main Road, Upper Broughton, Melton Mowbray, LE14 3BG</h5>
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
