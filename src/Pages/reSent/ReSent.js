import React, { useState } from "react";
import logo from "../../images/Griffin Black.png";
import sectionimage from "../../images/79205c0e916b529d8d136ce69e32e592.png";
import TextField from "@mui/material/TextField";
import styles from "./ReSent.module.css";
import { Link } from "react-router-dom";
import PubImageHeader from '../../components/PubImageHeader/PubImageHeader';
import CustomInput from '../../components/ui/CustomInput/CustomInput';
import DropDown from '../../components/ui/DropDown/DropDown';
import CustomButton from '../../components/ui/CustomButton/CustomButton';
import Indicator from '../../components/Indicator/Indicator';
export default function Resent() {
  const [bookingNumber, setBookingNumber] = useState('');
  const [reason, setReason] = useState('');
  return (
    <div className={styles.ReSentMain} id="choose">

          <PubImageHeader
        pubLogo={logo}
        sectionImg={sectionimage}
        step={2}
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
          We’ve Re-sent Your Confirmation Code. Please Check Your Email.
          </h4>
        </div>
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
          }}
          value={reason}
          placeholder="Select Reason"
          isLoading={false}
          noDataMessage="No options available"
        />

        <div className={`${styles.Nbooking_type} ${styles.DatabtonMain}`}>

            <CustomButton
            label="resend confirmation"
            to="/Cancelled"

          />

        </div>
        <div className={styles.chose_m_link}>
         <Indicator
            step={3}
            stepLength={2}
          />
        </div>
        <div className={`${styles.Nbooking_type} ${styles.existmail}`}>
          <Link to="/" className="exist__link">
            Exit Cancellation
          </Link>
        </div>
        </div>
        </div>
    </div>
  );
}
