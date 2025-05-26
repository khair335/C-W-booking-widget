import React, { useState } from "react";
import { postRequest } from "../../config/AxiosRoutes/index"
import TextField from "@mui/material/TextField";
import logo1 from "../../images/Logo (1).png";
import sectionimg2 from "../../images/Tap & Run_MainImage 1.png";
import whitelogo from "../../images/T&R White.png"
import "./TopBookingNumber.css";
import { Link, useNavigate } from "react-router-dom";

export default function TopBookingNumber() {
  const [bookingNumber, setBookingNumber] = useState("");
  const [reasonId, setReasonId] = useState(1);
  const navigate = useNavigate();
  
  const handleCancelBooking = async () => {
    if (!bookingNumber || !reasonId) {
      alert("Please fill all fields before submitting.");
      return;
    }

    const token = localStorage.getItem("token");
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const data = {
      micrositeName: "CatWicketsTest",
      bookingReference: bookingNumber,
      cancellationReasonId: parseInt(reasonId),
    };

    try {
      const response = await postRequest(
        `/api/ConsumerApi/v1/Restaurant/CatWicketsTest/Booking/${bookingNumber}/Cancel`,
        headers,
        data
      );
      console.log("Cancel booking response:", response.data);
      navigate("/TopCancelled");
    } catch (error) {
      console.error("Cancel booking error:", error);
      alert("Failed to cancel the booking. Please try again.");
    }
  };

  return (
    <div className="BookednMain" id="choose">
      <div className="DetailsimgMain">
        <img src={whitelogo} alt="logo" className="logodatta" />
        <img src={sectionimg2} alt="section_image" className="Data_imag" />
        <div className="Bookingmainmob">
          <div className="BookingNumtab fixedit"></div>
          <div className="BookingNumtab"></div>
        </div>
      </div>
      <div className="Modify-main">
        <div className="Nbooking-type imgdata">
          <img src={logo1} alt="logo" />
        </div>
        <div className="Nbooking-type">
          <h1 className="logo-large datetilte">Cancel A Booking</h1>
        </div>
        <div className="Nbooking-type belowt" id="Nbooking-type1">
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

      <select
        className="form-select form-select-lg mb-2 selectrdata"
        value={reasonId}
        onChange={(e) => setReasonId(e.target.value)}
      >
        <option value="">The Reason For Cancellation</option>
        <option value="1">Illness</option>
        <option value="2">Change Of Plans</option>
        <option value="3">Booked The Wrong Date/Time</option>
        <option value="4">Found Another Venue</option>
        <option value="5">Personal Reason</option>
        <option value="6">Prefer Not To Answer</option>
      </select>
        <div className="Nbooking-type DatabtonMain">
        <button onClick={handleCancelBooking} className="modifybtn btn3">
          Cancel A Booking
        </button>
          {/* <Link to="/TopLost" className="modifybtn btn2">
            resend confirmation
          </Link> */}
        </div>
        {/* <div className="Nbooking-type" id="Nbooking-type1">
          <h5>
            Lost Your Booking Details? Press The Button To Resend The
            Confirmation Email.
          </h5>
        </div> */}
        <div className="BookingNmob">
          <div className="BookingNtab fixedit"></div>
          <div className="BookingNtab "></div>
        </div>
        <div className="Nbooking-type existemail">
          <Link to="/TopHome" className="Existlink">
            Exit Cancellation
          </Link>
        </div>
      </div>
    </div>
  );
}
