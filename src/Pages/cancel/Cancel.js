import React from "react";
import logo from "../../images/Griffin Black.png";
import sectionimage from "../../images/79205c0e916b529d8d136ce69e32e592.png";
import "./Cancel.css";
import { Link } from "react-router-dom";
import PubImageHeader from '../../components/PubImageHeader/PubImageHeader';
import CustomButton from '../../components/ui/CustomButton/CustomButton';
export default function Cancel() {
  return (
    <div className="CancelMain" id="choose">


      <PubImageHeader
        pubLogo={logo}
        sectionImg={sectionimage}

      />
      <div className="Modify_main">
        <div className="Cancel-type imgdata">
          <img src={logo} alt="logo" />
        </div>
        <div className="Cancel-type">
          <h1 className="logo-large datetilte">Cancel A Booking </h1>
        </div>
        <div className="subtext">
          <h3>Are You Sure You Want To Cancel Your Booking?</h3>
        </div>
        <div className="Cancel-type CancelbtnMain">

          <CustomButton
            label="Cancel A Booking"
             to="/BookingNumber"

          />
          <CustomButton
            label="Edit A Booking"
            to="/Modify"
            bgColor="#C39A7B"
            color="#FFFFFF"

          />

        </div>
        <div className="Cancel-type ">
          <Link to="/" className="exist__link">
            Exit And Cancel Booking
          </Link>
        </div>
      </div>
    </div>
  );
}
