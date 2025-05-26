import React from "react";
import logo from "../../images/Griffin Black.png";
import sectionimage from "../../images/79205c0e916b529d8d136ce69e32e592.png";
import TextField from "@mui/material/TextField";
import logo1 from "../../images/Logo (1).png";
import sectionimg2 from "../../images/Tap & Run_MainImage 1.png";
import whitelogo from "../../images/T&R White.png"
import "./TopLost.css";
import { Link } from "react-router-dom";
export default function TopLost() {
  return (
    <div className="LostMain" id="choose">
      <div className="DetailsimgMain">
        <img src={whitelogo} alt="logo" className="logodatta" />
        <img src={sectionimg2} alt="section_image" className="Data_imag" />
        <div className="Bookingmainmob">
          <div className="BookingNumtab fixedit"></div>
          <div className="BookingNumtab"></div>
        </div>
      </div>
      <div className="Modify-main">
        <div className="Nbooking-type imgdata">
          <img src={logo1} alt="logo" />
        </div>
        <div className="Nbooking-type">
          <h1 className="logo-large datetilte">Lost Your Booking Details?</h1>
        </div>
        <div className="Nbooking-type belowt" id="Nbooking-type1">
          <h4>
          Enter Your Email And We’ll Resend Your Confirmation.
          </h4>
        </div>
        <div className="textfieldMain">
          <TextField
            required
            id="outlined-required"
            label="Email Address"
            defaultValue="Enter A Valid Email"
            className="inputfeild feildproblem"
          />
          <p className="eg">E.G. name@gmail.com</p>
        </div>
        <div className="Nbooking-type DatabtonMain">
          <Link to="/TopResent" className="modifybtn btn3">
          resend confirmation
          </Link>
          <Link to="/TopBookingNumber" className="modifybtn btn2">
            Back
          </Link>
        </div>
        <div className="BookingNmob">
          <div className="BookingNtab fixedit"></div>
          <div className="BookingNtab "></div>
        </div>
        <div className="Nbooking-type existmail">
          <Link to="/TopHome" className="Existlink">
            Exit Cancellation
          </Link>
        </div>
      </div>
    </div>
  );
}
