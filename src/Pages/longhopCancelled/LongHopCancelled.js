import React from "react";
import logo from "../../images/The Long Hop - text.png";
import sectionimage from "../../images/TheLongHop_MainiMAGE.jpg";
import styles from "./LongHopCancelled.module.css";
import PubImageHeaderLongHop from '../../components/PubImageHeaderLongHop/PubImageHeaderLongHop';
import CustomButton from '../../components/ui/CustomButton/CustomButton';

export default function LongHopCancelled() {
  return (
    <div className="CancelledMain" id="choose">
       <PubImageHeaderLongHop
        pubLogo={logo}
        sectionImg={sectionimage}
        pubLinkLabel="CHOOSE ANOTHER PUB"
        pubLink="/select"
      />
      <div className="Modify-main">
        <div className="Cancel-type imgdata">
          <img src={logo} alt="logo" />
        </div>
        <div className="Cancel-type">
          <h1 className="logo-large datetilte">Your Booking Has Been Cancelled</h1>
        </div>
        <div className="Cancel-type subtext">
          <h3>Sorry To Miss You This Time — We Hope To Welcome You Soon!</h3>
        </div>
        <div className="Cancel-type CancelbtnMain">
          <CustomButton
            label="Make a New Booking"
            to="/select"
          />
          <CustomButton
            label="Back to the site"
            to="/longhopHome"
            bgColor="#C39A7B"
            color="#FFFFFF"
          />
        </div>
      </div>
    </div>
  );
}

