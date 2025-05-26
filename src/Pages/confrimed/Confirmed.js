import React from "react";
import { putRequest } from "../../config/AxiosRoutes/index"
import logo from "../../images/Griffin Black.png";
import sectionimage from "../../images/79205c0e916b529d8d136ce69e32e592.png";
import dateicon from "../../images/Chips Icons Mobile.png";
import timeicon from "../../images/Chips Icons Mobile (1).png";
import membericon from "../../images/Chips Icons Mobile (3).png";
import resturanticon from "../../images/table_restaurant.png";
import "./Confirmed.css";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Confirmed() {
  const location = useLocation();
  const navigate = useNavigate();
  const submissionData = location.state;

  const handleBooking = async () => {
    const token = localStorage.getItem('token');

    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    const toUrlEncoded = (obj, prefix) => {
      const str = [];
      for (const p in obj) {
        if (obj.hasOwnProperty(p)) {
          const key = prefix ? `${prefix}[${p}]` : p;
          const value = obj[p];
          if (typeof value === 'object' && value !== null) {
            str.push(toUrlEncoded(value, key));
          } else {
            str.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
          }
        }
      }
      return str.join('&');
    };
    const {
      VisitDate,
      VisitTime,
      PartySize,
      SpecialRequests,
      IsLeaveTimeConfirmed,
      BookingNumber,
    } = submissionData || {};

    const filteredData = {
      VisitDate,
      VisitTime,
      PartySize,
      SpecialRequests,
      IsLeaveTimeConfirmed
    };

    try {
      const encodedData = toUrlEncoded(filteredData);
      const response = await putRequest(
        `/api/ConsumerApi/v1/Restaurant/CatWicketsTest/Booking/${BookingNumber}`,
        headers,
        encodedData
      );
      console.log('Booking Updated Success:', response.data);
      navigate('/Updated');
    } catch (error) {
      console.error('Booking Failed:', error);
    }
  };

  return (
    <div className="ConfirmMain" id="choose">
      <div className="DetailsimgMain">
        <img src={logo} alt="logo" className="logodata" />
        <img src={sectionimage} alt="section_image" className="Data_imag" />
        <div className="changeMain">
          <div className="changetab"></div>
          <div className="changetab"></div>
          <div className="changetab "></div>
          <div className="changetab fixedit"></div>
        </div>
        <Link to="/Select" className="anotherpub">
          CHOOSE ANOTHER PUB
        </Link>
      </div>
      <div className="Confirm-main">
        <div className="Data_type">
          <h1 className="logo-large datetilte">Confirm Your Details Below</h1>
          <h6>You Are About To Place A Booking At:</h6>
        </div>
        <div className="Data_type" id="Data_type1">
          <div className="Confirmtitle_type">
            <img src={dateicon} alt="date_icon" />
            {submissionData.VisitDate || "Select Date"}
          </div>
          <div className="Confirmtitle_type">
            <img src={timeicon} alt="time_icon" /> {submissionData.VisitTime || "Select Time"}
          </div>
          <div className="Confirmtitle_type">
            <img src={membericon} alt="member_icon" />{submissionData.PartySize || "Select Party Size"}
          </div>
          <div className="Confirmtitle_type">
            <img src={resturanticon} alt="react_icon" />
            {submissionData?.PromotionName || "Select Area"}
          </div>
        </div>
        <img src={logo} alt="logo" />
        <h5>Your Booking Info</h5>
        <div className="Data_type inputmain">
          <div className="confirmedData">
            <p className="confirmedDatatype">
              First Name: &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;{" "}
              <span className="namedata">{submissionData.Customer.FirstName}</span>
            </p>
          </div>
          <div className="confirmedData">
            <p className="confirmedDatatype">
              Last Name: &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;{" "}
              <span className="namedata">{submissionData.Customer.Surname}</span>
            </p>
          </div>
          <div className="confirmedData">
            <p className="confirmedDatatype">
              Mobile Number: &nbsp; &nbsp; &nbsp;
              <span className="namedata">{submissionData.Customer.Mobile}</span>
            </p>
          </div>
          <div className="confirmedData emaildata">
            <p className="confirmedDatatype ">
              Email Address: &nbsp; &nbsp; &nbsp; &nbsp;
              <span className="namedata">{submissionData.Customer.Email}</span>
            </p>
          </div>
          <h4 className="comt">Comment</h4>
          <div className="commentsdata">
            {submissionData.SpecialRequests || "No Comment"}
          </div>
        </div>
        <div className="Data_type inputmain">
          <div className="tabletext">
            <p className="checktext">
              I would like to receive news and offers from Tap & Run by email
            </p>
            <input
              className="form-check-input check_box"
              type="checkbox"
              checked
              value=""
              id="flexCheckDefault"
            />
          </div>
        </div>
        <div className="Data_type ConfirmbtonMain">
          <button className="Confirmbuttn btn1" onClick={handleBooking}>
            Book A Table
          </button>
          <Link to="/Details" className="Confirmbuttn btn2">
            Back
          </Link>
        </div>
        <div className="DetailsMainmob">
          <div className="Detailstab "></div>
          <div className="Detailstab"></div>
          <div className="Detailstab "></div>
          <div className="Detailstab fixedit"></div>
        </div>
        <div className="Data_type ">
          <Link to="/Select" className="anotherpub2">
            CHOOSE ANOTHER PUB
          </Link>
          <Link to="/" className="Existlink">
            Exit And Cancel Booking
          </Link>
        </div>
      </div>
    </div>
  );
}
