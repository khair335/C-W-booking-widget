import React, { useState } from "react";
import logo from "../../images/Griffin Black.png";
import sectionimage from "../../images/79205c0e916b529d8d136ce69e32e592.png";
import TextField from "@mui/material/TextField";
import "./Modify.css";
import { Link, useNavigate } from "react-router-dom";

export default function Modify() {
  const navigate = useNavigate();
  const [bookingNumber, setBookingNumber] = useState("");

  const handleNextClick = () => {
    if (!bookingNumber) {
      alert("Please fill booking number before submitting.");
      return;
    }
    navigate("/Edit", { state: { bookingNumber } }); // Pass as object
  };

  return (
    <div className="BookedMain" id="choose">
      <div className="DetailsimgMain">
        <img src={logo} alt="logo" className="logodatta" />
        <img src={sectionimage} alt="section_image" className="Data_imag" />
        <div className="changeMain">
          <div className="Changeta fixedit"></div>
          <div className="Changeta"></div>
          <div className="Changeta"></div>
          <div className="Changeta "></div>
          <div className="Changeta"></div>
        </div>
        <Link to="/Select" className="anotherpub">
          CHOOSE ANOTHER PUB
        </Link>
      </div>
      <div className="Modify-main">
        <div className="Data_type imgdata">
          <img src={logo} alt="logo" />
        </div>
        <div className="Data_type">
          <h1 className="logo-large datetilte">Modify A Booking </h1>
        </div>
        <div className="Data_type" id="Data_type1">
          <h4>
            Please Enter Your Booking Number, As Provided In Your Confirmation
            Email.
          </h4>
        </div>
        <div className="textfieldMain">
          <TextField
            required
            id="outlined-required"
            label="Booking Number"
            className="inputfeild feildproblem"
            value={bookingNumber}
            onChange={(e) => setBookingNumber(e.target.value)}
          />
          <p className="eg">E.G. XXXX-XXXX-XXXX</p>
        </div>

        <div className="Data_type ModifybtonMain">
          <button
            onClick={handleNextClick}
            className="modifybtn btn3"
            disabled={!bookingNumber}
            style={{
              backgroundColor: bookingNumber ? "#000" : "#ccc",
              color: "#fff",
              cursor: bookingNumber ? "pointer" : "not-allowed",
            }}
          >
            Edit A Booking
          </button>
          {/* <Link to="" className="modifybtn btn2">
            resend the confirmation email
          </Link> */}
        </div>
        {/* <div className="Data_type" id="Data_type1">
          <h5>
            Lost Your Booking Details? Press The Button To Resend The
            Confirmation Email.
          </h5>
        </div> */}
        <div className="ModifyMainmob">
          <div className="Modifytab fixedit"></div>
          <div className="Modifytab "></div>
          <div className="Modifytab"></div>
          <div className="Modifytab "></div>
          <div className="Modifytab "></div>
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
