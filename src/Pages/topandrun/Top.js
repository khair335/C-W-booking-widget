import React, { useState, useEffect } from "react";
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
  const [selectedValue, setSelectedValue] = useState(null);
  const [selectedValues, setSelectedValues] = useState([]);
  const [selectedAdults, setSelectedAdults] = useState(null);
  const [selectedChildren, setSelectedChildren] = useState(null);
  useEffect(() => {
    const fetchAvailability = async () => {
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
          "/api/ConsumerApi/v1/Restaurant/CatWicketsTest/AvailabilitySearch",
          headers,
          payload
        );
        console.log("Availability data:", response.data);
        const slots = response.data?.TimeSlots || [];
        setTimeSlots(slots);
      } catch (error) {
        console.error("Availability fetch failed:", error);
      }
    };
    if (date && adults) {
      fetchAvailability();
    }
  }, [date, adults, children]);

  const isFormValid = date && time && adults;
  const handleNextClick = () => {
    if (!isFormValid) return;
    navigate("/topArea", {
      state: {
        date,
        time,
        adults,
        children,
        returnBy: leaveTime,
      },
    });
  };

  return (
    <div className={styles.griffinMain} id="choose">
      <div className={styles.DataimgMain}>
        <img src={whitelogo} alt="logo" className={styles.logodata} />
        <img src={sectionimg2} alt="section_" className={styles.Data_imag} />
        <div className={styles.changeMain}>
          <div className={`${styles.changetab} ${styles.fixed}`}></div>
          <div className={styles.changetab}></div>
          <div className={styles.changetab}></div>
          <div className={styles.changetab}></div>
        </div>
        <Link to="/Select" className={styles.anotherpub}>
          CHOOSE ANOTHER PUB
        </Link>
      </div>
      <div className={styles.Datamain}>
        {/* <div className={styles.Data_type} >
          <img src={logo1} alt="logo" />
        </div> */}
        <div className={styles.Dataa_type}>
          <h1 className={`${styles.logo_large} ${styles.datetilte}`}>Select Date, Time & Guests</h1>
        </div>

        <div className={styles.Dataa_type} id={styles.Data_type1}>
          <div className={styles.titlewithicon}>
            <img src={dateicon} alt="date_icon" />
            {date ? date : "Select Date"}
          </div>
          <div className={styles.titlewithicon}>
            <img src={timeicon} alt="time_icon" />
            {time ? time : "Select Time"}
          </div>
          <div className={styles.titlewithicon}>
            <img src={membericon} alt="member_icon" />
            {adults || 0}
          </div>
          <div className={styles.titlewithicon}>
            <img src={reacticon} alt="react_icon" />
            {children || 0}
          </div>
        </div>
        <div className={styles.Dataa_type}>
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
          <Link to="/Select" className={styles.griffinbuttn3}>
            BACK
          </Link>
          <button
            className={styles.griffinbuttn3}
            onClick={handleNextClick}
            disabled={!isFormValid}
            style={{
              backgroundColor: !isFormValid ? "#ccc" : "#000",
              color: !isFormValid ? "#666" : "#fff",
              cursor: !isFormValid ? "not-allowed" : "pointer",
            }}
          >
            NEXT
          </button>
        </div>
        <div className={`${styles.griffinMainmob} `}>
          <div className={`${styles.changetabg} ${styles.fixed}`}></div>
          <div className={`${styles.changetabg}`}></div>
          <div className={`${styles.changetabg}`}></div>
          <div className={`${styles.changetabg}`}></div>
        </div>
        <div className={styles.Dataa_type}>
          <Link to="" className={styles.anotherpub2}>
            CHOOSE ANOTHER PUB
          </Link>
          <Link to="/TopHome" className={styles.Existlink}>
            Exit And Cancel Booking
          </Link>
        </div>
      </div>
    </div>
  );
}
