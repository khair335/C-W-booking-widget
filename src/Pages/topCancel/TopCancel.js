import React from "react";
import logo1 from "../../images/Logo (1).png";
import sectionimg2 from "../../images/Tap & Run_MainImage 1.png";
import whitelogo from "../../images/T&R White.png"
import "./TopCancel.css";
import { Link } from "react-router-dom";
export default function Cancel() {
  return (
    <div className="CancelMain" id="choose">
      <div className="DetailsimgMain">
        <img src={whitelogo} alt="logo" className="logodatta" />
        <img src={sectionimg2} alt="section_image" className="Data_imag" />
      </div>
      <div className="Modify-main">
        <div className="Cancel-type imgdata">
          <img src={logo1} alt="logo" />
        </div>
        <div className="Cancel-type">
          <h1 className="logo-large datetilte">Cancel A Booking </h1>
        </div>
        <div className="Cancel-type belowt">
          <h3>Are You Sure You Want To Cancel Your Booking?</h3>
        </div>
        <div className="Cancel-type CancelbtnMain">
          <Link to="/TopBookingNumber" className="Cancelbtn btn3">
            Cancel A Booking
          </Link>
          <Link to="/TopModify" className="Cancelbtn btn2">
            Edit A Booking
          </Link>
        </div>
        <div className="Cancel-type ">
          <Link to="/" className="Existlink">
            Exit And Cancel Booking
          </Link>
        </div>
      </div>
    </div>
  );
}
