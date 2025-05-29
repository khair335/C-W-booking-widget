import React from "react";
import logo from "../../images/Griffin Black.png";
import sectionimage from "../../images/79205c0e916b529d8d136ce69e32e592.png";
import logo1 from "../../images/Logo (1).png";
import sectionimg2 from "../../images/Tap & Run_MainImage 1.png";
import whitelogo from "../../images/T&R White.png";
import styles from "./TopBooked.module.css";
import { Link } from "react-router-dom";
import PubImageHeader from '../../components/PubImageHeader/PubImageHeader';
import CustomButton from '../../components/ui/CustomButton/CustomButton';
export default function Booked() {
  return (
    <div className={styles.BookeddMain} id="choose">

      <PubImageHeader
        // pubLogo={whitelogo}
        sectionImg={sectionimg2}

      />
      <div className={styles.Confirmmain}>
        <div className={styles.Data_type}>
          <h1 className={`${styles.logo_large} ${styles.datetilte}`}>You’re All Booked!</h1>
          <h6 className={styles.confirm_text}>See You Soon At</h6>
        </div>

        <div className='mx-auto d-flex justify-content-center align-items-center'>
           <img className={styles.confirm_logo} src={logo1} alt="logo" />
       </div>
        <div className={styles.booked_info}>
          <h5>174 Main St, Swithland, Leicester LE12 8TJ, United Kingdom</h5>
          <a href="tel:+441509890535" className={styles.numbrtag}>
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
          <Link to="/TopHome" className='exist__link'>
            Exit And Cancel Booking
          </Link>
        </div>
      </div>
    </div>
  );
}
