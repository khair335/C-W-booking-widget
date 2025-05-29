import React, { useState } from "react";
import logo from "../../images/Griffin Black.png";
import sectionimage from "../../images/79205c0e916b529d8d136ce69e32e592.png";
import TextField from "@mui/material/TextField";
import styles from "./Lost.module.css";
import { Link } from "react-router-dom";
import PubImageHeader from '../../components/PubImageHeader/PubImageHeader';
import CustomInput from '../../components/ui/CustomInput/CustomInput';
import CustomButton from '../../components/ui/CustomButton/CustomButton';
import Indicator from '../../components/Indicator/Indicator';
export default function Lost() {
  const [email, setEmail] = useState('');
  return (
    <div className={styles.LostMain} id="choose">


      <PubImageHeader
        pubLogo={logo}
        sectionImg={sectionimage}
        step={1}
        stepLength={2}
      />

      <div className={styles.Modify_main}>
        <div className={`${styles.Nbooking_type} ${styles.imgdata}`} >
          <img src={logo} alt="logo" />
        </div>
        <div className={styles.Nbooking_type}>
          <h1 className={`${styles.logo_large} ${styles.datetilte}`}>Lost Your Booking Details?</h1>
        </div>
        <div className={`${styles.Nbooking_type} ${styles.belowt}`} id="Nbooking-type1">
          <h4 className={styles.subtext}>
            Enter Your Email And We’ll Resend Your Confirmation.
          </h4>
        </div>
        <div className={styles.textfieldMain}>


          <CustomInput
            required
            label="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ flex: '0 0 180px' }}
            helperText='E.G. name@gmail.com'
          />
        </div>
        <div className={`${styles.DatabtonMain} ${styles.Nbooking_type}`}>


          <CustomButton
            label="resend confirmation"
            to="/Resent"

          />
          <CustomButton
            label="Back"
            to="/BookingNumber"
            bgColor="#C39A7B"
            color="#FFFCF7"
          />
        </div>
        <div className={styles.chose_m_link}>
          <Indicator
            step={1}
            stepLength={2}
          />
        </div>
        <div className={`${styles.existmail} ${styles.Nbooking_type}`}>
          <Link to="/" className="exist__link">
            Exit Cancellation
          </Link>
        </div>
      </div>
    </div>
  );
}
