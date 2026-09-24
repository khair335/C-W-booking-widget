import React, { useEffect, useState } from "react";
import logo from "../../images/Griffin Black.png";
import sectionimage from "../../images/79205c0e916b529d8d136ce69e32e592.png";
import styles from "./Booked.module.css";
import { Link } from "react-router-dom";
import PubImageHeader from '../../components/PubImageHeader/PubImageHeader';
import CustomButton from '../../components/ui/CustomButton/CustomButton';
import { useSelector } from "react-redux";
import CancelModal from '../../components/CancelModal/CancelModal';

// Google Tag Manager for Griffin Inn booking tracking
const GTM_ID = 'GTM-MMS26B63';

const initGTM = () => {
  if (document.querySelector(`script[src*="${GTM_ID}"]`)) return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
  document.head.appendChild(script);
};

const trackBookingConversion = (bookingData) => {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'booking_conversion',
    brand: 'Griffin',
    restaurant: 'TheGriffinInn',
    ...bookingData,
    timestamp: Date.now()
  });

  if (window.parent !== window) {
    window.parent.postMessage({
      type: 'CWT_BOOKING_CONFIRMED',
      brand: 'Griffin',
      bookingRef: bookingData.booking_reference,
      ts: Date.now()
    }, '*');
  }
};

export default function Booked() {
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Get state from Redux
  const bookingState = useSelector((state) => state.booking);
  const {
    successBookingData,
    date,
    time,
    adults,
    children,
    selectedPromotion
  } = bookingState;

  useEffect(() => {
    initGTM();
  }, []);

  useEffect(() => {
    const booking = successBookingData?.Booking;
    const bookingRef = booking?.Reference;
    if (!bookingRef) return;

    // prevent duplicate conversion events on refresh / re-render
    const sentBookings = sessionStorage.getItem('sentBookingConfirmations') || '';
    if (sentBookings.includes(bookingRef)) return;

    const adultCount = parseInt(adults, 10) || 0;
    const childCount = parseInt(children, 10) || 0;

    trackBookingConversion({
      booking_reference: bookingRef,
      booking_date: booking?.VisitDate?.split('T')[0] || date || null,
      booking_time: booking?.VisitTime || time || null,
      party_size: booking?.PartySize || adultCount + childCount,
      adults: adultCount,
      children: childCount,
      area: selectedPromotion?.Name || null,
      promotion_id: selectedPromotion?.Id || null
    });
    sessionStorage.setItem('sentBookingConfirmations', `${sentBookings},${bookingRef}`);
  }, [successBookingData, date, time, adults, children, selectedPromotion]);
  return (
    <div className={styles.BookeddMain} id="choose">


      <PubImageHeader

        sectionImg={sectionimage}

      />
      <div className={styles.Confirm_main}>
        <div className={styles.Data_type}>
          <h1 className={`${styles.logo_large} ${styles.datetilte}`}>You’re All Booked!</h1>
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
            174 Main St, Swithland, Leicester LE12 8TJ, United
            Kingdom
          </h5>

        </div>
        <div className={`${styles.Data_type} ${styles.BookedbtonMain}`}>
          <CustomButton
            label="Home"
            to="/griffinHome"

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
