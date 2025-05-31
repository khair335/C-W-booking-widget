import React, { useState } from "react";
import logo from "../../images/T&R White.png";
import TextField from "@mui/material/TextField";
import whitelogo from "../../images/T&R White.png"
import sectionimg2 from "../../images/Tap & Run_MainImage 1.png";
import styles from "./TopModify.module.css";
import { Link, useNavigate } from "react-router-dom";
import PubImageHeader from '../../components/PubImageHeader/PubImageHeader';
import CustomInput from '../../components/ui/CustomInput/CustomInput';
import CustomButton from '../../components/ui/CustomButton/CustomButton';
import Indicator from '../../components/Indicator/Indicator';
import { getBooking } from '../../services/bookingService';
import { useDispatch } from 'react-redux';
import {
  updateBasicInfo,
  updateCustomerDetails,
  updateSpecialRequests,
  updateSelectedPromotion,
  addSuccessBookingData,
  resetBooking // Import this to reset state before setting new data
} from '../../store/bookingSlice';

export default function Modify() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [bookingNumber, setBookingNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleNextClick = async () => {
    if (!bookingNumber) {
      setError("Please fill booking number before submitting.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const bookingData = await getBooking(bookingNumber);
      console.log("API Response:", bookingData); // Log the full response

      if (!bookingData) {
        throw new Error("No booking data received");
      }

      // First reset the booking state
      dispatch(resetBooking());

      // Safely extract and format date/time
      const visitDate = bookingData.VisitDate ? bookingData.VisitDate.split('T')[0] : null;
      const visitTime = bookingData.VisitTime ? bookingData.VisitTime.substring(0, 5) : null;

      // Calculate returnBy time safely
      let returnBy = null;
      if (visitDate && visitTime && bookingData.Duration) {
        try {
          const visitDateTime = new Date(`${visitDate}T${visitTime}`);
          const returnDateTime = new Date(visitDateTime.getTime() + (bookingData.Duration * 60000));
          returnBy = returnDateTime.toTimeString().substring(0, 8);
        } catch (err) {
          console.error("Error calculating return time:", err);
        }
      }

      // Update basic booking info with safe values
      dispatch(updateBasicInfo({
        date: visitDate,
        time: visitTime,
        adults: bookingData.PartySize || 0,
        children: 0,
        returnBy: returnBy,
        pubType: "top",
        availablePromotionIds: bookingData.availablePromotionIds || []
      }));

      // Update customer details with safe values
      if (bookingData.Customer) {
        dispatch(updateCustomerDetails({
          FirstName: bookingData.Customer.FirstName || '',
          Surname: bookingData.Customer.Surname || '',
          MobileCountryCode: bookingData.Customer.MobileCountryCode?.toString() || "+44",
          Mobile: bookingData.Customer.Mobile || '',
          Email: bookingData.Customer.Email || '',
          ReceiveEmailMarketing: bookingData.Customer.ReceiveEmailMarketing || false,
          ReceiveSmsMarketing: bookingData.Customer.ReceiveSmsMarketing || false,
          ReceiveRestaurantEmailMarketing: bookingData.Customer.ReceiveRestaurantEmailMarketing || false,
          ReceiveRestaurantSmsMarketing: bookingData.Customer.ReceiveRestaurantSmsMarketing || false,
          Birthday: bookingData.Customer.Birthday || ''
        }));
      }

      // Update special requests
      dispatch(updateSpecialRequests(bookingData.SpecialRequests || ""));

      // Update selected promotion if exists
      if (bookingData.PromotionId) {
        dispatch(updateSelectedPromotion({
          Id: bookingData.PromotionId,
          Name: bookingData.RestaurantName || 'Selected Promotion'
        }));
      }

      // Add success booking data with safe values
      dispatch(addSuccessBookingData({
        reference: bookingData.Reference || '',
        bookingId: bookingData.Id || null,
        token: bookingData.Token || '',
        editToken: bookingData.EditToken || '',
        canEdit: bookingData.CanEdit || false,
        canCancel: bookingData.CanCancel || false,
        bookingStatus: bookingData.BookingStatus || '',
        visitDateTime: bookingData.VisitDateTimeUtc || null,
        duration: bookingData.Duration || 0
      }));

      // Navigate to edit page
      navigate("/TopEdit", {
        state: {
          bookingNumber,
          bookingData
        }
      });
    } catch (err) {
      console.error("Error in handleNextClick:", err);
      setError(err.message || "Failed to fetch booking details. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.BookedMain} id="choose">
      <PubImageHeader
        pubLogo={logo}
        sectionImg={sectionimg2}
        pubLinkLabel="CHOOSE ANOTHER PUB"
        step={1}
        stepLength={4}
        pubLink="/Select"
      />
      <div className={styles.ModifyMain}>
        <div className={styles.modify_container}>
          <div className={`${styles.Data_type} ${styles.imgdata}`}>
            <img src={logo} alt="logo" />
          </div>
          <div className={styles.Data_type}>
            <h1 className={`${styles.logo_large} ${styles.datetilte}`}>Modify A Booking </h1>
          </div>
          <h4 className={styles.subtext}>
            Please Enter Your Booking Number, As <br className='block md:hidden' /> Provided In Your Confirmation
            Email.
          </h4>
          <div className={styles.textfieldMain}>
            <CustomInput
              required
              label="Booking Number"
              value={bookingNumber}
              onChange={(e) => {
                setBookingNumber(e.target.value);
                setError(null); // Clear error when user types
              }}
              style={{ flex: '0 0 180px' }}
              helperText='E.G. XXXX-XXXX-XXXX'
              error={!!error}
            />
            {error && (
              <p className={styles.error_message} style={{ color: 'red', marginTop: '8px' }}>
                {error}
              </p>
            )}
          </div>
          <div className={`${styles.Area_type_footer} ${styles.ModifybtonMain}`}>
            <CustomButton
              onClick={handleNextClick}
              label={isLoading ? 'Loading...' : 'Edit A Booking'}
              disabled={!bookingNumber || isLoading}
              bgColor={bookingNumber && !isLoading ? "#3D3D3D" : "#ccc"}
              color={bookingNumber && !isLoading ? "#fff" : "#000"}
            />
            <CustomButton
              label="resend the confirmation email"
              to="/TopArea"
              bgColor="#C39A7B"
              color="#FFFCF7"
            />
          </div>

          <div className={styles.chose_m_link}>
            <Indicator
              step={1}
              stepLength={4}
            />
          </div>

          <p className={styles.lost_booking}>
            Lost your booking details? Press the button  to resend the confirmation email.
          </p>
          <div className={styles.Data_type}>
            <Link to="/" className='exist__link'>
              Cancel Editing and exit
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
