import React, { useState, useEffect } from "react";
import { getRequest } from "../../config/AxiosRoutes/index"
import logo from "../../images/Griffin Black.png";
import dateicon from "../../images/Chips Icons Mobile.png";
import timeicon from "../../images/Chips Icons Mobile (1).png";
import membericon from "../../images/Chips Icons Mobile (3).png";
import reacticon from "../../images/Chips Icons Mobile (2).png";
import resturanticon from "../../images/table_restaurant.png";
import Areimg1 from "../../images/Image (1).png";
import Areimg2 from "../../images/Image (2).png";
import tabimg from "../../images/Menu Icon Mobile (1).png";
import whitelogo from "../../images/T&R White.png"
import sectionimg2 from "../../images/Tap & Run_MainImage 1.png";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./TopPickArea.css";

export default function TopPickArea() {
  const navigate = useNavigate();
  const location = useLocation();
    const [promotions, setPromotions] = useState([]);
    const [selectedPromotion, setSelectedPromotion] = useState(null);
  const { date, time, adults, children, bookingNumber, returnBy } = location.state || {};

  const isFormValid = date && time && adults && bookingNumber && selectedPromotion;
  const handleNextClick = () => {
    if (!isFormValid) return;
    navigate("/TopReDetail", { state: {date, time, adults, children, returnBy, bookingNumber, selectedPromotion}});
      };

    useEffect(() => {
        const handleBooking = async () => {
          const token = localStorage.getItem('token');
          const headers = {
            Authorization: `Bearer ${token}`,
          };
          try {
            const response = await getRequest(
              '/api/ConsumerApi/v1/Restaurant/CatWicketsTest/Promotion?promotionIds=2809&promotionIds=2810',
              headers,
            );
            setPromotions(response.data);
            console.log('promotion Data:', response.data);
          } catch (error) {
            console.error('Promotion Failed:', error);
          }
        };
        handleBooking();
      }, []);

    const togglePromotion = (promotion) => {
      setSelectedPromotion((prev) =>
        prev?.Id === promotion.Id ? null : { Id: promotion.Id, Name: promotion.Name }
      );
    };

  return (
    <div className="AreaaMain" id="choose">
      <div className="AreaimgMain">
      <img src={whitelogo} alt="logo" className="logodata" />
      <img src={sectionimg2} alt="section_" className="Data_imag" />
        <div className="changeMain">
          <div className="changetab"></div>
          <div className="changetab fixd"></div>
          <div className="changetab"></div>
          <div className="changetab"></div>
        </div>
        <Link to="/Select" className="anotherpub">
          CHOOSE ANOTHER PUB
        </Link>
      </div>
      <div className="Ara-main" id="Area--main">
        <div className="Area_type imgdata">
          <img src={logo} alt="logo" />
        </div>
        <div className="Area_type">
          <h1 className="logo-large datetilte">Pick Your Area</h1>
        </div>
        <div className="Area_type" id="Area_type1">
          <div className="Areatitle_type">
            <img src={dateicon} alt="date_icon" />
            {date ? date : "Select Date"}
          </div>
          <div className="Areatitle_type">
            <img src={timeicon} alt="time_icon" />
            {time ? time : "Select Time"}
          </div>
          <div className="Areatitle_type">
            <img src={membericon} alt="member_icon" />
            {adults || 0}
          </div>
          <div className="Areatitle_type">
            <img src={reacticon} alt="react_icon" />
            {children || 0}
          </div>
          <div className="Areatitle_type">
            <img src={resturanticon} alt="react_icon" />
            {selectedPromotion?.Name || "Select Area"}
          </div>
        </div>
        <div className="Area_type">
          {promotions.map((promotion, index) => {
            const isSelected = selectedPromotion?.Id === promotion.Id;
            const isRestaurant = promotion.Name.toLowerCase().includes("restaurant");
            return (
              <div className="areasection" key={promotion.Id}>
                <div className={`area_1and2 ${isSelected ? "selected" : ""}`} onClick={() => togglePromotion(promotion)}>
                  <div className="restArea">
                    <img
                      src={isRestaurant ? Areimg2 : Areimg1}
                      alt={promotion.Name}
                      className="Newbrimg"
                    />
                    <p className="Areatextmain">
                      <h3>{promotion.Name}</h3>
                      {promotion.Description && isRestaurant && (
                        <>
                          <Link
                            className="readinfo"
                            onClick={(e) => {
                              e.stopPropagation(); // prevent selection toggle
                              const readText = document.getElementById("readtextt");
                              readText.style.display =
                                readText.style.display === "none" ? "flex" : "none";
                            }}
                          >
                            Read Info
                            <img src={tabimg} alt="tab_img" />
                          </Link>
                          <h6 className="readtext" id="readtextt" style={{ display: "none" }}>
                            {promotion.Description}
                          </h6>
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="Area_type">
          <p className="tabletext">
            Your table is required to be returned by {returnBy|| "XX:XX PM"}
          </p>
        </div>
        <div className="Area_type DatabtnMain">
          <Link to="/TopEdit" className="data-button">
            BACK
          </Link>
          <button
            className="griffinbuttn3"
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
        <div className="changeMainn">
          <div className="changeselect"></div>
          <div className="changeselect fixd"></div>
          <div className="changeselect"></div>
          <div className="changeselect"></div>
        </div>
        <div className="Area_type ">
          <Link to="/Select" className="anotherpub2">
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
