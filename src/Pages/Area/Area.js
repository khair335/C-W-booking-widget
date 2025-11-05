import React, { useState, useEffect } from "react";
import { getCurrentRestaurant } from '../../utils/restaurantUtils';
import { useDispatch, useSelector } from 'react-redux';
import { getRequest } from "../../config/AxiosRoutes/index"
// removed unused buildPromotionUrl import
import { updateSelectedPromotion, updateCurrentStep } from '../../store/bookingSlice';
import logo from "../../images/Griffin Black.png";
import sectionimage from "../../images/79205c0e916b529d8d136ce69e32e592.png";
import dateicon from "../../images/Chips Icons Mobile.png";
import timeicon from "../../images/Chips Icons Mobile (1).png";
import membericon from "../../images/Chips Icons Mobile (3).png";
import reacticon from "../../images/Chips Icons Mobile (2).png";
import resturanticon from "../../images/table_restaurant.png";
// removed unused static area images and section image
import tabimg from "../../images/Menu Icon Mobile (1).png";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Area.module.css";
import PubImageHeader from '../../components/PubImageHeader/PubImageHeader';
import InfoChip from '../../components/InfoChip/InfoChip';
import AreaSelectionCard from '../../components/AreaSelectionCard/AreaSelectionCard';
import Indicator from '../../components/Indicator/Indicator';
import CustomButton from '../../components/ui/CustomButton/CustomButton';

export default function Area() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // removed unused location

  // Get state from Redux
  const bookingState = useSelector((state) => state.booking);
  const { date, time, adults, children, returnBy, selectedPromotion, availablePromotionIds, pubType } = bookingState;
  console.log('availablePromotionIds',availablePromotionIds);

  // Local state
  const [promotions, setPromotions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  // removed unused error state

  const isFormValid = date && time && adults && selectedPromotion;

  const handleNextClick = () => {
    if (!isFormValid) return;
    localStorage.removeItem("paymentSessionId")
    localStorage.removeItem("pendingBookingData")
    localStorage.removeItem("awaitingPayment")
    localStorage.removeItem("drinkAmount")
    localStorage.removeItem("drinkName")
    localStorage.removeItem("drinkPurchased")
    dispatch(updateCurrentStep(3));
    navigate("/Details");
  };

  useEffect(() => {
    const fetchPromotions = async () => {
      if (!availablePromotionIds?.length) {
        console.log("No promotion IDs available:", availablePromotionIds);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      // no-op

      const token = localStorage.getItem('token');
      if (!token) {
        console.error("Authentication token not found");
        setIsLoading(false);
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      try {
        // Create query string with multiple promotionIds parameters
        const queryString = availablePromotionIds
          .map(id => `promotionIds=${id}`)
          .join('&');

        const url = `/api/ConsumerApi/v1/Restaurant/${getCurrentRestaurant(pubType, window.location.pathname)}/Promotion?${queryString}`;
        console.log("Making Area API call to:", url);
        console.log("Current pathname:", window.location.pathname);
        console.log("Detected restaurant:", getCurrentRestaurant(pubType, window.location.pathname));

        const response = await getRequest(url, headers);
        console.log("Area promotions response:", response.data);

        if (response.data && Array.isArray(response.data)) {
          setPromotions(response.data);
        } else {
          console.error("Invalid response format from server");
        }
      } catch (error) {
        console.error("Failed to fetch Griffin Area promotions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPromotions();
  }, [availablePromotionIds, pubType]);

  const togglePromotion = (promotion) => {
    dispatch(updateSelectedPromotion(
      selectedPromotion?.Id === promotion.Id ? null : { Id: promotion.Id, Name: promotion.Name,MayRequireCreditCard:promotion.MayRequireCreditCard }
    ));
  };



  return (
    <div className={styles.AreaaMain} id="choose">
      <PubImageHeader
        pubLogo={logo}
        sectionImg={sectionimage}
        pubLinkLabel="CHOOSE ANOTHER PUB"
        step={2}
        pubLink="/Select"
      />
      <div className={styles.Area_main} id="Area--main">
        <div className={`${styles.Area_type} ${styles.imgdata}`}>
          <img src={logo} alt="logo" />
        </div>
        <div className={styles.Area_type}>
          <h1 className={`${styles.logo_large} ${styles.datetilte}`}>Pick Your Area</h1>
        </div>

        <div className={styles.info_chip_container}>
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
              const restaurantImage = promotion.HorizontalImageUrl;

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

        <div className={`${styles.Area_type} ${styles.DatabtnMain}`}>
          <CustomButton
            label="BACK"
            to="/Griffin"
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
        <div className={styles.Area_type_footer}>
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
