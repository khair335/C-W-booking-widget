import React, { useState } from "react";
import { postRequest } from "../../config/AxiosRoutes/index"
import { getCurrentRestaurant } from '../../utils/restaurantUtils';
import logo from "../../images/The Long Hop - text.png";
import sectionimage from "../../images/TheLongHop_MainiMAGE.jpg";
import TextField from "@mui/material/TextField";
import styles from "./LongHopBookingNumber.module.css";
import { Link, useNavigate } from "react-router-dom";
import PubImageHeader from '../../components/PubImageHeader/PubImageHeader';
import CustomInput from '../../components/ui/CustomInput/CustomInput';
import DropDown from '../../components/ui/DropDown/DropDown';
import CustomButton from '../../components/ui/CustomButton/CustomButton';
import Indicator from '../../components/Indicator/Indicator';
import CircularProgress from '@mui/material/CircularProgress';

export default function LongHopBookingNumber() {
 const [bookingNumber, setBookingNumber] = useState("");
  const [reasonId, setReasonId] = useState(1);
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleCancelBooking = async () => {
    setError(''); // Clear any previous errors

    // Validation
    if (!bookingNumber.trim()) {
      setError('Please enter a booking number');
      return;
    }
    if (!reason) {
      setError('Please select a cancellation reason');
      return;
    }

    setIsLoading(true);
    const token = localStorage.getItem("token");
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const data = {
      micrositeName: "TheLongHop",
      bookingReference: bookingNumber,
      cancellationReasonId: parseInt(reasonId),
    };

    try {
      const restaurant = getCurrentRestaurant('longHop', window.location.pathname);
      console.log("Long Hop Cancel - Making API call to:", `/api/ConsumerApi/v1/Restaurant/${restaurant}/Booking/${bookingNumber}/Cancel`);
      
      const response = await postRequest(
        `/api/ConsumerApi/v1/Restaurant/${restaurant}/Booking/${bookingNumber}/Cancel`,
        headers,
        data
      );
      console.log("Long Hop - Cancel booking response:", response.data);
      navigate("/longhopCancelled");
    } catch (error) {
      console.error("Long Hop - Cancel booking error:", error);
      setError(error.response?.data?.message || 'Failed to cancel the booking. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className={styles.ReSentMain} id="choose">

          <PubImageHeader
        pubLogo={logo}
        sectionImg={sectionimage}
        step={1}
        stepLength={2}
      />

      <div className={styles.Modify_main}>


      <div className={styles.Modify_main_container} >
        <div className={`${styles.Nbooking_type} ${styles.imgdata}`}>
          <img src={logo} alt="logo" />
        </div>
        <div className={styles.Nbooking_type}>
          <h1 className={`${styles.logo_large} ${styles.datetilte}`}>Cancel A Booking</h1>
        </div>
        <div className={`${styles.Nbooking_type} ${styles.belowt}`} id="Nbooking-type1">
          <h4 className={styles.subtext}>
          We've Re-sent Your Confirmation Code. Please Check Your Email.
          </h4>
        </div>
        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}
        <div className={styles.textfieldMain}>

                <CustomInput
            required
            label="Booking Number"
            value={bookingNumber}
            onChange={(e) => {
              setBookingNumber(e.target.value);
              setError(''); // Clear error when user types
            }}
            style={{ flex: '0 0 180px' }}
            helperText='E.G. XXXX-XXXX-XXXX'
            error={!!error && !bookingNumber.trim()}
            disabled={isLoading}
          />
        </div>

        <DropDown
        label="The Reason For Cancellation"
          options={
            [{
              label: 'Illness',
              value: 'Illness'
            },
              {
                label: 'Change Of Plans',
                value: 'Change Of Plans'
              },
              {
                label: 'Booked The Wrong Date/Time',
                value: 'Booked The Wrong Date/Time'
              },
              {
                label: 'Found Another Venue',
                value: 'Found Another Venue'
              },
              {
                label: 'Personal Reason',
                value: 'Personal Reason'
              },
              {
                label: 'Prefer Not To Answer',
                value: 'Prefer Not To Answer'
              }
            ]}
          onChange={(value) => {
            setReason(value);
            setError(''); // Clear error when user selects
          }}
          value={reason}
          placeholder="Select Reason"

          noDataMessage="No options available"
          error={!!error && !reason}

        />

        <div className={`${styles.Nbooking_type} ${styles.DatabtonMain}`}>

            <CustomButton
            label={isLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CircularProgress size={20} color="inherit" />
                Cancelling...
              </div>
            ) : "Cancel A Booking"}
           onClick={handleCancelBooking}
            disabled={isLoading}
            />


        </div>
        <div className={styles.chose_m_link}>
         <Indicator
            step={1}
            stepLength={2}
          />
        </div>
        <div className={`${styles.Nbooking_type} ${styles.existmail}`}>
          <Link to="/longhopHome" className="exist__link">
            Exit Cancellation
          </Link>
        </div>
        </div>
        </div>
    </div>
  );
}

