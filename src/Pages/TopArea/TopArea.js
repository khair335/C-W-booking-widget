import React, { useState, useEffect } from "react";
import { getCurrentRestaurant } from '../../utils/restaurantUtils';
import { useDispatch, useSelector } from 'react-redux';
import { getRequest } from "../../config/AxiosRoutes/index"
// removed unused buildPromotionUrl import
import dateicon from "../../images/Chips Icons Mobile.png";
import timeicon from "../../images/Chips Icons Mobile (1).png";
import membericon from "../../images/Chips Icons Mobile (3).png";
import reacticon from "../../images/Chips Icons Mobile (2).png";
import resturanticon from "../../images/table_restaurant.png";
import tabimg from "../../images/Menu Icon Mobile (1).png";
import sectionimg2 from "../../images/Tap & Run_MainImage 1.png";
import whitelogo from "../../images/T&R White.png"
import logo1 from "../../images/Logo (1).png"
import { Link, useNavigate } from "react-router-dom";
import styles from "./TopArea.module.css";
import PubImageHeader from '../../components/PubImageHeader/PubImageHeader';
import InfoChip from '../../components/InfoChip/InfoChip';
import CustomButton from '../../components/ui/CustomButton/CustomButton';
import AreaSelectionCard from '../../components/AreaSelectionCard/AreaSelectionCard';
import Indicator from '../../components/Indicator/Indicator';
// removed unused static area images
import { updateSelectedPromotion, updateCurrentStep } from '../../store/bookingSlice';

export default function TopArea() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // removed unused location

  // Get state from Redux
  const bookingState = useSelector((state) => state.booking);
  const { date, time, adults, children, returnBy, selectedPromotion, availablePromotionIds, pubType } = bookingState;
  console.log('availablePromotionIds',availablePromotionIds);

  // Local state
  const [promotions, setPromotions] = useState([]);
  console.log('promotions',promotions);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const isFormValid = date && time && adults && selectedPromotion;

  const handleNextClick = () => {
    if (!isFormValid) return;
    dispatch(updateCurrentStep(3));
    navigate("/topDetails");
  };

  useEffect(() => {
    const fetchPromotions = async () => {
      if (!availablePromotionIds?.length) {
        console.log("No promotion IDs available:", availablePromotionIds);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        setError("Authentication token not found");
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
        console.log("Making TopArea API call to:", url);
        console.log("Current pathname:", window.location.pathname);
        console.log("Detected restaurant:", getCurrentRestaurant(pubType, window.location.pathname));

        const response = await getRequest(url, headers);
        console.log("TopArea promotions response:", response.data);

        if (response.data && Array.isArray(response.data)) {
          setPromotions(response.data);
        } else {
          setError("Invalid response format from server");
        }
      } catch (error) {
        console.error("Failed to fetch Griffin Area promotions:", error);
        setError(error.message || "Failed to fetch promotions");
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

console.log('availablePromotionIds',availablePromotionIds);
  return (
    <div className={styles.TopAreaMain} id="choose">
      <PubImageHeader
        pubLogo={whitelogo}
        sectionImg={sectionimg2}
        pubLinkLabel="CHOOSE ANOTHER PUB"
        step={2}
        pubLink="/Select"
      />
      <div className={styles.Ara_main} id="Area--main">
        <div className={`${styles.Area_type} ${styles.imgdata}`}>
          <img src={logo1} alt="logo" />
        </div>
        <div className={styles.Area_type}>
          <h1 className={`${styles.logo_large} `}>Pick Your Area</h1>
        </div>
        <div className={`${styles.infochipmain} ${styles.Area_type1}`} >
          <InfoChip icon={dateicon} label={date || "Select Date"} alt="date_icon" />
          <InfoChip icon={timeicon} label={time || "Select Time"} alt="time_icon" />
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
          ) : error ? (
            <div className={styles.error_container}>
              <p className={styles.error_message}>{error}</p>
              <button
                className={styles.retry_button}
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </div>
          ) : promotions.length === 0 ? (
            <div className={styles.no_areas}>
              <p>No areas available for the selected time and date.</p>
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
            to="/topandrun"
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

        <div className={styles.changeTopMainn}>
          <Indicator step={2} />
        </div>

        <div className={styles.Area_type_footer}>
          <div className={styles.chose_m_link}>
            <Link to="/Select" className='chose__another__link'>
              CHOOSE ANOTHER PUB
            </Link>
          </div>
          <Link to="/TopHome" className='exist__link'>
            Exit And Cancel Booking
          </Link>
        </div>
      </div>
    </div>
  );
}
