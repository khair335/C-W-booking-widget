import React, { useState } from "react";
import logo from "../../images/The Long Hop - text.png";
import sectionimage from "../../images/TheLongHop_MainiMAGE.jpg";
import styles from "./LongHopBooked.module.css";
import { Link } from "react-router-dom";
import PubImageHeaderLongHop from '../../components/PubImageHeaderLongHop/PubImageHeaderLongHop';
import CustomButton from '../../components/ui/CustomButton/CustomButton';
import { useSelector } from "react-redux";
import CancelModal from '../../components/CancelModal/CancelModal';

export default function LongHopBooked() {
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Get state from Redux
  const bookingState = useSelector((state) => state.booking);
  const {
    successBookingData
  } = bookingState;
  
  return (
    <div className={styles.BookeddMain} id="choose">


      <PubImageHeaderLongHop

        sectionImg={sectionimage}

      />
      <div className={styles.Confirm_main}>
        <div className={styles.Data_type}>
          <h1 className={`${styles.logo_large} ${styles.datetilte}`}>You're All Booked!</h1>
          <h6 className={styles.subtext}>See You Soon At</h6>
        </div>
        <div className={`${styles.Data_type} `} >
          <img src={logo} alt="logo" />
        </div>
        <div className={styles.booked_info} >
          <h5>Booking Reference: {successBookingData?.Booking?.Reference}</h5>

          <br />
          <br />
          <h5>
            The Long Hop, Manor Dr, Burton-on-Trent DE14 3RW
          </h5>

        </div>
        <div className={`${styles.Data_type} ${styles.BookedbtonMain}`}>
          <CustomButton
            label="Home"
            to="/"

          />
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
