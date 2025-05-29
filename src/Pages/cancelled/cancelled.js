import React from "react";
import logo from "../../images/Griffin Black.png";
import sectionimage from "../../images/79205c0e916b529d8d136ce69e32e592.png";
import "./cancelled.css";
import PubImageHeader from '../../components/PubImageHeader/PubImageHeader';
import CustomButton from '../../components/ui/CustomButton/CustomButton';
export default function Cancel() {
  return (
    <div className="CancelledMain" id="choose">


       <PubImageHeader
        pubLogo={logo}
        sectionImg={sectionimage}
        pubLinkLabel="CHOOSE ANOTHER PUB"
        pubLink="/Select"
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
            to="/Select"

          />
          <CustomButton
            label="Back to the site"
            to="/"
            bgColor="#C39A7B"
            color="#FFFFFF"

          />
        </div>

      </div>
    </div>
  );
}
