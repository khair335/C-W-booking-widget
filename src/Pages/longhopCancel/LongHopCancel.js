import React from "react";
import logo from "../../images/The Long Hop - text.png";
import sectionimage from "../../images/TheLongHop_MainiMAGE.jpg";
import styles from "./LongHopCancel.module.css";
import { Link } from "react-router-dom";
import PubImageHeaderLongHop from '../../components/PubImageHeaderLongHop/PubImageHeaderLongHop';
import CustomButton from '../../components/ui/CustomButton/CustomButton';

export default function LongHopCancel() {
  return (
    <div className="CancelMain" id="choose">


      <PubImageHeaderLongHop
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
             to="/longhopBookingNumber"

          />
          <CustomButton
            label="Edit A Booking"
            to="/longhopModify"
            bgColor="#C39A7B"
            color="#FFFFFF"

          />

        </div>
        <div className="Cancel-type ">
          <Link to="/longhopHome" className="exist__link">
            Exit And Cancel Booking
          </Link>
        </div>
      </div>
    </div>
  );
}

