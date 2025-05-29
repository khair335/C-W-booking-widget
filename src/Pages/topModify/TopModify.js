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

export default function Modify() {
  const navigate = useNavigate();
  const [bookingNumber, setBookingNumber] = useState("");

  const handleNextClick = () => {
    if (!bookingNumber) {
      alert("Please fill booking number before submitting.");
      return;
    }
    navigate("/TopEdit", { state: { bookingNumber } }); // Pass as object
  };

  return (
    <div className={styles.BookedMain} id="choose">



      <PubImageHeader
        pubLogo={logo}
        sectionImg={sectionimg2}
        pubLinkLabel="CHOOSE ANOTHER PUB"
        step={1}
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
            onChange={(e) => setBookingNumber(e.target.value)}
            style={{ flex: '0 0 180px' }}
            helperText='E.G. XXXX-XXXX-XXXX'
          />


        </div>

        <div className={`${styles.Area_type_footer} ${styles.ModifybtonMain}`}>
          <CustomButton
            onClick={handleNextClick}
            label='Edit A Booking'
            disabled={!bookingNumber}
            bgColor={bookingNumber ? "#3D3D3D" : "#ccc"}
            color={bookingNumber ? "#fff" : "#000"}

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
