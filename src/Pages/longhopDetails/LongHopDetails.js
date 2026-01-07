import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from "react-router-dom";
import logo from "../../images/The Long Hop - text.png";
import sectionimage from "../../images/TheLongHop_MainiMAGE.jpg";
import dateicon from "../../images/Chips Icons Mobile.png";
import timeicon from "../../images/Chips Icons Mobile (1).png";
import membericon from "../../images/Chips Icons Mobile (3).png";
import reacticon from "../../images/Chips Icons Mobile (2).png";
import resturanticon from "../../images/table_restaurant.png";
import TextField from "@mui/material/TextField";
import styles from "./LongHopDetails.module.css";
import PubImageHeaderLongHop from '../../components/PubImageHeaderLongHop/PubImageHeaderLongHop';
import InfoChip from '../../components/InfoChip/InfoChip';
import CustomInput from '../../components/ui/CustomInput/CustomInput';
import DatePicker from '../../components/ui/DatePicker/DatePicker';
import CustomCheckbox from '../../components/ui/CustomCheckbox/CustomCheckbox';
import CustomButton from '../../components/ui/CustomButton/CustomButton';
import Indicator from '../../components/Indicator/Indicator';
import { updateCustomerDetails, updateCurrentStep, updateSpecialRequests, updateBasicInfo } from '../../store/bookingSlice';
import CustomTextarea from '../../components/ui/CustomTextarea/CustomTextarea';
import DrinksModal from '../../components/DrinksModal/DrinksModal';
import { restoreBookingAfterPayment, clearAllBookingData } from '../../utils/paymentRestoration';

export default function LongHopDetails() {
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
  const [isDrinksModalOpen, setIsDrinksModalOpen] = useState(false);
  const [dataRestored, setDataRestored] = useState(false); // Flag to track if data was restored
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

  // Sync specialRequests from Redux to form (but skip during restoration)
  useEffect(() => {
    // Check if we're about to restore from localStorage - if so, skip this sync
    const pendingBookingData = localStorage.getItem('pendingBookingData');
    if (pendingBookingData && !dataRestored) {
      console.log('⏭️  Skipping sync - restoration will handle it');
      return;
    }
    
    console.log('📥 Syncing specialRequests from Redux to form:', specialRequests);
    console.log('📥 Current formData.SpecialRequests:', formData.SpecialRequests);
    
    // Only update if different to avoid unnecessary rerenders
    if (specialRequests !== formData.SpecialRequests) {
      setFormData(prev => ({
        ...prev,
        SpecialRequests: specialRequests || ''
      }));
    }
  }, [specialRequests, dataRestored, formData.SpecialRequests]);

  // Restore booking data after payment redirect - SIMPLIFIED
  useEffect(() => {
    const savedData = localStorage.getItem('pendingBookingData');
    const drinkPurchased = localStorage.getItem('drinkPurchased');
    
    if (!savedData) return;
    
    const bookingData = JSON.parse(savedData);
    console.log('✅ Found saved booking data:', bookingData);
    
    setDataRestored(true);
    
    dispatch(updateBasicInfo({
      date: bookingData.date,
      time: bookingData.time,
      adults: parseInt(bookingData.adults) || 0,
      children: parseInt(bookingData.children) || 0,
      returnBy: bookingData.returnBy,
      pubType: bookingData.pubType || bookingData.restaurant
    }));
    
    dispatch(updateCustomerDetails({
      FirstName: bookingData.firstName || '',
      Surname: bookingData.surname || '',
      Email: bookingData.email || '',
      Mobile: bookingData.phone || '',
      MobileCountryCode: bookingData.mobileCountryCode || '+44',
      Birthday: bookingData.birthday || ''
    }));
    
    // Build special requests with children prefix + drink info + other requests
    const restoredChildren = parseInt(bookingData.children) || 0;
    let finalSpecialRequests = '';
    
    // Add children prefix if there are children
    if (restoredChildren > 0) {
      finalSpecialRequests = `Includes ${restoredChildren} children`;
    }
    
    // Add drink info if payment was completed
    if (drinkPurchased === 'true') {
      const drinkName = localStorage.getItem('drinkName');
      const drinkAmount = localStorage.getItem('drinkAmount');
      const paymentSessionId = localStorage.getItem('paymentSessionId');
      
      if (drinkName && drinkAmount) {
        const drinkInfo = `Pre-ordered: ${drinkName} - £${parseFloat(drinkAmount).toFixed(2)} (Payment ID: ${paymentSessionId || 'N/A'})`;
        finalSpecialRequests = finalSpecialRequests ? `${finalSpecialRequests} - ${drinkInfo}` : drinkInfo;
      }
    }
    
    // Add any other special requests from saved data (excluding children prefix and drink info)
    let savedRequests = bookingData.specialRequests || '';
    savedRequests = savedRequests.replace(/^Includes \d+ children(?: - )?/, '');
    savedRequests = savedRequests.replace(/Pre-ordered: .+? - £[\d.]+ \(Payment ID: [^)]+\)(?: - )?/, '');
    if (savedRequests) {
      finalSpecialRequests = finalSpecialRequests ? `${finalSpecialRequests} - ${savedRequests}` : savedRequests;
    }
    
    console.log('📋 Final Special Requests (with children prefix):', finalSpecialRequests);
    
    dispatch(updateSpecialRequests(finalSpecialRequests));
    setFormData(prev => ({
      ...prev,
      SpecialRequests: finalSpecialRequests
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update the useEffect that sets special requests
  useEffect(() => {
    // If specialRequests is empty but we have children, we need to rebuild
    const needsChildrenPrefix = children > 0 && (!specialRequests || !specialRequests.includes('Includes'));
    
    if (needsChildrenPrefix) {
      console.log('🔨 REBUILDING: specialRequests is empty but children exist, building...');
      // Fall through to rebuild
    } else if (dataRestored) {
      console.log('⏭️  Skipping special requests rebuild - data was restored from payment');
      return;
    } else if (specialRequests && !specialRequests.match(/^Includes \d+ children$/)) {
      console.log('⏭️  Skipping rebuild - specialRequests already has content from Redux');
      return;
    } else {
      console.log('⚙️  Continuing to rebuild special requests');
    }

    // Only add children prefix if there are children
    const childrenPrefix = children > 0 ? `Includes ${children} children` : '';
    
    // Check for drink info in Redux first
    let drinkMatch = specialRequests?.match(/Pre-ordered: .+? - £[\d.]+ \(Payment ID: [^)]+\)/);
    let drinkInfo = drinkMatch ? drinkMatch[0] : '';
    
    // If not in Redux, check localStorage for drink data
    if (!drinkInfo) {
      const drinkPurchased = localStorage.getItem('drinkPurchased');
      if (drinkPurchased === 'true') {
        const drinkName = localStorage.getItem('drinkName');
        const drinkAmount = localStorage.getItem('drinkAmount');
        const paymentSessionId = localStorage.getItem('paymentSessionId');
        
        if (drinkName && drinkAmount) {
          drinkInfo = `Pre-ordered: ${drinkName} - £${parseFloat(drinkAmount).toFixed(2)} (Payment ID: ${paymentSessionId || 'N/A'})`;
          console.log('🍷 Found drink data in localStorage:', drinkInfo);
        }
      }
    }
    
    // Preserve any user-added requests (not children, not drink)
    let userRequests = specialRequests || '';
    userRequests = userRequests.replace(/^Includes \d+ children(?: - )?/, '');
    userRequests = userRequests.replace(/Pre-ordered: .+? - £[\d.]+ \(Payment ID: [^)]+\)(?: - )?/, '');
    
    // Build the complete special requests string
    let completeRequests = childrenPrefix;
    if (drinkInfo) {
      completeRequests = completeRequests ? `${completeRequests} - ${drinkInfo}` : drinkInfo;
    }
    if (userRequests) {
      completeRequests = completeRequests ? `${completeRequests} - ${userRequests}` : userRequests;
    }
    
    setFormData(prev => ({
      ...prev,
      SpecialRequests: completeRequests
    }));
    
    // Update Redux to persist the rebuilt specialRequests
    dispatch(updateSpecialRequests(completeRequests));
  }, [children, dispatch, dataRestored]);

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

    // Extract drink info if it exists (match full format: Pre-ordered: Drink - £10.00 (Payment ID: xyz))
    const drinkMatch = value.match(/Pre-ordered: .+? - £[\d.]+ \(Payment ID: [^)]+\)/);
    const drinkInfo = drinkMatch ? drinkMatch[0] : '';

    // Remove the children prefix and drink info to get just user input
    let userInput = value.replace(/^Includes \d+ children(?: - )?/, '');
    userInput = userInput.replace(/Pre-ordered: .+? - £[\d.]+ \(Payment ID: [^)]+\)(?: - )?/, '');

    // Build the complete request maintaining order: children - drink - user requests
    let formattedRequest = '';
    if (childrenPrefix) {
      formattedRequest = childrenPrefix;
    }
    if (drinkInfo) {
      formattedRequest = formattedRequest ? `${formattedRequest} - ${drinkInfo}` : drinkInfo;
    }
    if (userInput) {
      formattedRequest = formattedRequest ? `${formattedRequest} - ${userInput}` : userInput;
    }

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
    const drinkPurchased = localStorage.getItem('drinkPurchased');
    if (drinkPurchased === 'true') {
      setIsDrinksModalOpen(false);
      dispatch(updateCurrentStep(4));
      navigate("/longhopconfirm");
      return;
    }
    setIsDrinksModalOpen(true);
  };

  const handleDrinksModalClose = () => {
    setIsDrinksModalOpen(false);
  };

  const handleDrinksModalContinue = () => {
    setIsDrinksModalOpen(false);
    dispatch(updateCurrentStep(4));
    navigate("/longhopconfirm");
  };

  return (
    <div className={styles.DetailsMain} id="choose">
      <PubImageHeaderLongHop
        pubLogo={logo}
        sectionImg={sectionimage}
        pubLinkLabel="CHOOSE ANOTHER PUB"
        step={3}
        pubLink="/select"
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
              label="I would like to receive news and offers from The Long Hop by email"
            />
          </div>
        </div>

        <div className={`${styles.Data_type} ${styles.DatabtnMain}`}>
          <CustomButton
            label="BACK"
            to="/longhoparea"
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
            <Link to="/select" className="chose__another__link">
              CHOOSE ANOTHER PUB
            </Link>
          </div>
          <Link to="/longhopHome" className="exist__link">
            Exit And Cancel Booking
          </Link>
        </div>
      </div>
      
      <DrinksModal
        isOpen={isDrinksModalOpen}
        onClose={handleDrinksModalClose}
        onContinue={handleDrinksModalContinue}
      />
    </div>
  );
}

