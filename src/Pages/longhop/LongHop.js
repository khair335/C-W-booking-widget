import React, { useState, useEffect } from "react";
import { getCurrentRestaurant } from '../../utils/restaurantUtils';
import { useDispatch, useSelector } from 'react-redux';
import { postRequest } from "../../config/AxiosRoutes/index"
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import logo from "../../images/The Long Hop - text.png";
import sectionimage from "../../images/TheLongHop_MainiMAGE.jpg";
import dateicon from "../../images/Chips Icons Mobile.png";
import timeicon from "../../images/Chips Icons Mobile (1).png";
import membericon from "../../images/Chips Icons Mobile (3).png";
import reacticon from "../../images/Chips Icons Mobile (2).png";
import styles from "./LongHop.module.css";
import DatePicker from '../../components/ui/DatePicker/DatePicker';
import DropDown from '../../components/ui/DropDown/DropDown';
import PubImageHeaderLongHop from '../../components/PubImageHeaderLongHop/PubImageHeaderLongHop';
import Indicator from '../../components/Indicator/Indicator';
import InfoChip from '../../components/InfoChip/InfoChip';
import CustomButton from '../../components/ui/CustomButton/CustomButton';
import { updateBasicInfo, updateCurrentStep } from '../../store/bookingSlice';
import { getAvailabilityForDateRange } from '../../services/bookingService';
import PrivacyPolicyModal from '../../components/PrivacyPolicyModal';

export default function LongHop() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, isAuthenticating, token, authError, authenticate } = useAuth();

  // Get state from Redux
  const bookingState = useSelector((state) => state.booking);
  const { date, time, adults, children } = bookingState;

  // Local state for UI
  const [selectedTimeISO, setSelectedTimeISO] = useState("");
  const [leaveTime, setLeaveTime] = useState("");
  const [timeSlots, setTimeSlots] = useState([]);
  const [guestError, setGuestError] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [selectedAdults, setSelectedAdults] = useState(null);
  const [selectedChildren, setSelectedChildren] = useState(null);
  const [availablePromotionIds, setAvailablePromotionIds] = useState([]);
  const [availabilityData, setAvailabilityData] = useState(null);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [showPrivacyPolicyModal, setShowPrivacyPolicyModal] = useState(false);
  const MAX_RETRIES = 2;

  // Ensure authentication is ready
  useEffect(() => {
    console.log('Long Hop component auth state:', {
      isAuthenticated,
      isAuthenticating,
      hasToken: !!token,
      hasError: !!authError
    });

    if (!isAuthenticated && !isAuthenticating && !authError) {
      console.log('No auth state in Long Hop, initiating authentication...');
      authenticate();
    }
  }, [isAuthenticated, isAuthenticating, authError, authenticate, token]);

  // Initialize local state from Redux values
  useEffect(() => {
    if (adults !== undefined && adults !== null) {
      setSelectedAdults(adults);
    }
    if (children !== undefined && children !== null) {
      setSelectedChildren(children);
    }
  }, [adults, children]);

  // Fetch availability when party size changes
  useEffect(() => {
    const fetchMonthAvailability = async () => {
      // Only fetch if we have a party size and are authenticated
      const currentPartySize = parseInt(selectedAdults || 0) + parseInt(selectedChildren || 0);
      if (currentPartySize <= 0 || !isAuthenticated || !token) {
        console.log("No party size or not authenticated, skipping Long Hop availability fetch");
        return;
      }

      setIsLoadingAvailability(true);
      setError(null);

      try {
        const partySize = currentPartySize;
        
        // Calculate date range for next month
        const today = new Date();
        const dateFrom = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const dateTo = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
        
        // Format dates as ISO strings
        const dateFromISO = dateFrom.toISOString();
        const dateToISO = dateTo.toISOString();
        
        console.log("Fetching Long Hop availability for date range:", { dateFromISO, dateToISO, partySize });
        
        const response = await getAvailabilityForDateRange(dateFromISO, dateToISO, partySize, 'longHop');
        console.log("Long Hop month availability data:", response);
        setAvailabilityData(response);
      } catch (error) {
        console.error("Long Hop month availability fetch failed:", error);
        setError("Failed to fetch availability. Please try again.");
      } finally {
        setIsLoadingAvailability(false);
      }
    };

    fetchMonthAvailability();
  }, [selectedAdults, selectedChildren, isAuthenticated, token]);

  // Function to fetch availability for a specific month
  const fetchAvailabilityForMonth = async (targetDate) => {
    const currentPartySize = parseInt(selectedAdults || 0) + parseInt(selectedChildren || 0);
    if (currentPartySize <= 0 || !isAuthenticated || !token) return;
    
    setIsLoadingAvailability(true);
    try {
      const partySize = currentPartySize;
      
      // Calculate date range for the target month
      const year = targetDate.getFullYear();
      const month = targetDate.getMonth();
      const dateFrom = new Date(year, month, 1);
      const dateTo = new Date(year, month + 1, 0); // Last day of the month
      
      // Format dates as ISO strings
      const dateFromISO = dateFrom.toISOString();
      const dateToISO = dateTo.toISOString();
      
      console.log("Fetching Long Hop availability for specific month:", { dateFromISO, dateToISO, partySize });
      
      const response = await getAvailabilityForDateRange(dateFromISO, dateToISO, partySize, 'longHop');
      console.log("Long Hop specific month availability data:", response);
      setAvailabilityData(response);
    } catch (error) {
      console.error("Long Hop specific month availability fetch failed:", error);
    } finally {
      setIsLoadingAvailability(false);
    }
  };

  // Handle month change in DatePicker
  const handleMonthChange = (newDate) => {
    console.log("Long Hop month changed to:", newDate);
    fetchAvailabilityForMonth(newDate);
  };

  const handleDateSelect = (newDate) => {
    if (!newDate) {
      dispatch(updateBasicInfo({ date: null }));
      return;
    }

    // Format the date in YYYY-MM-DD format
    const year = newDate.getFullYear();
    const month = String(newDate.getMonth() + 1).padStart(2, '0');
    const day = String(newDate.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;

    console.log("Long Hop date selected:", formattedDate);
    dispatch(updateBasicInfo({ date: formattedDate }));
    
    // Clear time selection when date changes
    dispatch(updateBasicInfo({ time: null }));
    setSelectedTimeISO("");
    setLeaveTime("");
    setTimeSlots([]);
    setAvailablePromotionIds([]);
  };

  const handleTimeSelect = (timeData) => {
    console.log("Long Hop time selected:", timeData);
    dispatch(updateBasicInfo({ time: timeData.formatted }));
    setSelectedTimeISO(timeData.iso);
    setLeaveTime(timeData.leaveTime || "");
    
    // Find the selected time slot to get promotion IDs
    const timeSlot = timeSlots.find(slot => slot.TimeSlot === timeData.iso);
    if (timeSlot && timeSlot.AvailablePromotions) {
      const promotionIds = timeSlot.AvailablePromotions.map(promo => promo.Id);
      setAvailablePromotionIds(promotionIds);
      console.log("Long Hop time slot details:", {
        time: timeData.formatted,
        iso: timeData.iso,
        leaveTime: timeData.leaveTime,
        promotionIds: promotionIds
      });
    } else {
      console.log("No AvailablePromotions found for selected Long Hop TimeSlot");
      setAvailablePromotionIds([]);
    }
  };

  const handleAdultsChange = (value) => {
    console.log("Long Hop adults changed:", value);
    setSelectedAdults(value);
    dispatch(updateBasicInfo({ adults: value }));
    
    // Clear time-related state when party size changes
    dispatch(updateBasicInfo({ time: null }));
    setSelectedTimeISO("");
    setLeaveTime("");
    setTimeSlots([]);
    setAvailablePromotionIds([]);
  };

  const handleChildrenChange = (value) => {
    console.log("Long Hop children changed:", value);
    setSelectedChildren(value);
    dispatch(updateBasicInfo({ children: value }));
    
    // Clear time-related state when party size changes
    dispatch(updateBasicInfo({ time: null }));
    setSelectedTimeISO("");
    setLeaveTime("");
    setTimeSlots([]);
    setAvailablePromotionIds([]);
  };

  const handleNextClick = () => {
    if (!isFormValid) return;

    // Log the promotion IDs before storing in Redux
    console.log("Storing Long Hop promotion IDs in Redux:", availablePromotionIds);

    // Store the filtered promotion IDs in Redux for the next step
    dispatch(updateBasicInfo({
      availablePromotionIds: availablePromotionIds,
      pubType: 'longHop'
    }));

    // Log the Redux state after dispatch
    console.log("Updated Redux state with Long Hop promotion IDs");

    dispatch(updateCurrentStep(2));
    navigate("/longhoparea");
  };

  // Convert string date to Date object for DatePicker
  const dateForPicker = date ? new Date(date) : null;

  // Function to check if a date is available based on availability data
  const isDateAvailable = (date) => {
    if (!availabilityData || !availabilityData.AvailableDates) {
      console.log("No Long Hop availability data yet, disabling all dates until party size is selected");
      return false; // If no availability data, disable all dates until party size is selected
    }
    
    // Build local date string (YYYY-MM-DD) to avoid UTC offset issues with toISOString()
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    
    // Check if the date exists in available dates
    const availableDate = availabilityData.AvailableDates.find(availDate => {
      const availDateString = availDate.Date.split('T')[0];
      return availDateString === dateString;
    });
    
    // Date is available if it exists in AvailableDates and has available times
    const isAvailable = availableDate && availableDate.AvailableTimes && availableDate.AvailableTimes.length > 0;
    console.log(`Long Hop date ${dateString} availability:`, isAvailable ? 'Available' : 'Not available');
    return isAvailable;
  };

  // Function to check if a date should be disabled
  const checkDateDisabled = (date) => {
    // Disable past dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return true;
    
    // If we have availability data, only disable dates that are not available
    if (availabilityData && availabilityData.AvailableDates) {
      return !isDateAvailable(date);
    }
    
    // If no availability data, disable dates beyond next month
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(nextMonth.getDate() + 1); // Add one day to include the entire next month
    if (date > nextMonth) return true;
    
    return false;
  };

  // Load time slots when date is selected
  useEffect(() => {
    const loadTimeSlots = async () => {
      if (!date || !selectedAdults || selectedAdults === 0 || !isAuthenticated || !token) {
        setTimeSlots([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const headers = {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        };

        console.log("Loading Long Hop time slots for date:", date, "party size:", selectedAdults + selectedChildren);
        console.log('Making Long Hop availability request with token:', token ? 'Present' : 'Missing');
        
        const partySize = parseInt(selectedAdults || 0) + parseInt(selectedChildren || 0);
        const payload = {
          VisitDate: date,
          ChannelCode: "Online",
          PartySize: partySize,
          RestaurantName: "TheLongHop"
        };

        console.log("Long Hop availability request:", payload);

        const response = await postRequest(
          `/api/ConsumerApi/v1/Restaurant/TheLongHop/AvailabilitySearch`,
          headers,
          payload
        );

        console.log("Long Hop availability response:", response);

        if (response && response.data?.TimeSlots && Array.isArray(response.data.TimeSlots)) {
          setTimeSlots(response.data.TimeSlots);
          console.log("Long Hop time slots loaded:", response.data.TimeSlots.length);
        } else {
          console.log("No time slots available for Long Hop");
          setTimeSlots([]);
        }
      } catch (error) {
        console.error("Error loading Long Hop time slots:", error);
        setError("Failed to load time slots. Please try again.");
        setTimeSlots([]);
        
        // Retry logic
        if (retryCount < MAX_RETRIES) {
          console.log(`Retrying Long Hop time slots fetch (attempt ${retryCount + 1}/${MAX_RETRIES})`);
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, 1000);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadTimeSlots();
  }, [date, selectedAdults, selectedChildren, isAuthenticated, token, retryCount]);

  // Form validation
  const isFormValid = selectedAdults && selectedAdults > 0 && date && selectedTimeISO;

  if (!isAuthenticated && !isAuthenticating) {
    return (
      <div className={styles.griffinnMain}>
        <PubImageHeaderLongHop
          pubLogo={logo}
          sectionImg={sectionimage}
          pubLinkLabel="CHOOSE ANOTHER PUB"
          step={1}
          pubLink="/select"
        />
        <div className={styles.Datamain}>
          <div className={styles.loadingText}>
            <p>Please wait while we authenticate...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.griffinnMain} id="choose">
      <PubImageHeaderLongHop
        pubLogo={logo}
        sectionImg={sectionimage}
        pubLinkLabel="CHOOSE ANOTHER PUB"
        step={1}
        pubLink="/select"
      />
      <div className={styles.Datamain}>
        <div className={`${styles.Data_type} ${styles.imgdata}`}>
          <img src={logo} alt="logo" />
        </div>

        <h1 className={`${styles.logo_large} ${styles.datetilte}`}>Select Date, Time & Guests</h1>

        <div className={styles.info_chip_container}>
          <InfoChip icon={dateicon} label={date || "Select Date"} alt="date_icon" />
          <InfoChip icon={timeicon} label={time || "Select Time"} alt="time_icon" />
          <InfoChip icon={membericon} label={adults || 0} alt="member_icon" />
          <InfoChip icon={reacticon} label={children || 0} alt="react_icon" />
        </div>

        <div className={styles.input_container}>
          {error && <p className="text-danger">{error}</p>}
          {guestError && <p className="text-danger">{guestError}</p>}

          <DropDown
            options={[...Array(11).keys()].slice(1).map((num) => ({
              label: num.toString(),
              value: num.toString(),
              status: "default"
            }))}
            value={selectedAdults}
            onChange={handleAdultsChange}
            placeholder="Number of adults"
          />

          <DropDown
            options={[...Array(11).keys()].map((num) => ({
              label: num.toString(),
              value: num.toString(),
              status: "default"
            }))}
            value={selectedChildren}
            onChange={handleChildrenChange}
            placeholder="Number of children"
          />

          {isLoadingAvailability && (
            <p className={styles.loadingText}>Loading available dates...</p>
          )}
          {!availabilityData && !isLoadingAvailability && (
            <p className={styles.loadingText}>Please select number of guests to see available dates</p>
          )}

          <DatePicker
            selected={dateForPicker}
            onChange={handleDateSelect}
            placeholder={availabilityData ? "Select Date" : "Select guests first"}
            disablePastDates={true}
            isDateDisabled={checkDateDisabled}
            onMonthChange={handleMonthChange}
          />

          <DropDown
            options={timeSlots.map((slot) => {
              const iso = slot.TimeSlot;
              const label = new Date(iso).toLocaleTimeString([], {
                 hour: "2-digit",
                minute: "2-digit",
                 hour12: false,
              });
              return {
                label: label,
                value: iso,
                status: "default"
              };
            })}
            value={selectedTimeISO}
            onChange={(value) => {
              const selectedSlot = timeSlots.find((slot) => slot.TimeSlot === value);
              if (selectedSlot) {
                handleTimeSelect({
                  iso: value,
                  formatted: new Date(value).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  }),
                  leaveTime: selectedSlot.LeaveTime
                });
              }
            }}
            placeholder={timeSlots.length > 0 ? "Select Time" : "Select date first"}
          />
        </div>
        <p className={styles.tbletext}>
          </p>

        {/* <p className={styles.tbletext}>
          By continuing, you agree to our{' '}
          <button
            className={styles.privacyLink}
            onClick={() => setShowPrivacyPolicyModal(true)}
          >
            Privacy Policy
          </button>
        </p> */}

        <div className={`${styles.Data_type} ${styles.DatabtnMain3}`}>
        <CustomButton
            label="BACK"
            to="/Select"
            bgColor="#3D3D3D"
            color="#FFFCF7"
          />
          <CustomButton
            label="NEXT"
            onClick={handleNextClick}
            disabled={!isFormValid}
            bgColor={isFormValid ? "#C39A7B" : "#CCCCCC"}
            color="#FFFCF7"
          />
        </div>
        <div className={styles.Dataa_type}>
          {/* <div className={styles.chose_m_link}>
            <Link to="/Select" className="chose__another__link">
              CHOOSE ANOTHER PUB
            </Link>
          </div> */}
          <Link to="/Select" className="exist__link">
            Exit And Cancel Booking
          </Link>
        </div>

        <div className={styles.chose_m_link}>
          <Link to="/select" className={styles.chose_m_link}>
            <CustomButton
              label="CHOOSE ANOTHER PUB"
              bgColor="transparent"
              color="#C39A7B"
              borderColor="#C39A7B"
            />
          </Link>
        </div>
        <div className={styles.Data_type}>
          <div className={styles.chose_m_link}>
            <Link to="/" className={styles.chose_m_link}>
              <CustomButton
                label="Back To The Site"
                bgColor="transparent"
                color="#C39A7B"
                borderColor="#C39A7B"
              />
            </Link>
          </div>
        </div>
      </div>

      {showPrivacyPolicyModal && (
        <PrivacyPolicyModal
          isOpen={showPrivacyPolicyModal}
          onClose={() => setShowPrivacyPolicyModal(false)}
        />
      )}
    </div>
  );
}