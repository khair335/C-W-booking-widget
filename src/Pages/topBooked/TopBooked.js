import React from "react";
import logo from "../../images/Griffin Black.png";
import sectionimage from "../../images/79205c0e916b529d8d136ce69e32e592.png";
import logo1 from "../../images/Logo (1).png";
import sectionimg2 from "../../images/Tap & Run_MainImage 1.png";
import whitelogo from "../../images/T&R White.png";
import "./TopBooked.css";
import { Link } from "react-router-dom";
export default function Booked() {
  return (
    <div className="BookeddMain" id="choose">
      <div className="DetailsimgMain">
        <img src={whitelogo} alt="logo" className="logodata" />
        <img src={sectionimg2} alt="section_image" className="Data_imag" />
      </div>
      <div className="Confirm-main">
        <div className="Data_type">
          <h1 className="logo-large datetilte">You’re All Booked!</h1>
          <h6>See You Soon At</h6>
        </div>
        <div className="Data_type imgdata">
          <img src={logo1} alt="logo" />
        </div>
        <div className="Data_type" id="Data_type1">
          <h5>174 Main St, Swithland, Leicester LE12 8TJ, United Kingdom</h5>
          <a href="tel:+441509890535" className="numbrtag">
            +441509890535
          </a>
        </div>
        <div className="Data_type BookedbtonMain">
          <Link to="" className="Bookedbuttn btn1">
            Add to calender
          </Link>
          <Link to="/TopHome" className="Bookedbuttn btn2">
            Back To the table
          </Link>
        </div>
        <div className="Data_type ">
          <Link to="/" className="Existlink">
            Exit And Cancel Booking
          </Link>
        </div>
      </div>
    </div>
  );
}
