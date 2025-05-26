import React from "react";
import logo from "../../images/Griffin Black.png";
import sectionimage from "../../images/79205c0e916b529d8d136ce69e32e592.png";
import "./Cancel.css";
import { Link } from "react-router-dom";
export default function Cancel() {
  return (
    <div className="CancelMain" id="choose">
      <div className="DetailsimgMain">
        <img src={logo} alt="logo" className="logodatta" />
        <img src={sectionimage} alt="section_image" className="Data_imag" />
      </div>
      <div className="Modify-main">
        <div className="Cancel-type imgdata">
          <img src={logo} alt="logo" />
        </div>
        <div className="Cancel-type">
          <h1 className="logo-large datetilte">Cancel A Booking </h1>
        </div>
        <div className="Cancel-type belowt">
          <h3>Are You Sure You Want To Cancel Your Booking?</h3>
        </div>
        <div className="Cancel-type CancelbtnMain">
          <Link to="/BookingNumber" className="Cancelbtn btn3">
            Cancel A Booking
          </Link>
          <Link to="/Modify" className="Cancelbtn btn2">
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
