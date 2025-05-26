import React from "react";
import logo from "../../images/Griffin Black.png";
import sectionimage from "../../images/79205c0e916b529d8d136ce69e32e592.png";
import TextField from "@mui/material/TextField";
import "./ReSent.css";
import { Link } from "react-router-dom";
export default function Resent() {
  return (
    <div className="ReSentMain" id="choose">
      <div className="DetailsimgMain">
        <img src={logo} alt="logo" className="logodatta" />
        <img src={sectionimage} alt="section_image" className="Data_imag" />
        <div className="Bookingmainmob">
          <div className="BookingNumtab"></div>
          <div className="BookingNumtab fixedit"></div>
        </div>
      </div>
      <div className="Modify-main">
        <div className="Nbooking-type imgdata">
          <img src={logo} alt="logo" />
        </div>
        <div className="Nbooking-type">
          <h1 className="logo-large datetilte">Cancel A Booking</h1>
        </div>
        <div className="Nbooking-type belowt" id="Nbooking-type1">
          <h4>
          We’ve Re-sent Your Confirmation Code. Please Check Your Email.
          </h4>
        </div>
        <div className="textfieldMain">
          <TextField
            required
            id="outlined-required"
            label="Booking Number"
            defaultValue="Enter Your Booking Number"
            className="inputfeild feildproblem"
          />
          <p className="eg">E.G. XXXX-XXXX-XXXX</p>
        </div>
        <select
          class="form-select form-select-lg mb-2 selectrdata "
          aria-label=".form-select example"
        >
          <option selected className="reasonmain">
            The Reason For Cancellation
          </option>
          <option value="1" className="reasonmain">
            Illness
          </option>
          <option value="2" className="reasonmain">
            Change Of Plans
          </option>
          <option value="3" className="reasonmain">
            Booked The Wrong Date/Time
          </option>
          <option value="4" className="reasonmain">
            Found Another Venue
          </option>
          <option value="5" className="reasonmain">
            Personal Reason
          </option>
          <option value="6" className="reasonmain">
            Prefer Not To Answer
          </option>
        </select>
        <div className="Nbooking-type DatabtonMain">
          <Link to="/Cancelled" className="modifybtn btn3">
            Cancel A Booking
          </Link>
          {/* <Link to="" className="modifybtn btn2">
            resend confirmation
          </Link> */}
        </div>
        <div className="BookingNmob">
          <div className="BookingNtab "></div>
          <div className="BookingNtab fixedit"></div>
        </div>
        <div className="Nbooking-type existmail">
          <Link to="/" className="Existlink">
            Exit Cancellation
          </Link>
        </div>
      </div>
    </div>
  );
}
