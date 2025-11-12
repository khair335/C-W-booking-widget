import React, { useState, useEffect } from "react";
import { getCurrentRestaurant } from '../../utils/restaurantUtils';
import { useDispatch, useSelector } from 'react-redux';
import { postRequest } from "../../config/AxiosRoutes/index"
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import logo from "../../images/Griffin Black.png";
import sectionimage from "../../images/79205c0e916b529d8d136ce69e32e592.png";
import dateicon from "../../images/Chips Icons Mobile.png";
import timeicon from "../../images/Chips Icons Mobile (1).png";
import membericon from "../../images/Chips Icons Mobile (3).png";
import reacticon from "../../images/Chips Icons Mobile (2).png";
import styles from "./Griffin.module.css";
import DatePicker from '../../components/ui/DatePicker/DatePicker';
import DropDown from '../../components/ui/DropDown/DropDown';
import PubImageHeader from '../../components/PubImageHeader/PubImageHeader';
import Indicator from '../../components/Indicator/Indicator';
import InfoChip from '../../components/InfoChip/InfoChip';
import CustomButton from '../../components/ui/CustomButton/CustomButton';
import { updateBasicInfo, updateCurrentStep } from '../../store/bookingSlice';
import { getAvailabilityForDateRange } from '../../services/bookingService';
import PrivacyPolicyModal from '../../components/PrivacyPolicyModal';

export default function Griffin() {
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
    console.log('Griffin component auth state:', {
      isAuthenticated,
      isAuthenticating,
      hasToken: !!token,
      hasError: !!authError
    });

    if (!isAuthenticated && !isAuthenticating && !authError) {
      console.log('No auth state in Griffin, initiating authentication...');
      authenticate();
    }
  }, [isAuthenticated, isAuthenticating, authError, authenticate, token]);

  // Initialize local state from Redux values
  useEffect(() => {
    if (adults) {
      setSelectedAdults(adults.toString());
    }
    if (children) {
      setSelectedChildren(children.toString());
    }
    if (time) {
      // Find the matching time slot
      const matchingSlot = timeSlots.find(slot => {
        const slotTime = new Date(slot.TimeSlot).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
        return slotTime === time;
      });

      if (matchingSlot) {
        setSelectedTimeISO(matchingSlot.TimeSlot);
        setLeaveTime(matchingSlot.LeaveTime);
      }
    }
  }, [timeSlots, adults, children, time]);

  // Update form validation whenever relevant fields change
  const isFormValid = date && time && adults > 0;

  // Availability fetching effect
  useEffect(() => {
    const fetchAvailability = async () => {
      // Don't fetch if we don't have required data or if we're authenticating
      if (!date || !adults || retryCount >= MAX_RETRIES) {
        console.log('Skipping availability fetch - missing required data:', {
          hasDate: !!date,
          hasAdults: !!adults,
          retryCount
        });
        return;
      }

      if (isAuthenticating || !isAuthenticated || !token) {
        console.log('Skipping availability fetch - waiting for authentication:', {
          isAuthenticating,
          isAuthenticated,
          hasToken: !!token
        });
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

        console.log('Making availability request with token:', token ? 'Present' : 'Missing');

        const partySize = parseInt(adults || 0) + parseInt(children || 0);
        const payload = {
          VisitDate: date,
          ChannelCode: "ONLINE",
          PartySize: partySize,
        };

        const response = await postRequest(
          `/api/ConsumerApi/v1/Restaurant/${getCurrentRestaurant(null, window.location.pathname)}/AvailabilitySearch`,
          headers,
          payload
        );

        if (response.data?.TimeSlots) {
          setTimeSlots(response.data.TimeSlots);
          setRetryCount(0);

          // Handle time slots - if a time is already selected, update availablePromotionIds
          if (time && response.data.TimeSlots.length > 0) {
            const selectedSlot = response.data.TimeSlots.find(slot => {
              const slotTime = new Date(slot.TimeSlot).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              });
              return slotTime === time;
            });
            if (selectedSlot) {
              setSelectedTimeISO(selectedSlot.TimeSlot);
              setLeaveTime(selectedSlot.LeaveTime);
              
              // Extract AvailablePromotions from the selected TimeSlot
              if (selectedSlot.AvailablePromotions) {
                const promotionIds = selectedSlot.AvailablePromotions.map(promo => promo.Id);
                console.log("Griffin TimeSlot AvailablePromotions:", promotionIds);
                setAvailablePromotionIds(promotionIds);
              }
            }
          }
        } else {
          setTimeSlots([]);
          setError("No time slots available for the selected date and party size.");
        }
      } catch (error) {
        console.error("Availability fetch failed:", {
          status: error.response?.status,
          message: error.message,
          response: error.response?.data,
          authError
        });

        if (error.response?.status === 401) {
          if (retryCount < MAX_RETRIES) {
            console.log('Auth error, incrementing retry count');
            setRetryCount(prev => prev + 1);
            // Trigger re-authentication
            authenticate();
          } else {
            setError("Authentication failed. Please try refreshing the page.");
          }
        } else {
          setError(error.response?.data?.message || "Failed to fetch available time slots. Please try again.");
        }
        setTimeSlots([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailability();
  }, [date, adults, children, time, retryCount, isAuthenticating, isAuthenticated, token, authError, authenticate]);

  // Fetch availability for the next month when party size changes
  useEffect(() => {
    const fetchMonthAvailability = async () => {
      // Only fetch if we have a party size and are authenticated
      const currentPartySize = parseInt(adults || 0) + parseInt(children || 0);
      if (currentPartySize <= 0 || !isAuthenticated || !token) return;
      
      setIsLoadingAvailability(true);
      try {
        const partySize = currentPartySize;
        
        // Calculate date range for next month
        const today = new Date();
        const dateFrom = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const dateTo = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
        
        // Format dates as ISO strings
        const dateFromISO = dateFrom.toISOString();
        const dateToISO = dateTo.toISOString();
        
        console.log("Fetching Griffin availability for date range:", { dateFromISO, dateToISO, partySize });
        
        const response = await getAvailabilityForDateRange(dateFromISO, dateToISO, partySize, 'griffin');
        console.log("Griffin month availability data:", response);
        setAvailabilityData(response);
      } catch (error) {
        console.error("Griffin month availability fetch failed:", error);
      } finally {
        setIsLoadingAvailability(false);
      }
    };
    
    fetchMonthAvailability();
  }, [adults, children, isAuthenticated, token]);

  // Function to fetch availability for a specific month
  const fetchAvailabilityForMonth = async (targetDate) => {
    const currentPartySize = parseInt(adults || 0) + parseInt(children || 0);
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
      
      console.log("Fetching Griffin availability for specific month:", { dateFromISO, dateToISO, partySize });
      
      const response = await getAvailabilityForDateRange(dateFromISO, dateToISO, partySize, 'griffin');
      console.log("Griffin specific month availability data:", response);
      setAvailabilityData(response);
    } catch (error) {
      console.error("Griffin specific month availability fetch failed:", error);
    } finally {
      setIsLoadingAvailability(false);
    }
  };

  // Handle month change in DatePicker
  const handleMonthChange = (newDate) => {
    console.log("Griffin month changed to:", newDate);
    fetchAvailabilityForMonth(newDate);
  };

  const handleDateChange = (newDate) => {
    if (!newDate) {
      dispatch(updateBasicInfo({ date: null }));
      return;
    }

    // Format the date in YYYY-MM-DD format
    const year = newDate.getFullYear();
    const month = String(newDate.getMonth() + 1).padStart(2, '0');
    const day = String(newDate.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;

    dispatch(updateBasicInfo({ date: formattedDate }));
  };


  const handleAdultsChange = (value) => {
    const numValue = parseInt(value);
    if (numValue + parseInt(children || 0) <= 10) {
      setSelectedAdults(value);
      dispatch(updateBasicInfo({ adults: numValue }));
      setGuestError("");
    } else {
      setGuestError("Total guests (adults + children) cannot exceed 10.");
    }
  };

  const handleChildrenChange = (value) => {
    const numValue = parseInt(value);
    if (parseInt(adults || 0) + numValue <= 10) {
      setSelectedChildren(value);
      dispatch(updateBasicInfo({ children: numValue }));
      setGuestError("");
    } else {
      setGuestError("Total guests (adults + children) cannot exceed 10.");
    }
  };

  const handleTimeSelect = ({ iso, formatted, leaveTime }) => {
    if (!iso) {
      dispatch(updateBasicInfo({ time: null, returnBy: null }));
      setSelectedTimeISO("");
      setLeaveTime("");
      setAvailablePromotionIds([]);
      return;
    }

    setSelectedTimeISO(iso);
    dispatch(updateBasicInfo({
      time: formatted,
      returnBy: leaveTime
    }));
    setLeaveTime(leaveTime);

    // Find the selected TimeSlot and extract its AvailablePromotions
    const selectedSlot = timeSlots.find(slot => slot.TimeSlot === iso);
    if (selectedSlot && selectedSlot.AvailablePromotions) {
      const promotionIds = selectedSlot.AvailablePromotions.map(promo => promo.Id);
      console.log("Selected TimeSlot AvailablePromotions for Griffin:", promotionIds);
      setAvailablePromotionIds(promotionIds);
    } else {
      console.log("No AvailablePromotions found for selected Griffin TimeSlot");
      setAvailablePromotionIds([]);
    }
  };

  const handleNextClick = () => {
    if (!isFormValid) return;

    // Log the promotion IDs before storing in Redux
    console.log("Storing Griffin promotion IDs in Redux:", availablePromotionIds);

    // Store the filtered promotion IDs in Redux for the next step
    dispatch(updateBasicInfo({
      availablePromotionIds: availablePromotionIds,
      pubType: 'griffin'
    }));

    // Log the Redux state after dispatch
    console.log("Updated Redux state with Griffin promotion IDs");

    dispatch(updateCurrentStep(2));
    navigate("/Area");
  };

  // Convert string date to Date object for DatePicker
  const dateForPicker = date ? new Date(date) : null;

  // Function to check if a date is available based on availability data
  const isDateAvailable = (date) => {
    if (!availabilityData || !availabilityData.AvailableDates) {
      console.log("No Griffin availability data yet, disabling all dates until party size is selected");
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
    console.log(`Griffin date ${dateString} availability:`, isAvailable ? 'Available' : 'Not available');
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

  // Show loading state while authenticating
  // if (isAuthenticating) {
  //   return (
  //     <div className={styles.griffinnMain}>
  //       <div className={styles.Datamain}>
  //         <h1>Authenticating...</h1>
  //       </div>
  //     </div>
  //   );
  // }

  // Show error state if authentication failed
  // if (authError) {
  //   return (
  //     <div className={styles.griffinnMain}>
  //       <div className={styles.Datamain}>
  //         <h1>Authentication Error</h1>
  //         <p>{authError}</p>
  //         <button onClick={authenticate}>Retry Authentication</button>
  //       </div>
  //     </div>
  //   );
  // }

  // Show loading state while fetching availability
  // if (isLoading) {
  //   return (
  //     <div className={styles.griffinnMain}>
  //       <div className={styles.Datamain}>
  //         <h1>Loading Available Times...</h1>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className={styles.griffinnMain} id="choose">
      <PubImageHeader
        pubLogo={logo}
        sectionImg={sectionimage}
        pubLinkLabel="CHOOSE ANOTHER PUB"
        step={1}
        pubLink="/Select"
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
            onChange={handleDateChange}
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
            placeholder="Select Time"
            isLoading={isLoading}

          />

          <p className={styles.tbletext}>
          </p>
          
       
        </div>

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
            bgColor={!isFormValid ? "#ccc" : "#000"}
            color={!isFormValid ? "#666" : "#fff"}
          />
        </div>

        <div className={styles.chose_m_link}>
          <Indicator step={1} />
        </div>

        <div className={styles.Data_type}>
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

      {/* Privacy Policy Modal */}
      <PrivacyPolicyModal
        isOpen={showPrivacyPolicyModal}
        onClose={() => setShowPrivacyPolicyModal(false)}
        pageType="griffin"
      />
    </div>
  );
}
