import React, { useState, useEffect } from "react";
import { getRequest } from "../../config/AxiosRoutes/index"
import { buildPromotionUrl } from "../../config/api"
import logo from "../../images/Griffin Black.png";
import sectionimage from "../../images/79205c0e916b529d8d136ce69e32e592.png";
import dateicon from "../../images/Chips Icons Mobile.png";
import timeicon from "../../images/Chips Icons Mobile (1).png";
import membericon from "../../images/Chips Icons Mobile (3).png";
import reacticon from "../../images/Chips Icons Mobile (2).png";
import resturanticon from "../../images/table_restaurant.png";
import Areimg1 from "../../images/TheGriffinInn_OldPubArea.png";
import Areimg2 from "../../images/TheGriffinInn_Stables_NewBarFloor.png";
import sectionimg2 from "../../images/Tap & Run_MainImage 1.png";
import tabimg from "../../images/Menu Icon Mobile (1).png";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./Area.css";

export default function Area() {
  const navigate = useNavigate();
  const location = useLocation();
  const [promotions, setPromotions] = useState([]);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const { date, time, adults, children, returnBy } = location.state || {};

  const isFormValid = date && time && adults && selectedPromotion;
  const handleNextClick = () => {
    if (!isFormValid) return;
    navigate("/details", { state: {date, time, adults, children, returnBy, selectedPromotion}});
  };

useEffect(() => {
    const handleBooking = async () => {
      const token = localStorage.getItem('token');
      const headers = {
        Authorization: `Bearer ${token}`,
      };
      try {
        const response = await getRequest(
          buildPromotionUrl('griffin'),
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

  // Helper function to determine if we should show description
  const shouldShowDescription = (promotion) => {
    const name = promotion.Name.toLowerCase();
    return name.includes("stables") || name.includes("new bar") || name.includes("old pub");
  };

  // Helper function to get the appropriate image for each area
  const getAreaImage = (promotion) => {
    const name = promotion.Name.toLowerCase();
    if (name.includes("stables")) return Areimg2;
    if (name.includes("new bar")) return Areimg2;
    if (name.includes("old pub")) return Areimg1;
    return Areimg1; // default image
  };

  return (
    <div className="AreaaMain" id="choose">
      <div className="AreaimgMain">
      <img src={logo} alt="logo" className="logodata" />
      <img src={sectionimage} alt="section_" className="Data_imag" />
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
            const showDescription = shouldShowDescription(promotion);
            const areaImage = getAreaImage(promotion);

            return (
              <div className="areasection" key={promotion.Id}>
                <div className={`area_1and2 ${isSelected ? "selected" : ""}`} >
                  <div className="restArea">
                    <img
                      src={areaImage}
                      alt={promotion.Name}
                      className="Newbrimg"
                    />
                    <p className="Areatextmain">
                      <h3>{promotion.Name}</h3>
                      {promotion.Description && showDescription && (
                        <>
                          <Link
                            className="readinfo"
                            onClick={(e) => {
                              e.stopPropagation();
                              const readText = document.getElementById(`readtext-${promotion.Id}`);
                              readText.style.display =
                                readText.style.display === "none" ? "flex" : "none";
                            }}
                          >
                            Read Info
                            <img src={tabimg} alt="tab_img" />
                          </Link>
                          <h6
                            className="readtext"
                            id={`readtext-${promotion.Id}`}
                            style={{ display: "none" }}
                          >
                            {promotion.Description}
                          </h6>
                        </>
                      )}
                    </p>
                  </div>
 <button onClick={() => togglePromotion(promotion)} className="selectbtn">
                    {
                      isSelected ? "Selected" : "Select"
                    }
                  </button>
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
          <Link to="/Griffin" className="Area-button" state={{ image: sectionimg2 }}>
            BACK
          </Link>
          <button
            className="Area-button "
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
        <div className="changeMnn">
          <div className="changeselectarea"></div>
          <div className="changeselectarea fixd"></div>
          <div className="changeselectarea"></div>
          <div className="changeselectarea"></div>
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
