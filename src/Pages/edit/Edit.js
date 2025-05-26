import React, { useState, useEffect } from "react";
import { postRequest } from "../../config/AxiosRoutes/index"
import logo from "../../images/Griffin Black.png";
import sectionimage from "../../images/79205c0e916b529d8d136ce69e32e592.png";
import dateicon from "../../images/Chips Icons Mobile.png";
import timeicon from "../../images/Chips Icons Mobile (1).png";
import membericon from "../../images/Chips Icons Mobile (3).png";
import reacticon from "../../images/Chips Icons Mobile (2).png";
import "./Edit.css";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Edit() {
  const location = useLocation();
  const navigate = useNavigate();
  const {bookingNumber} = location.state;
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [selectedTimeISO, setSelectedTimeISO] = useState("");
  const [leaveTime, setLeaveTime] = useState("");
  const [timeSlots, setTimeSlots] = useState([]);
  const [adults, setAdults] = useState("");
  const [children, setChildren] = useState("");
  const [guestError, setGuestError] = useState("");

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

  const isFormValid = date && time && adults && bookingNumber;
  const handleNextClick = () => {
    if (!isFormValid) return;
    navigate("/PickArea", {
      state: {
        date,
        time,
        adults,
        children,
        bookingNumber,
        returnBy: leaveTime,
      },
    });
  };

  return (
    <div className="griffinnMain" id="choose">
      <div className="DataimgMain">
        <img src={logo} alt="logo" className="logodata" />
        <img src={sectionimage} alt="section_" className="Data_imag" />
        <div className="changeMain">
          <div className="changetab fixed"></div>
          <div className="changetab"></div>
          <div className="changetab"></div>
          <div className="changetab"></div>
        </div>
        <Link to="/Select" className="anotherpub">
          CHOOSE ANOTHER PUB
        </Link>
      </div>
      <div className="Datamain">
        <div className="Data_type imgdata">
          <img src={logo} alt="logo" />
        </div>
        <div className="Dataa_type">
          <h1 className="logo-large datetilte">Select Date, Time & Guests</h1>
        </div>
        <div className="Dataa_type" id="Data_type1">
          <div className="titlewithicon">
            <img src={dateicon} alt="date_icon" />
            {date ? date : "Select Date"}
          </div>
          <div className="titlewithicon">
            <img src={timeicon} alt="time_icon" />
            {time ? time : "Select Time"}
          </div>
          <div className="titlewithicon">
            <img src={membericon} alt="member_icon" />
            {adults || 0}{" "}
          </div>
          <div className="titlewithicon">
            <img src={reacticon} alt="react_icon" />
            {children || 0}{" "}
          </div>
        </div>
        <div className="Dataa_type">
          {guestError && <p className="text-danger">{guestError}</p>}
          <input
            type="date"
            className="form-control form-control-lg mb-2 selecteopt"
            aria-label="Select Date"
            value={date}
            min={new Date().toISOString().split("T")[0]}
            onFocus={(e) => e.target.showPicker?.()}
            onChange={(e) => setDate(e.target.value)}
          />
          <select
            className="form-select form-select-lg mb-2 selecteopt"
            aria-label="Select Adults Number"
            value={adults}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              if (value + parseInt(children || 0) <= 10) {
                setAdults(value);
                setGuestError("");
              } else {
                setGuestError("Total guests (adults + children) cannot exceed 10.");
              }
            }}
          >
            <option value="">Select Adults Number</option>
            {[...Array(11).keys()].slice(1).map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
          <select
            className="form-select form-select-lg mb-2 selecteopt"
            aria-label="Select Children Number"
            value={children}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              if (parseInt(adults || 0) + value <= 10) {
                setChildren(value);
                setGuestError("");
              } else {
                setGuestError("Total guests (adults + children) cannot exceed 10.");
              }
            }}
          >
            <option value="">Select Children Number</option>
            {[...Array(11).keys()].map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
          <select
            className="form-select form-select-lg mb-2 selecteopt"
            aria-label="Select Time"
            value={selectedTimeISO}
            onChange={(e) => {
              const iso = e.target.value;
              setSelectedTimeISO(iso);
              const dateObj = new Date(iso);
              const formatted24Hour = dateObj.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              });
              setTime(formatted24Hour);
              const selectedSlot = timeSlots.find((slot) => slot.TimeSlot === iso);
              setLeaveTime(selectedSlot?.LeaveTime || "");
            }}
          >
            <option value="">Select Time</option>
            {timeSlots.map((slot, index) => {
              const iso = slot.TimeSlot;
              const label = new Date(iso).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });
              return (
                <option key={index} value={iso}>
                  {label}
                </option>
              );
            })}
          </select>
          <p className="tabletextedit">
            Your table is required to be returned by {leaveTime || "XX:XX PM"}
          </p>
        </div>
        <div className="Data_type EditbtnMain">
          <Link to="/Modify" className="Editbtn">
            BACK
          </Link>
          <button className="Editbtn"
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
        <div className="EditMainmob">
          <div className="Edittab "></div>
          <div className="Edittab fixedit"></div>
          <div className="Edittab"></div>
          <div className="Edittab "></div>
          <div className="Edittab "></div>
        </div>
        <div className="Data_type ">
          <Link to="" className="anotherpub2">
            CHOOSE ANOTHER PUB
          </Link>
          <Link to="/" className="Existlink">
            Exit And Cancel Booking
          </Link>
        </div>
      </div>
    </div>
  );
}
