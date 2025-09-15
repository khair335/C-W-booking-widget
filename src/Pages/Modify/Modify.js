import React, { useState } from "react";
import logo from "../../images/Griffin Black.png";
import topandrunlogo from "../../images/Logo (1).png";
import sectionimage from "../../images/79205c0e916b529d8d136ce69e32e592.png";
import TextField from "@mui/material/TextField";
import styles from "./Modify.module.css";
import { Link, useNavigate } from "react-router-dom";
import PubImageHeader from '../../components/PubImageHeader/PubImageHeader';
import Indicator from '../../components/Indicator/Indicator';
import CustomButton from '../../components/ui/CustomButton/CustomButton';
import CustomInput from '../../components/ui/CustomInput/CustomInput';
import { addSuccessBookingData, resetBooking, updateBasicInfo, updateCustomerDetails, updateSelectedPromotion, updateSpecialRequests } from '../../store/bookingSlice';
import { getBooking } from '../../services/bookingService';
import { useDispatch } from 'react-redux';

export default function Modify() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [bookingNumber, setBookingNumber] = useState("");
  const [selectedRestaurant, setSelectedRestaurant] = useState(null); // 'top' or 'griffin'
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRestaurantSelect = (restaurantType) => {
    setSelectedRestaurant(restaurantType);
    setError(null);
  };

  const handleNextClick = async () => {
    if (!selectedRestaurant) {
      setError("Please select a restaurant first.");
      return;
    }
    if (!bookingNumber) {
      setError("Please fill booking number before submitting.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const bookingData = await getBooking(bookingNumber, selectedRestaurant);
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
        pubType: selectedRestaurant,
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
      navigate("/Edit", {
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
        sectionImg={sectionimage}
        pubLinkLabel="CHOOSE ANOTHER PUB"
        step={1}
        stepLength={4}
        pubLink="/Select"
      />
      <div className={styles.ModifyMain}>
        <div className={styles.modify_container}>
          
          {/* Restaurant Selection Section */}
          {!selectedRestaurant ? (
            <>
              <div className={styles.Data_type}>
                <h1 className={`${styles.logo_large} ${styles.datetilte}`}>
                  Select Restaurant
                </h1>
              </div>
              
              <h4 className={styles.subtext}>
                Please select the restaurant where you made your booking
              </h4>

              <div className={styles.restaurant_selection}>
                {/* Tap & Run Option */}
                <div className={`${styles.restaurant_option} ${selectedRestaurant === 'top' ? styles.selected : ''}`}>
                  <img src={topandrunlogo} alt="Tap & Run" className={styles.restaurant_logo} />
                  <h3 className={styles.restaurant_name}>Tap & Run</h3>
                  <p className={styles.restaurant_address}>
                    Main Road, Upper Broughton, Melton Mowbray<br />
                    LE14 3BG, United Kingdom
                  </p>
                  <a href="tel:+441664820407" className={styles.restaurant_phone}>
                    +441664820407
                  </a>
                  <CustomButton
                    label="SELECT"
                    onClick={() => handleRestaurantSelect('top')}
                    bgColor="#C39A7B"
                    color="#FFFCF7"
                  />
                </div>

                {/* Griffin Option */}
                <div className={`${styles.restaurant_option} ${selectedRestaurant === 'griffin' ? styles.selected : ''}`}>
                  <img src={logo} alt="The Griffin Inn" className={styles.restaurant_logo} />
                  <h3 className={styles.restaurant_name}>The Griffin Inn</h3>
                  <p className={styles.restaurant_address}>
                    174 Main St, Swithland, Leicester<br />
                    LE12 8TJ, United Kingdom
                  </p>
                  <a href="tel:+441509890535" className={styles.restaurant_phone}>
                    +441509890535
                  </a>
                  <CustomButton
                    label="SELECT"
                    onClick={() => handleRestaurantSelect('griffin')}
                    bgColor="#C39A7B"
                    color="#FFFCF7"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Booking Number Input Section */}
              <div className={styles.Data_type}>
                <img src={selectedRestaurant === 'top' ? topandrunlogo : logo} alt="logo" />
              </div>
              
              <div className={styles.Data_type}>
                <h1 className={`${styles.logo_large} ${styles.datetilte}`}>
                  Modify A Booking
                </h1>
              </div>

              <h4 className={styles.subtext}>
                Please Enter Your Booking Number, As <br className='block md:hidden' /> Provided In Your Confirmation Email.
              </h4>

              <div className={styles.textfieldMain}>
                <CustomInput
                  required
                  label="Booking Number"
                  value={bookingNumber}
                  onChange={(e) => setBookingNumber(e.target.value)}
                  style={{ flex: '0 0 180px' }}
                  helperText='E.G. XXXX-XXXX-XXXX'
                />
              </div>

              <div className={`${styles.Area_type_footer} ${styles.ModifybtonMain}`}>
                <CustomButton
                  onClick={handleNextClick}
                  label={isLoading ? 'Loading...' : 'Edit A Booking'}
                  disabled={!bookingNumber}
                  bgColor={bookingNumber ? "#3D3D3D" : "#ccc"}
                  color={bookingNumber ? "#fff" : "#000"}
                />
              </div>

              <div className={styles.back_button}>
                <CustomButton
                  label="Back to Restaurant Selection"
                  onClick={() => setSelectedRestaurant(null)}
                  bgColor="#f0f0f0"
                  color="#333"
                />
              </div>
            </>
          )}

          {/* Error Display */}
          {error && (
            <div className={styles.error_message}>
              <p style={{ color: 'red', textAlign: 'center', marginTop: '10px' }}>
                {error}
              </p>
            </div>
          )}

          <div className={styles.chose_m_link}>
            <Indicator
              step={selectedRestaurant ? 2 : 1}
              stepLength={4}
            />
          </div>

          <p className={styles.lost_booking}>
            {/* Lost your booking details? Press the button to resend the confirmation email. */}
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
