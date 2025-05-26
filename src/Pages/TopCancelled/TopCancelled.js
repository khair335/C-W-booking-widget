import React from "react";
import logo1 from "../../images/Logo (1).png";
import sectionimg2 from "../../images/Tap & Run_MainImage 1.png";
import whitelogo from "../../images/T&R White.png"
import "./TopCancelled.css";
import { Link } from "react-router-dom";
export default function Cancel() {
  return (
    <div className="CancelledMain" id="choose">
      <div className="DetailsimgMain">
        <img src={whitelogo} alt="logo" className="logodatta" />
        <img src={sectionimg2} alt="section_image" className="Data_imag" />
        <Link className="anotherpub" to="/Select">CHOOSE ANOTHER PUB</Link>
      </div>
      <div className="Modify-main">
        <div className="Cancel-type imgdata">
          <img src={logo1} alt="logo" />
        </div>
        <div className="Cancel-type">
          <h1 className="logo-large datetilte">Your Booking Has Been Cancelled</h1>
        </div>
        <div className="Cancel-type belowt">
          <h3>Sorry To Miss You This Time — We Hope To Welcome You Soon!</h3>
        </div>
        <div className="Cancel-type CancelbtnMain">
          <Link to="/Select" className="Cancelbtn btn3">
          Make a New Booking
          </Link>
          <Link to="/" className="Cancelbtn btn2">
          Back to the site
          </Link>
        </div>

      </div>
    </div>
  );
}
