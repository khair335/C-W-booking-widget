import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from "react-router-dom";
import logo from "../../images/Griffin Black.png";
import sectionimage from "../../images/79205c0e916b529d8d136ce69e32e592.png";
import dateicon from "../../images/Chips Icons Mobile.png";
import timeicon from "../../images/Chips Icons Mobile (1).png";
import membericon from "../../images/Chips Icons Mobile (3).png";
import reacticon from "../../images/Chips Icons Mobile (2).png";
import resturanticon from "../../images/table_restaurant.png";
import TextField from "@mui/material/TextField";
import styles from "./Details.module.css";
import PubImageHeader from '../../components/PubImageHeader/PubImageHeader';
import InfoChip from '../../components/InfoChip/InfoChip';
import CustomInput from '../../components/ui/CustomInput/CustomInput';
import DatePicker from '../../components/ui/DatePicker/DatePicker';
import CustomCheckbox from '../../components/ui/CustomCheckbox/CustomCheckbox';
import CustomButton from '../../components/ui/CustomButton/CustomButton';
import Indicator from '../../components/Indicator/Indicator';
import { updateCustomerDetails, updateCurrentStep, updateSpecialRequests } from '../../store/bookingSlice';
import CustomTextarea from '../../components/ui/CustomTextarea/CustomTextarea';

export default function Details() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get state from Redux
  const bookingState = useSelector((state) => state.booking);
  const {
    date,
    time,
    adults,
    children,
    selectedPromotion,
    customerDetails,
    specialRequests
  } = bookingState;

  // Format date for display
  const displayDate = React.useMemo(() => {
    if (!date) return "Select Date";
    try {
      const [year, month, day] = date.split('-').map(Number);
      const dateObj = new Date(year, month - 1, day);
      return dateObj.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return "Select Date";
    }
  }, [date]);

  // Local state
  const [globalError, setGlobalError] = useState('');
  const [formData, setFormData] = useState({
    SpecialRequests: specialRequests || '',
    PromotionId: 0,
    PromotionName: '',
    IsLeaveTimeConfirmed: true,
    Customer: {
      FirstName: '',
      Surname: '',
      MobileCountryCode: '+44',

      Mobile: '',
      Email: '',
      Birthday: '',
      ReceiveEmailMarketing: false,
      ReceiveSmsMarketing: false,
      ReceiveRestaurantEmailMarketing: false,
      ReceiveRestaurantSmsMarketing: false,
    },
  });

  // Sync form data with Redux state
  useEffect(() => {
    if (customerDetails) {
      setFormData(prev => ({
        ...prev,
        Customer: {
          ...prev.Customer,
          ...customerDetails
        }
      }));
    }
  }, [customerDetails]);

  // Update the useEffect that sets special requests
  useEffect(() => {
    // Only add children prefix if there are children
    const childrenPrefix = children > 0 ? `Includes ${children} children` : '';
    setFormData(prev => ({
      ...prev,
      SpecialRequests: childrenPrefix
    }));
    dispatch(updateSpecialRequests(childrenPrefix));
  }, [children, dispatch]);

  const handleChange = (field, value) => {
    const updatedCustomer = {
      ...formData.Customer,
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      Customer: updatedCustomer
    }));
    dispatch(updateCustomerDetails({ [field]: value }));
  };

  const handleMarketingChange = (e) => {
    const isChecked = e.target.checked;
    const updatedCustomer = {
      ...formData.Customer,
      ReceiveEmailMarketing: isChecked,
      ReceiveSmsMarketing: isChecked,
      ReceiveRestaurantEmailMarketing: isChecked,
      ReceiveRestaurantSmsMarketing: isChecked,
    };
    setFormData(prev => ({
      ...prev,
      Customer: updatedCustomer
    }));
    dispatch(updateCustomerDetails({
      ReceiveEmailMarketing: isChecked,
      ReceiveSmsMarketing: isChecked,
      ReceiveRestaurantEmailMarketing: isChecked,
      ReceiveRestaurantSmsMarketing: isChecked,
    }));
  };

  // Update the handleSpecialRequestChange function
  const handleSpecialRequestChange = (e) => {
    const value = e.target.value;
    const childrenPrefix = children > 0 ? `Includes ${children} children` : '';

    // Remove the children prefix if it exists
    const userInput = value.replace(/^Includes \d+ children(?: - )?/, '');

    // Only add the prefix if there are children
    const formattedRequest = children > 0
      ? `${childrenPrefix}${userInput ? ` - ${userInput}` : ''}`
      : userInput;

    setFormData(prev => ({
      ...prev,
      SpecialRequests: formattedRequest
    }));
    dispatch(updateSpecialRequests(formattedRequest));
  };

  const handleNextClick = () => {
    const newErrors = {};

    if (!formData.Customer.FirstName.trim()) newErrors.FirstName = 'First name is required';
    if (!formData.Customer.Surname.trim()) newErrors.Surname = 'Last name is required';
    if (!formData.Customer.Mobile.trim()) newErrors.Mobile = 'Mobile number is required';
    if (!formData.Customer.Email.trim()) newErrors.Email = 'Email address is required';
    if (!formData.Customer.Birthday) newErrors.Birthday = 'Date of birth is required';
    if (!date) newErrors.VisitDate = 'Visit date is required';
    if (!time) newErrors.VisitTime = 'Visit time is required';
    if (!adults) newErrors.PartySize = 'At least one guest is required';

    if (Object.keys(newErrors).length > 0) {
      setGlobalError('Please fill in all required fields correctly.');
      return;
    }

    setGlobalError('');
    dispatch(updateCurrentStep(4));
    navigate("/Confirm");
  };

  return (
    <div className={styles.DetailsMain} id="choose">
      <PubImageHeader
        pubLogo={logo}
        sectionImg={sectionimage}
        pubLinkLabel="CHOOSE ANOTHER PUB"
        step={3}
        pubLink="/Select"
      />
      <div className={styles.Dmain}>
        <div className={`${styles.Data_type} ${styles.imgdata}`}>
          <img src={logo} alt="logo" />
        </div>
        <div className={styles.Data_type}>
          <h1 className={`${styles.logo_large} ${styles.datetilte}`}>Enter Your Details</h1>
        </div>
        <div className={styles.Data_type} id="Data_type1">
          <InfoChip icon={dateicon} label={displayDate} alt="date_icon" />
          <InfoChip icon={timeicon} label={time || "Select Time"} alt="time_icon" />
          <InfoChip icon={membericon} label={adults || 0} alt="member_icon" />
          <InfoChip icon={reacticon} label={children || 0} alt="react_icon" />
          <InfoChip icon={resturanticon} label={selectedPromotion?.Name || "Select Area"} alt="react_icon" />
        </div>

        {globalError && (
          <div style={{ color: 'red', marginBottom: '1rem', fontWeight: 'bold' }}>
            {globalError}
          </div>
        )}

        <div className={`${styles.Data_type} ${styles.inputmain}`}>
          <CustomInput
            required
            label="First Name"
            value={formData.Customer.FirstName}
            onChange={(e) => handleChange('FirstName', e.target.value)}
            className={`${`inputfeild`}`}
          />
          <CustomInput
            required
            label="Last Name"
            value={formData.Customer.Surname}
            onChange={(e) => handleChange('Surname', e.target.value)}
            className={`${`inputfeild`}`}
          />
          <div className={styles.textfieldMain}>
           <div className={`${styles.feildproblem} w-100`} style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
              <CustomInput
                required
                label="Country Code"
                value={formData.Customer.MobileCountryCode}
                onChange={(e) => {
                  // Only allow numbers and + sign
                  const value = e.target.value.replace(/[^0-9+]/g, '');
                  handleChange('MobileCountryCode', value);
                }}
                style={{ flex: '0 0 180px' }}
                helperText='E.G. +44 7111 111111'
                inputProps={{
                  inputMode: 'numeric',
                  pattern: '[0-9+]*'
                }}
              />
              <CustomInput
                required
                label="Mobile Number"
                value={formData.Customer.Mobile}
                onChange={(e) => {
                  // Only allow numbers
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  handleChange('Mobile', value);
                }}
                style={{ flex: 1 }}
                inputProps={{
                  inputMode: 'numeric',
                  pattern: '[0-9]*'
                }}
              />
            </div>
          </div>

          <div className={styles.textfieldMain}>
            <CustomInput
              required
              label="Email Address"
              value={formData.Customer.Email}
              onChange={(e) => handleChange('Email', e.target.value)}
              className={`${styles.inputfeild} ${styles.feildproblem}`}
              type="email"
              helperText="E.G. Name@gmail.com"
            />
          </div>

          <div className={styles.textfieldMain}>
            <DatePicker
              value={formData.Customer.Birthday ? new Date(formData.Customer.Birthday) : undefined}
              onChange={(newDate) => {
                const year = newDate.getFullYear();
                const month = String(newDate.getMonth() + 1).padStart(2, '0');
                const day = String(newDate.getDate()).padStart(2, '0');
                const formattedDate = `${year}-${month}-${day}`;

                setFormData(prev => ({
                  ...prev,
                  Customer: {
                    ...prev.Customer,
                    Birthday: formattedDate
                  }
                }));

                dispatch(updateCustomerDetails({ Birthday: formattedDate }));
              }}
              placeholder="Date of Birth"
            />
            <p className="eg">Date of Birth</p>
          </div>

          <div className={styles.textfieldMain}>
            <CustomTextarea

              label="Special Requests"
              value={formData.SpecialRequests}
              onChange={handleSpecialRequestChange}
              helperText="2000 of 2000 characters remaining"
              minRows={4}
              maxRows={4}
              placeholder={children > 0 ? `Includes ${children} children` : "Enter any special requests"}
            />
          </div>

          <div className={styles.checkbox_container}>
            <CustomCheckbox
              checked={formData.Customer.ReceiveEmailMarketing}
              onChange={handleMarketingChange}
              label="I would like to receive email marketing"
            />
          </div>
        </div>

        <div className={`${styles.Data_type} ${styles.DatabtnMain}`}>
          <CustomButton
            label="BACK"
            to="/Area"
            bgColor="#3D3D3D"
            color="#FFFCF7"
          />
          <CustomButton
            label="NEXT"
            onClick={handleNextClick}
            bgColor="#000"
            color="#fff"
          />
        </div>
        <div className={styles.chose_m_link}>
          <Indicator step={3} />
        </div>
        <div className={styles.Area_type_footer}>
          <div className={styles.chose_m_link}>
            <Link to="/Select" className="chose__another__link">
              CHOOSE ANOTHER PUB
            </Link>
          </div>
          <Link to="/" className="exist__link">
            Exit And Cancel Booking
          </Link>
        </div>
      </div>
    </div>
  );
}
