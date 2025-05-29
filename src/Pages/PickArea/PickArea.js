import React, { useState, useEffect } from "react";
import { getRequest } from "../../config/AxiosRoutes/index"
import logo from "../../images/Griffin Black.png";
import sectionimage from "../../images/79205c0e916b529d8d136ce69e32e592.png";
import dateicon from "../../images/Chips Icons Mobile.png";
import timeicon from "../../images/Chips Icons Mobile (1).png";
import membericon from "../../images/Chips Icons Mobile (3).png";
import reacticon from "../../images/Chips Icons Mobile (2).png";
import resturanticon from "../../images/table_restaurant.png";
import stablesRestaurantArea from "../../images/TheGriffinInn_Stables_NewBarFloor.png";
import oldPubArea from "../../images/TheGriffinInn_OldPubArea.png";
import newBarArea from "../../images/TheGriffinInn_NewBarArea.png";
import tabimg from "../../images/Menu Icon Mobile (1).png";
import { Link, useLocation, useNavigate } from "react-router-dom";
import styles from "./PickArea.module.css";
import PubImageHeader from '../../components/PubImageHeader/PubImageHeader';
import InfoChip from '../../components/InfoChip/InfoChip';
import AreaSelectionCard from '../../components/AreaSelectionCard/AreaSelectionCard';
import Indicator from '../../components/Indicator/Indicator';
import CustomButton from '../../components/ui/CustomButton/CustomButton';

export default function PickArea() {
  const navigate = useNavigate();
  const location = useLocation();
  const [promotions, setPromotions] = useState([]);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const { date, time, adults, children, bookingNumber, returnBy } = location.state || {};
  const [openInfoId, setOpenInfoId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const isFormValid = date && time && adults && bookingNumber && selectedPromotion;
  const handleNextClick = () => {
    if (!isFormValid) return;
    navigate("/ReDetail", { state: { date, time, adults, children, returnBy, bookingNumber, selectedPromotion } });
  };

  useEffect(() => {
    const handleBooking = async () => {
       setIsLoading(true);
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
         setIsLoading(false);
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
    <div className={styles.AreaaMain} id="choose">

      <PubImageHeader
        pubLogo={logo}
        sectionImg={sectionimage}
        pubLinkLabel="CHOOSE ANOTHER PUB"
        step={3}
        pubLink="/Select"
      />

      <div className={styles.Ara_main} id="Area--main">
        <div className={`${styles.Data_type} ${styles.imgdata}`}>
          <img src={logo} alt="logo" />
        </div>
        <div className={styles.Area_type} id="Area_type1">
          <h1 className={styles.logo_large} id="datetilte">Pick Your Area</h1>
        </div>
        <div className={styles.info_chip_container} id="Area_type1">

          <InfoChip icon={dateicon} label={date ? date : "Select Date"} alt="date_icon" />
          <InfoChip icon={timeicon} label={time ? time : "Select Time"} alt="time_icon" />
          <InfoChip icon={membericon} label={adults || 0} alt="member_icon" />
          <InfoChip icon={reacticon} label={children || 0} alt="react_icon" />
          <InfoChip icon={resturanticon} label={selectedPromotion?.Name || "Select Area"} alt="react_icon" />
        </div>
                <div className={styles.promotions_container}>
          {isLoading ? (
            <div className={styles.loader_container}>
              <div className={styles.loader}></div>
              <p>Loading areas...</p>
            </div>
          ) : (
              promotions.map((promotion) => {
                  let restaurantImage;
                  if (promotion.Name.includes("The Old Pub Area (dog friendly)")) {
                    restaurantImage = oldPubArea;
                  } else if (promotion.Name.includes("(Restaurant Area)")) {
                    restaurantImage = newBarArea ;
                  } else {
                    restaurantImage = stablesRestaurantArea;
                  }
              return (
                <AreaSelectionCard
                  key={promotion.Id}
                  promotion={promotion}
                  isSelected={selectedPromotion?.Id === promotion.Id}
                  onSelect={togglePromotion}
                  restaurantImage={restaurantImage}
                  tabImage={tabimg}
                  showInfoToggle={true}
                />
              );
            })
          )}
        </div>
        <div className={styles.Area_type}>
          <p className={styles.tabletext}>
            Your table is required to be returned by {returnBy || "XX:XX PM"}
          </p>
        </div>
        <div className='d-flex  justify-content-center align-items-center gap-3' id={`${styles.DatabtnMain}`}>


          <CustomButton
            label="BACK"
            to="/Edit"
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
        <div className={styles.changeMainn}>
          <Indicator step={3} />
        </div>
        <div className={styles.Area_type}>
          <Link to="/Select" className="chose__another__link">
            CHOOSE ANOTHER PUB
          </Link>
          <Link to="/" className="exist__link">
            Exit And Cancel Booking
          </Link>
        </div>
      </div>
    </div>
  );
}
