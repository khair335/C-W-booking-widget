import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import dateicon from "../../images/Chips Icons Mobile.png";
import timeicon from "../../images/Chips Icons Mobile (1).png";
import membericon from "../../images/Chips Icons Mobile (3).png";
import reacticon from "../../images/Chips Icons Mobile (2).png";
import resturanticon from "../../images/table_restaurant.png";
import logo1 from "../../images/Logo (1).png";
import sectionimg2 from "../../images/Tap & Run_MainImage 1.png";
import whitelogo from "../../images/T&R White.png";
import TextField from "@mui/material/TextField";
import "./TopDetail.css";

export default function Details() {
  const location = useLocation();
  const navigate = useNavigate();
  const { date, time, adults, children, selectedPromotion } = location.state || {};
  const [globalError, setGlobalError] = useState('');
  const [formData, setFormData] = useState({
    SpecialRequests: '',
    PromotionId: 0,
    PromotionName: '',
    IsLeaveTimeConfirmed:true,
    Customer: {
      FirstName: '',
      Surname: '',
      MobileCountryCode: '+44',
      Mobile: '',
      Email: '',
      ReceiveEmailMarketing: false,
      ReceiveSmsMarketing: false,
      ReceiveRestaurantEmailMarketing: false,
      ReceiveRestaurantSmsMarketing: false,
    },
    DateOfBirth: '',
  });
  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      Customer: {
        ...prev.Customer,
        [field]: value,
      },
    }));
  };

  const handleMarketingChange = (e) => {
    const isChecked = e.target.checked;
    setFormData((prev) => ({
      ...prev,
      Customer: {
        ...prev.Customer,
        ReceiveEmailMarketing: isChecked,
        ReceiveSmsMarketing: isChecked,
        ReceiveRestaurantEmailMarketing: isChecked,
        ReceiveRestaurantSmsMarketing: isChecked,
      },
    }));
  };

  const handleDateChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      DateOfBirth: e.target.value,
    }));
  };

  const handleSpecialRequestChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      SpecialRequests: e.target.value,
    }));
  };

  const handleNextClick = () => {
    const newErrors = {};

    if (!formData.Customer.FirstName.trim()) newErrors.FirstName = 'First name is required';
    if (!formData.Customer.Surname.trim()) newErrors.Surname = 'Last name is required';
    if (!formData.Customer.Mobile.trim()) newErrors.Mobile = 'Mobile number is required';
    if (!formData.Customer.Email.trim()) newErrors.Email = 'Email address is required';
    if (!formData.DateOfBirth) newErrors.DateOfBirth = 'Date of birth is required';
    if (!date) newErrors.VisitDate = 'Visit date is required';
    if (!time) newErrors.VisitTime = 'Visit time is required';
    if (!adults || !children) newErrors.PartySize = 'At least one guest is required';

    if (Object.keys(newErrors).length > 0) {
      setGlobalError('Please fill in all required fields correctly.');
      return;
    }

    setGlobalError('');
    const submissionData = {
      ...formData,
      VisitDate: date,
      VisitTime: time,
      PartySize: adults + children,
      PromotionId: selectedPromotion?.Id,
      PromotionName: selectedPromotion?.Name,
      ChannelCode: 'ONLINE',
    };
    console.log('Submission Data:', submissionData);
    navigate("/topConfirm", { state: submissionData });
  };

  return (
    <div className="DetailsMain" id="choose">
      <div className="DetailsimgMain">
        <img src={whitelogo} alt="logo" className="logodata" />
        <img src={sectionimg2} alt="section_" className="Data_imag" />
        <div className="changeMain">
          <div className="changetab"></div>
          <div className="changetab"></div>
          <div className="changetab fixedit"></div>
          <div className="changetab"></div>
        </div>
        <Link to="/Select" className="anotherpub">
          CHOOSE ANOTHER PUB
        </Link>
      </div>
      <div className="Dmain">
        <div className="Data_type imgdata">
          <img src={logo1} alt="logo" />
        </div>
        <div className="Data_type">
          <h1 className="logo-large datetilte">Enter Your Details</h1>
        </div>
        <div className="Data_type" id="Data_type1">
          <div className="Detailtitle_type">
            <img src={dateicon} alt="date_icon" />
            {date ? date : "Select Date"}
          </div>
          <div className="Detailtitle_type">
            <img src={timeicon} alt="time_icon" />
            {time ? time : "Select Time"}
          </div>
          <div className="Detailtitle_type">
            <img src={membericon} alt="member_icon" />
            {adults || 0}
          </div>
          <div className="Detailtitle_type">
            <img src={reacticon} alt="react_icon" />
            {children || 0}
          </div>
          <div className="Detailtitle_type">
            <img src={resturanticon} alt="react_icon" />
            {selectedPromotion?.Name || "Select Area"}
          </div>
        </div>
        {globalError && (
          <div style={{ color: 'red', marginBottom: '1rem', fontWeight: 'bold' }}>
            {globalError}
          </div>
        )}
        <div className="Data_type inputmain">
          <TextField
            required
            label="First Name"
            value={formData.Customer.FirstName}
            onChange={(e) => handleChange('FirstName', e.target.value)}
            className="inputfeild"
          />
          <TextField
            required
            label="Last Name"
            value={formData.Customer.Surname}
            onChange={(e) => handleChange('Surname', e.target.value)}
            className="inputfeild"
          />
          <div className="textfieldMain">
            <div className="feildproblem" style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
              <TextField
                required
                label="Country Code"
                value={formData.Customer.MobileCountryCode}
                onChange={(e) => handleChange('MobileCountryCode', e.target.value)}
                style={{ flex: '0 0 180px' }}
              />
              <TextField
                required
                label="Mobile Number"
                value={formData.Customer.Mobile}
                onChange={(e) => handleChange('Mobile', e.target.value)}
                style={{ flex: 1, width: '100% !important' }}
              />
            </div>
            <p className="eg">E.G. +44 7111 111111</p>
          </div>
          <div className="textfieldMain">
            <TextField
              required
              label="Email Address"
              value={formData.Customer.Email}
              onChange={(e) => handleChange('Email', e.target.value)}
              className="inputfeild feildproblem"
            />
            <p className="eg">E.G. Name@gmail.com</p>
          </div>
          <div className="textfieldMain">
            <input
              type="date"
              label="Date of Birth"
              value={formData.DateOfBirth}
              onChange={handleDateChange}
              onFocus={(e) => e.target.showPicker?.()}
              className="inputfeild feildproblem comments inputunik"
            />
            <p className="eg">Date of Birth</p>
          </div>
          <div className="textfieldMain">
            <TextField
              required
              label="Special Requests"
              value={formData.SpecialRequests}
              onChange={handleSpecialRequestChange}
              className="inputfeild feildproblem comments"
            />
            <p className="eg">2000 of 2000 characters remaining</p>
          </div>
          <div className="tabletext">
            <p className="checktext">
              I would like to receive news and offers from Tap & Run by email
            </p>
            <input
              className="form-check-input check_box"
              type="checkbox"
              checked={formData.Customer.ReceiveEmailMarketing}
              onChange={handleMarketingChange}
            />
          </div>
        </div>
        <div className="Data_type DetailbnMain">
          <Link to="/TopArea" className="detailbutton">
            BACK
          </Link>
          <button
            className="griffinbuttn3"
            onClick={handleNextClick}
            style={{
              backgroundColor: "#000",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            NEXT
          </button>
        </div>
        <div className="DetailsMainmob">
          <div className="Detailstab "></div>
          <div className="Detailstab"></div>
          <div className="Detailstab fixed"></div>
          <div className="Detailstab"></div>
        </div>
        <div className="Data_type ">
          <Link to="/Select" className="anotherpub2">
            CHOOSE ANOTHER PUB
          </Link>
          <Link to="/TopHome" className="Existlink">
            Exit And Cancel Booking
          </Link>
        </div>
      </div>
    </div>
  );
}
