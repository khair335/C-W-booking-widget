import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { postRequest } from "../../config/AxiosRoutes/index"
import { Link, useNavigate } from "react-router-dom";
import { getHeaders } from "../../config/api";
import { useAuth } from "../../contexts/AuthContext";
import logo from "../../images/Griffin Black.png";
import sectionimage from "../../images/79205c0e916b529d8d136ce69e32e592.png";
import dateicon from "../../images/Chips Icons Mobile.png";
import timeicon from "../../images/Chips Icons Mobile (1).png";
import membericon from "../../images/Chips Icons Mobile (3).png";
import reacticon from "../../images/Chips Icons Mobile (2).png";
import TimeSlotSelector from "../../components/TimeSlotSelector/TimeSlotSelector";
import styles from "./Griffin.module.css";
import DatePicker from '../../components/ui/DatePicker/DatePicker';
import DropDown from '../../components/ui/DropDown/DropDown';
import PubImageHeader from '../../components/PubImageHeader/PubImageHeader';
import Indicator from '../../components/Indicator/Indicator';
import InfoChip from '../../components/InfoChip/InfoChip';
import CustomButton from '../../components/ui/CustomButton/CustomButton';
import { updateBasicInfo, updateCurrentStep } from '../../store/bookingSlice';

export default function Griffin() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, isAuthenticating, token, authError, authenticate } = useAuth();

  // Get state from Redux
  const bookingState = useSelector((state) => state.booking);
  const { date, time, adults, children, returnBy } = bookingState;

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
  }, [isAuthenticated, isAuthenticating, authError, authenticate]);

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
          "/api/ConsumerApi/v1/Restaurant/CatWicketsTest/AvailabilitySearch",
          headers,
          payload
        );

        if (response.data?.TimeSlots) {
          setTimeSlots(response.data.TimeSlots);
          setRetryCount(0);

          // Filter promotions for specific areas
          const promotions = response.data?.Promotions || [];
          console.log("All Griffin promotions:", promotions);

          const filteredPromotionIds = promotions
            .filter(promo => {
              const isRelevantPromotion =
                promo.Name == "Stables Restaurant Area" ||
                promo.Name == "New Bar Area " ||
                promo.Name == "The Old Pub Area (dog friendly)";

              console.log(`Checking promotion: ${promo.Name} (${promo.Id}) - ${isRelevantPromotion ? 'included' : 'excluded'}`);
              return isRelevantPromotion;
            })
            .map(promo => promo.Id);

          console.log("Filtered promotion IDs for Griffin:", filteredPromotionIds);
          setAvailablePromotionIds(filteredPromotionIds);

          // Handle time slots
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
  }, [date, adults, children, retryCount, isAuthenticating, isAuthenticated, token, authError, authenticate]);

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

  const handleTimeChange = (newTime) => {
    dispatch(updateBasicInfo({ time: newTime }));
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
      return;
    }

    setSelectedTimeISO(iso);
    dispatch(updateBasicInfo({
      time: formatted,
      returnBy: leaveTime
    }));
    setLeaveTime(leaveTime);
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

          <DatePicker
            selected={dateForPicker}
            onChange={handleDateChange}
            placeholder="Select Date"
            disablePastDates={true}
          />

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
            Your table is required to be returned by {leaveTime || "XX:XX PM"}
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
    </div>
  );
}
