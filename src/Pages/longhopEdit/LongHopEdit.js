import React, { useState, useEffect } from "react";
import { getCurrentRestaurant } from '../../utils/restaurantUtils';
import { postRequest } from "../../config/AxiosRoutes/index"
import logo from "../../images/The Long Hop - text.png";
import sectionimage from "../../images/TheLongHop_MainiMAGE.jpg";
import dateicon from "../../images/Chips Icons Mobile.png";
import timeicon from "../../images/Chips Icons Mobile (1).png";
import membericon from "../../images/Chips Icons Mobile (3).png";
import reacticon from "../../images/Chips Icons Mobile (2).png";
import styles from "./LongHopEdit.module.css";
import { Link, useNavigate } from "react-router-dom";
import PubImageHeaderLongHop from '../../components/PubImageHeaderLongHop/PubImageHeaderLongHop';
import InfoChip from '../../components/InfoChip/InfoChip';
import DatePicker from '../../components/ui/DatePicker/DatePicker';
import DropDown from '../../components/ui/DropDown/DropDown';
import CustomButton from '../../components/ui/CustomButton/CustomButton';
import Indicator from '../../components/Indicator/Indicator';
import { updateBasicInfo, updateCurrentStep } from '../../store/bookingSlice';
import { useDispatch, useSelector } from 'react-redux';
import { getAvailabilityForDateRange } from '../../services/bookingService';

export default function LongHopEdit() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get state from Redux
  const bookingState = useSelector((state) => state.booking);
  const { date, time, adults, children, pubType } = bookingState;
  console.log("Long Hop Edit bookingState", bookingState);
  
  // Local state for UI
  const [timeSlots, setTimeSlots] = useState([]);
  const [guestError, setGuestError] = useState("");
  const [selectedTimeISO, setSelectedTimeISO] = useState("");
  const [leaveTime, setLeaveTime] = useState("");
  const [selectedAdults, setSelectedAdults] = useState(adults?.toString() || "");
  const [selectedChildren, setSelectedChildren] = useState(children?.toString() || "");
  const [availablePromotionIds, setAvailablePromotionIds] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [availabilityData, setAvailabilityData] = useState(null);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  
  // Update form validation whenever relevant fields change
  const isFormValid = date && time && adults;

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
        const restaurant = getCurrentRestaurant(pubType, window.location.pathname);
        console.log("Long Hop Edit - Making AvailabilitySearch API call to:", `/api/ConsumerApi/v1/Restaurant/${restaurant}/AvailabilitySearch`);
        console.log("Long Hop Edit - Current pathname:", window.location.pathname);
        console.log("Long Hop Edit - Detected restaurant:", restaurant);
        
        const response = await postRequest(
          `/api/ConsumerApi/v1/Restaurant/${restaurant}/AvailabilitySearch`,
          headers,
          payload
        );
        console.log("Long Hop Edit - Availability data:", response.data);
        const slots = response.data?.TimeSlots || [];
        setTimeSlots(slots);

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
            
            // Extract AvailablePromotions from the selected TimeSlot
            if (selectedSlot.AvailablePromotions) {
              const promotionIds = selectedSlot.AvailablePromotions.map(promo => promo.Id);
              console.log("Long Hop Edit TimeSlot AvailablePromotions:", promotionIds);
              setAvailablePromotionIds(promotionIds);
            }
          }
        }
      } catch (error) {
        console.error("Long Hop Edit - Availability fetch failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailability();
  }, [date, adults, children, time, pubType]);

  // Fetch availability for the next month when party size changes or on initial load
  useEffect(() => {
    const fetchMonthAvailability = async () => {
      // Fetch if we have a party size (either existing or newly selected)
      const currentPartySize = parseInt(adults || 0) + parseInt(children || 0);
      if (currentPartySize <= 0) return;
      
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
        
        console.log("Fetching Long Hop Edit availability for date range:", { dateFromISO, dateToISO, partySize });
        
        const response = await getAvailabilityForDateRange(dateFromISO, dateToISO, partySize, pubType);
        console.log("Long Hop Edit month availability data:", response);
        setAvailabilityData(response);
      } catch (error) {
        console.error("Long Hop Edit month availability fetch failed:", error);
      } finally {
        setIsLoadingAvailability(false);
      }
    };
    
    fetchMonthAvailability();
  }, [adults, children, pubType]);

  // Sync local state with Redux state
  useEffect(() => {
    setSelectedAdults(adults?.toString() || "");
    setSelectedChildren(children?.toString() || "");
  }, [adults, children]);

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
      setAvailablePromotionIds([]);
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

      // Find the selected TimeSlot and extract its AvailablePromotions
      if (selectedSlot.AvailablePromotions) {
        const promotionIds = selectedSlot.AvailablePromotions.map(promo => promo.Id);
        console.log("Long Hop Edit - Selected TimeSlot AvailablePromotions:", promotionIds);
        setAvailablePromotionIds(promotionIds);
      } else {
        console.log("Long Hop Edit - No AvailablePromotions found for selected TimeSlot");
        setAvailablePromotionIds([]);
      }
    }
  };

  const handleNextClick = () => {
    if (!isFormValid) return;

    // Log the promotion IDs before storing in Redux
    console.log("Long Hop Edit - Storing promotion IDs in Redux:", availablePromotionIds);

    // Store the filtered promotion IDs in Redux for the next step
    dispatch(updateBasicInfo({
      availablePromotionIds: availablePromotionIds,
      pubType: pubType
    }));

    // Log the Redux state after dispatch
    console.log("Long Hop Edit - Updated Redux state with promotion IDs");

    dispatch(updateCurrentStep(2));

    console.log("Long Hop Edit - Navigating to longhopPickArea");
    navigate("/longhopPickArea");
  };

  // Function to check if a date is available based on availability data
  const isDateAvailable = (date) => {
    if (!availabilityData || !availabilityData.AvailableDates) {
      console.log("No Long Hop Edit availability data yet, disabling all dates until party size is available");
      return false;
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
    console.log(`Long Hop Edit date ${dateString} availability:`, isAvailable ? 'Available' : 'Not available');
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
      <div className={styles.griffinnMain} id="choose">
      <PubImageHeaderLongHop
        pubLogo={logo}
        sectionImg={sectionimage}
        pubLinkLabel="CHOOSE ANOTHER PUB"
        step={2}
          stepLength={4}
        pubLink="/select"
      />

      <div className={styles.Datamain}>


        <div className={styles.edit_container}>
          <div className={`${styles.Data_type} ${styles.imgdata}`}>
            <img src={logo} alt="logo" />
          </div>
          <div className={styles.Dataa_type}>
            <h1 className={`${styles.logo_large} ${styles.datetilte}`}>Edit Date, Time & Guests</h1>
          </div>
          <div className={`${styles.info_chip_container}`}>

            <InfoChip icon={dateicon} label={date || "Select Date"} alt="date_icon" />
            <InfoChip icon={timeicon} label={time || "Select Time"} alt="time_icon" />
            <InfoChip icon={membericon} label={adults || 0} alt="member_icon" />
            <InfoChip icon={reacticon} label={children || 0} alt="react_icon" />
          </div>
          <div className={styles.input_container}>
            {guestError && <p className="text-danger">{guestError}</p>}

            <div className='w-100'>
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
              <p className={styles.eg}>Edit Date</p>
            </div>


            <div className='w-100'>
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

              <p className={styles.eg}>Edit Adult Number</p>
            </div>
            <div className='w-100'>
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

              <p className={styles.eg}>Edit Children Number</p>
            </div>
            <div className='w-100'>
              <DropDown
                options={timeSlots.map((slot) => {
                  const iso = slot.TimeSlot;
                  const label = new Date(iso).toLocaleTimeString([], {
                     hour: "2-digit",
                min: "2-digit",
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
                noDataMessage="No available time slots for this date"
              />

              <p className={styles.eg}>Edit Time</p>
            </div>





            <p className={styles.tabletextedit}>
              Your table is required to be returned by {leaveTime || "XX:XX PM"}
            </p>
          </div>
          <div className={`${styles.Data_type} ${styles.EditbtnMain}`}>

            <CustomButton
              label="BACK"
              to="/longhopModify"
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
            <Indicator step={2} stepLength={4} />
          </div>
          <div className={styles.Data_type}>

            <Link to="/longhopHome" className="exist__link">
              Cancel Editing and exit
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


