import React, { useState, useEffect } from "react";
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

  // Notify parent page of successful booking confirmation for tracking
  useEffect(() => {
    if (successBookingData?.Booking?.Reference && window.parent !== window) {
      // Prevent duplicate messages by checking if we've already sent this booking ref
      const sentBookings = sessionStorage.getItem('sentBookingConfirmations') || '';
      const bookingRef = successBookingData.Booking.Reference;

      if (!sentBookings.includes(bookingRef)) {
        console.log('📡 Notifying parent page of booking confirmation:', bookingRef);

        // Send message to parent page for conversion tracking
        window.parent.postMessage({
          type: "CWT_BOOKING_CONFIRMED",
          brand: "TapAndRun",
          bookingRef: bookingRef,
          ts: Date.now()
        }, "*");

        // Mark this booking as sent to prevent duplicates
        sessionStorage.setItem('sentBookingConfirmations', sentBookings + ',' + bookingRef);
      }
    }
  }, [successBookingData?.Booking?.Reference]);

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
