import React, { useState } from "react";
import logo from "../../images/Griffin Black.png";
import sectionimage from "../../images/79205c0e916b529d8d136ce69e32e592.png";
import logo1 from "../../images/Logo (1).png";
import sectionimg2 from "../../images/Tap & Run_MainImage 1.png";
import whitelogo from "../../images/T&R White.png";
import styles from "./TopBooked.module.css";
import { Link } from "react-router-dom";
import PubImageHeader from '../../components/PubImageHeader/PubImageHeader';
import CustomButton from '../../components/ui/CustomButton/CustomButton';
import { useSelector } from 'react-redux';
import CancelModal from '../../components/CancelModal/CancelModal';

export default function Booked() {
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Get state from Redux
  const bookingState = useSelector((state) => state.booking);
  const {
    successBookingData
  } = bookingState;

  return (
    <div className={styles.BookeddMain} id="choose">

      <PubImageHeader
        // pubLogo={whitelogo}
        sectionImg={sectionimg2}

      />
      <div className={styles.Confirmmain}>
        <div className={styles.Data_type}>
          <h1 className={`${styles.logo_large} ${styles.datetilte}`}>You're All Booked!</h1>
          <h6 className={styles.confirm_text}>See You Soon At</h6>
        </div>

        <div className='mx-auto d-flex justify-content-center align-items-center'>
          <img className={styles.confirm_logo} src={logo1} alt="logo" />
        </div>
        <div className={styles.booked_info}>
          <h5>Booking Reference: {successBookingData?.Booking?.Reference}</h5>
          <br />
          <br />
          <h5>
            Main Road, Upper Broughton, Melton Mowbray
            LE14 3BG, United Kingdom
          </h5>
        </div>
        <div className={`${styles.Data_type} ${styles.BookedbtonMain}`}>


          {/* <CustomButton
            label="Add to calender"
            to="/"

          /> */}
        </div>
      </div>

      {showCancelModal && (
        <CancelModal
          refId={successBookingData?.Booking?.Reference}
          onClose={() => setShowCancelModal(false)}
        />
      )}
    </div>
  );
}
