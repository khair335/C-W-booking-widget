import React, { useState, useEffect } from "react";
import { postRequest } from "../../config/AxiosRoutes/index"
import { Link, useNavigate } from "react-router-dom";
import { getHeaders, buildPromotionUrl } from "../../config/api";
import { loginAndStoreToken, isTokenValid } from "../../config/Auth/Login";
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
export default function Griffin() {
  const navigate = useNavigate();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [selectedTimeISO, setSelectedTimeISO] = useState("");
  const [leaveTime, setLeaveTime] = useState("");
  const [timeSlots, setTimeSlots] = useState([]);
  const [adults, setAdults] = useState("");
  const [children, setChildren] = useState("");
  const [guestError, setGuestError] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [selectedAdults, setSelectedAdults] = useState(null);
  const [selectedChildren, setSelectedChildren] = useState(null);
  const MAX_RETRIES = 2;

  useEffect(() => {
    const ensureAuthenticated = async () => {
      if (!isTokenValid()) {
        try {
          await loginAndStoreToken();
          setRetryCount(0); // Reset retry count on successful login
        } catch (error) {
          console.error('Authentication failed:', error);
          setError('Authentication failed. Please try refreshing the page.');
        }
      }
    };

    ensureAuthenticated();
  }, []);

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!date || !adults || retryCount >= MAX_RETRIES) return;

      setIsLoading(true);
      setError(null);

      try {
        // Ensure we have a valid token
        if (!isTokenValid()) {
          await loginAndStoreToken();
          setRetryCount(0); // Reset retry count on successful login
        }

        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error('No authentication token available');
        }

        const headers = getHeaders(token);
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
          setRetryCount(0); // Reset retry count on successful request
          console.log("Availability data:", response.data);
        } else {
          setTimeSlots([]);
          setError("No time slots available for the selected date and party size.");
        }
      } catch (error) {
        console.error("Availability fetch failed:", error);
        if (error.response?.status === 401 && retryCount < MAX_RETRIES) {
          // Token expired or invalid, try to re-authenticate
          try {
            await loginAndStoreToken();
            setRetryCount(prev => prev + 1);
            // Don't call fetchAvailability recursively
            // Instead, let the useEffect dependency array handle the retry
          } catch (authError) {
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
  }, [date, adults, children, retryCount]); // Add retryCount to dependencies

  const isFormValid = date && time && adults;
  const handleNextClick = () => {
    if (!isFormValid) return;
    navigate("/area", {
      state: {
        date,
        time,
        adults,
        children,
        returnBy: leaveTime,
      },
    });
  };

  const handleTimeSelect = ({ iso, formatted, leaveTime }) => {
    setSelectedTimeISO(iso);
    setTime(formatted);
    setLeaveTime(leaveTime);
  };

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

        <div className={styles.info_chip_container} >


          <InfoChip icon={dateicon} label={date ? date : "Select Date"} alt="date_icon" />
          <InfoChip icon={timeicon} label={time ? time : "Select Time"} alt="time_icon" />
          <InfoChip icon={membericon} label={adults || 0} alt="member_icon" />
          <InfoChip icon={reacticon} label={children || 0} alt="react_icon" />

        </div>
        <div className={styles.input_container}>
          {error && <p className="text-danger">{error}</p>}
          {guestError && <p className="text-danger">{guestError}</p>}


          <DatePicker
            value={date ? new Date(date) : undefined}
            onChange={(newDate) => {
              // Format the date in YYYY-MM-DD format while preserving the local date
              const year = newDate.getFullYear();
              const month = String(newDate.getMonth() + 1).padStart(2, '0');
              const day = String(newDate.getDate()).padStart(2, '0');
              setDate(`${year}-${month}-${day}`);
            }}
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
            onChange={(value) => {
              const numValue = parseInt(value);
              if (numValue + parseInt(children || 0) <= 10) {
                setSelectedAdults(value);
                setAdults(numValue);
                setGuestError("");
              } else {
                setGuestError("Total guests (adults + children) cannot exceed 10.");
              }
            }}
            placeholder="Select Adults Number"
          />


          <DropDown
            options={[...Array(11).keys()].map((num) => ({
              label: num.toString(),
              value: num.toString(),
              status: "default"
            }))}
            value={selectedChildren}
            onChange={(value) => {
              const numValue = parseInt(value);
              if (parseInt(adults || 0) + numValue <= 10) {
                setSelectedChildren(value);
                setChildren(numValue);
                setGuestError("");
              } else {
                setGuestError("Total guests (adults + children) cannot exceed 10.");
              }
            }}
            placeholder="Select Children Number"
          />

           <DropDown
            options={timeSlots.map((slot) => {
              const iso = slot.TimeSlot;
              const label = new Date(iso).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });
              return {
                label: label,
                value: iso,
                status: "default"
              };
            })}
            value={selectedTimeISO}
            onChange={(value) => {
              setSelectedTimeISO(value);
              const dateObj = new Date(value);
              const formatted24Hour = dateObj.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              });
              setTime(formatted24Hour);
              const selectedSlot = timeSlots.find((slot) => slot.TimeSlot === value);
              setLeaveTime(selectedSlot?.LeaveTime || "");
            }}
            placeholder="Select Time"
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
            <Link to="" className="chose__another__link">
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
