import React, { useState, useEffect } from "react";
import { getCurrentRestaurant } from '../../utils/restaurantUtils';
import { useDispatch, useSelector } from 'react-redux';
import { postRequest } from "../../config/AxiosRoutes/index"
import { Link, useNavigate } from "react-router-dom";
import dateicon from "../../images/Chips Icons Mobile.png";
import timeicon from "../../images/Chips Icons Mobile (1).png";
import membericon from "../../images/Chips Icons Mobile (3).png";
import reacticon from "../../images/Chips Icons Mobile (2).png";
import sectionimg2 from "../../images/Tap & Run_MainImage 1.png";
import logo1 from "../../images/Logo (1).png"
import whitelogo from "../../images/T&R White.png"
import styles from "./Top.module.css";
import DatePicker from '../../components/ui/DatePicker/DatePicker';
import DropDown from '../../components/ui/DropDown/DropDown';
import PubImageHeader from '../../components/PubImageHeader/PubImageHeader';
import Indicator from '../../components/Indicator/Indicator';
import InfoChip from '../../components/InfoChip/InfoChip';
import CustomButton from '../../components/ui/CustomButton/CustomButton';
import { updateBasicInfo, updateCurrentStep } from '../../store/bookingSlice';
import { getAvailabilityForDateRange } from '../../services/bookingService';

export default function Top() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // Get state from Redux
  const bookingState = useSelector((state) => state.booking);
  const { date, time, adults, children, returnBy } = bookingState;

  // Local state for UI
  const [timeSlots, setTimeSlots] = useState([]);
  const [guestError, setGuestError] = useState("");
  const [selectedTimeISO, setSelectedTimeISO] = useState("");
  const [leaveTime, setLeaveTime] = useState("");
  const [selectedAdults, setSelectedAdults] = useState(null);
  const [selectedChildren, setSelectedChildren] = useState(null);
  const [availablePromotionIds, setAvailablePromotionIds] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [availabilityData, setAvailabilityData] = useState(null);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  // Update form validation whenever relevant fields change
  const isFormValid = date && time && adults;

  console.log('availablePromotionIds',availablePromotionIds);

  // Initialize time slots and selected time when component mounts or when dependencies change
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!date || !adults) return;
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
      };
      const partySize = parseInt(adults || 0) + parseInt(children || 0);
      const payload = {
        VisitDate: date,
        ChannelCode: "ONLINE",
        PartySize: partySize,
      };
      try {
        const response = await postRequest(
          `/api/ConsumerApi/v1/Restaurant/${getCurrentRestaurant(null, window.location.pathname)}/AvailabilitySearch`,
          headers,
          payload
        );
        console.log("Availability data:", response.data);
        const slots = response.data?.TimeSlots || [];
        setTimeSlots(slots);
        // Filter promotions for Top pub (Restaurant Area and Outdoor Terrace Rooms)
        const promotions = response.data?.Promotions || [];
        console.log("All promotions from API:", promotions);
        const filteredPromotionIds = promotions
          .filter(promo => {
            const isRelevantPromotion =
              promo.Name === "Restaurant Area" ||
              promo.Name === "Outdoor Terrace Rooms";
            console.log(`Checking promotion: ${promo.Name} (${promo.Id}) - ${isRelevantPromotion ? 'included' : 'excluded'}`);
            return isRelevantPromotion;
          })
          .map(promo => promo.Id);

        console.log("Filtered promotion IDs:", filteredPromotionIds);
        setAvailablePromotionIds(filteredPromotionIds);

        // If we have a selected time, find and set the corresponding slot
        if (time && slots.length > 0) {
          const selectedSlot = slots.find(slot => {
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
          }
        }
      } catch (error) {
        console.error("Availability fetch failed:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAvailability();
  }, [date, adults, children, time]);

  // Fetch availability for the next month when party size changes
  useEffect(() => {
    const fetchMonthAvailability = async () => {
      // Only fetch if we have a party size
      const currentPartySize = parseInt(adults || 0) + parseInt(children || 0);
      if (currentPartySize <= 0) return; // Skip if no party size set
      
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
        
        console.log("Fetching availability for date range:", { dateFromISO, dateToISO, partySize });
        
        const response = await getAvailabilityForDateRange(dateFromISO, dateToISO, partySize, 'top');
        console.log("Month availability data:", response);
        setAvailabilityData(response);
      } catch (error) {
        console.error("Month availability fetch failed:", error);
      } finally {
        setIsLoadingAvailability(false);
      }
    };
    
    fetchMonthAvailability();
  }, [adults, children]);

  // Sync local state with Redux state
  // useEffect(() => {
  //   setSelectedAdults(adults?.toString() || null);
  //   setSelectedChildren(children?.toString() || null);
  // }, [adults, children]);

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

  const handleTimeSelect = (value) => {
    if (!value) {
      dispatch(updateBasicInfo({ time: null, returnBy: null }));
      setSelectedTimeISO("");
      setLeaveTime("");
      return;
    }

    setSelectedTimeISO(value);
    const dateObj = new Date(value);
    const formatted24Hour = dateObj.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    dispatch(updateBasicInfo({ time: formatted24Hour }));
    const selectedSlot = timeSlots.find((slot) => slot.TimeSlot === value);
    if (selectedSlot) {
      const leaveTime = selectedSlot.LeaveTime || "";
      dispatch(updateBasicInfo({ returnBy: leaveTime }));
      setLeaveTime(leaveTime);
    }
  };

  const handleNextClick = () => {
    if (!isFormValid) return;
    // Log the promotion IDs before storing in Redux
    console.log("Storing promotion IDs in Redux:", availablePromotionIds);
    // Store the filtered promotion IDs in Redux for the next step
    dispatch(updateBasicInfo({
      availablePromotionIds: availablePromotionIds,
      pubType: 'top'
    }));
    // Log the Redux state after dispatch
    console.log("Updated Redux state with promotion IDs");
    dispatch(updateCurrentStep(2));
    console.log("Navigating to topArea");
    navigate("/TopArea");
  };

  // Function to check if a date is available based on availability data
  const isDateAvailable = (date) => {
    if (!availabilityData || !availabilityData.AvailableDates) {
      console.log("No availability data yet, disabling all dates until party size is selected");
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
    console.log(`Date ${dateString} availability:`, isAvailable ? 'Available' : 'Not available');
    return isAvailable;
  };

  // Function to check if a date should be disabled
  const checkDateDisabled = (date) => {
    // Disable past dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return true;
    
    // Disable dates beyond next month
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(nextMonth.getDate() + 1); // Add one day to include the entire next month
    if (date > nextMonth) return true;
    
    // Disable dates that are not available
    if (!isDateAvailable(date)) return true;
    
    return false;
  };

  return (
    <div className={styles.griffinMain} id="choose">
      <PubImageHeader
        pubLogo={whitelogo}
        sectionImg={sectionimg2}
        pubLinkLabel="CHOOSE ANOTHER PUB"
        step={1}
        pubLink="/Select"
      />
      <div className={styles.Datamain}>
        <img className={`${styles.brandLogo}`} src={logo1} alt="logo" />

        <div className={styles.Dataa_type}>
          <h1 className={`${styles.logo_large} ${styles.datetilte}`}>Select Date, Time & Guests</h1>
        </div>

        <div className={styles.Dataa_type} id={styles.Data_type1}>
          <InfoChip icon={dateicon} label={date || "Select Date"} alt="date_icon" />
          <InfoChip icon={timeicon} label={time || "Select Time"} alt="time_icon" />
          <InfoChip icon={membericon} label={adults || 0} alt="member_icon" />
          <InfoChip icon={reacticon} label={children || 0} alt="react_icon" />
        </div>

        <div className={styles.Dataa_type}>
          {guestError && <p className="text-danger">{guestError}</p>}
          
          <DropDown
            options={[...Array(11).keys()].slice(1).map((num) => ({
              label: num.toString(),
              value: num.toString(),
              status: "default"
            }))}
            value={selectedAdults}
            onChange={handleAdultsChange}
            placeholder="Select Adults Number"
          />

         <DropDown
            options={[...Array(11).keys()].map((num) => ({
              label: num.toString(),
              value: num.toString(),
              status: "default"
            }))}
            value={selectedChildren}
            onChange={handleChildrenChange}
            placeholder="Select Children Number"
          />

          {isLoadingAvailability && (
            <p className={styles.loadingText}>Loading available dates...</p>
          )}
          {!availabilityData && !isLoadingAvailability && (
            <p className={styles.loadingText}>Please select number of guests to see available dates</p>
          )}
          <DatePicker
            value={date ? new Date(date) : null}
            onChange={handleDateChange}
            placeholder={availabilityData ? "Select Date" : "Select guests first"}
            disablePastDates={true}
            isDateDisabled={checkDateDisabled}
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
                label,
                value: iso,
                status: "default"
              };
            })}
            value={selectedTimeISO}
            onChange={handleTimeSelect}
            placeholder="Select Time"
            isLoading={isLoading}
          />

          <p className={styles.tbletext}>
            Your table is required to be returned by {leaveTime || "XX:XX PM"}
          </p>
        </div>

        <div className={`${styles.Dataa_type} ${styles.DatabtnMain3}`}>
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

        <div className={styles.Dataa_type}>
          <div className={styles.chose_m_link}>
            <Link to="/Select" className="chose__another__link">
              CHOOSE ANOTHER PUB
            </Link>
          </div>
          <Link to="/TopHome" className="exist__link">
            Exit And Cancel Booking
          </Link>
        </div>
      </div>
    </div>
  );
}
