import React from "react";
import logo1 from "../../images/Logo (1).png";
import sectionimg2 from "../../images/Tap & Run_MainImage 1.png";
import whitelogo from "../../images/T&R White.png"
import styles from "./TopCancel.module.css";
import { Link } from "react-router-dom";
import PubImageHeader from '../../components/PubImageHeader/PubImageHeader';
import CustomButton from '../../components/ui/CustomButton/CustomButton';
export default function Cancel() {
  return (
    <div className={styles.CancelMain} id="choose">
      {/* <div className="DetailsimgMain">
        <img src={whitelogo} alt="logo" className="logodatta" />
        <img src={sectionimg2} alt="section_image" className="Data_imag" />
      </div> */}
      <PubImageHeader
        pubLogo={whitelogo}
        sectionImg={sectionimg2}

      />

      <div className={styles.Modify_main}>
        <div className={`${styles.Cancel_type} ${styles.imgdata}`}>
          <img src={logo1} alt="logo" />
        </div>
        <div className={styles.Cancel_type}>
          <h1 className={`${styles.logo_large} ${styles.datetilte}`}>Cancel A Booking </h1>
        </div>
        <div className={`${styles.Cancel_type} ${styles.belowt}`}>
          <h3 className={`${styles.subtext}`}>Are You Sure You Want To Cancel Your Booking?</h3>
        </div>
        <div className={`${styles.Cancel_type} ${styles.CancelbtnMain}`}>



          <CustomButton
            to="/TopBookingNumber"
            label="Cancel A Booking"
          />

          <CustomButton
            label="Edit A Booking"
            to="/TopModify"
            bgColor="#C39A7B"
            color="#FFFCF7"
          />


        </div>
        <div className={`${styles.Cancel_type}`}>
          <Link to="/" className={`exist__link`}>
            Exit And Cancel Booking
          </Link>
        </div>
      </div>
    </div>
  );
}
