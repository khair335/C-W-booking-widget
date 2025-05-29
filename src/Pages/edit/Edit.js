import React, { useState, useEffect } from "react";
import { postRequest } from "../../config/AxiosRoutes/index"
import logo from "../../images/Griffin Black.png";
import sectionimage from "../../images/79205c0e916b529d8d136ce69e32e592.png";
import dateicon from "../../images/Chips Icons Mobile.png";
import timeicon from "../../images/Chips Icons Mobile (1).png";
import membericon from "../../images/Chips Icons Mobile (3).png";
import reacticon from "../../images/Chips Icons Mobile (2).png";
import styles from "./Edit.module.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import PubImageHeader from '../../components/PubImageHeader/PubImageHeader';
import InfoChip from '../../components/InfoChip/InfoChip';
import DatePicker from '../../components/ui/DatePicker/DatePicker';
import DropDown from '../../components/ui/DropDown/DropDown';
import CustomButton from '../../components/ui/CustomButton/CustomButton';
import Indicator from '../../components/Indicator/Indicator';

export default function Edit() {
  const location = useLocation();
  const navigate = useNavigate();
  const { bookingNumber } = location.state;
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [selectedTimeISO, setSelectedTimeISO] = useState("");
  const [leaveTime, setLeaveTime] = useState("");
  const [timeSlots, setTimeSlots] = useState([]);
  const [adults, setAdults] = useState("");
  const [children, setChildren] = useState("");
  const [guestError, setGuestError] = useState("");
  const [selectedAdults, setSelectedAdults] = useState(null);
  const [selectedChildren, setSelectedChildren] = useState(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!date || !adults) return;

      setIsLoadingSlots(true);
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
        setTimeSlots([]);
      } finally {
        setIsLoadingSlots(false);
      }
    };

    fetchAvailability();
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
    <div className={styles.griffinnMain} id="choose">
      <PubImageHeader
        pubLogo={logo}
        sectionImg={sectionimage}
        pubLinkLabel="CHOOSE ANOTHER PUB"
        step={1}
        pubLink="/Select"
      />

      <div className={styles.Datamain}>


        <div className={styles.edit_container}>
          <div className={`${styles.Data_type} ${styles.imgdata}`}>
            <img src={logo} alt="logo" />
          </div>
          <div className={styles.Dataa_type}>
            <h1 className={`${styles.logo_large} ${styles.datetilte}`}>edit Date, time & Guests</h1>
          </div>
          <div className={`${styles.info_chip_container}`}>

            <InfoChip icon={dateicon} label={date ? date : "Select Date"} alt="date_icon" />
            <InfoChip icon={timeicon} label={time ? time : "Select Time"} alt="time_icon" />
            <InfoChip icon={membericon} label={adults || 0} alt="member_icon" />
            <InfoChip icon={reacticon} label={children || 0} alt="react_icon" />
          </div>
          <div className={styles.input_container}>
            {guestError && <p className="text-danger">{guestError}</p>}


            <div className='w-100'>
              <DatePicker
                value={date ? new Date(date) : undefined}
                onChange={(newDate) => {
                  const year = newDate.getFullYear();
                  const month = String(newDate.getMonth() + 1).padStart(2, '0');
                  const day = String(newDate.getDate()).padStart(2, '0');
                  setDate(`${year}-${month}-${day}`);
                }}
                placeholder="Select Date"
                disablePastDates={true}
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

              <p className={styles.eg}>Edit Children Number</p>
            </div>
            <div className='w-100'>
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
                isLoading={isLoadingSlots}
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
            <Indicator step={2} />
          </div>
          <div className={styles.Data_type}>
            {/* <div className={styles.chose_m_link}>
              <Link to="" className="chose__another__link">
              CHOOSE ANOTHER PUB
            </Link>
            </div> */}
            <Link to="/" className="exist__link">
              Cancel Editing and exit
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
