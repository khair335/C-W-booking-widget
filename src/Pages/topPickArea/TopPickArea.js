import React, { useState, useEffect } from "react";
import { getCurrentRestaurant } from '../../utils/restaurantUtils';
import { useDispatch, useSelector } from 'react-redux';
import { getRequest } from "../../config/AxiosRoutes/index"
import logo from "../../images/T&R White.png";
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
import styles from "./TopPickArea.module.css";
import PubImageHeader from '../../components/PubImageHeader/PubImageHeader';
import InfoChip from '../../components/InfoChip/InfoChip';
import AreaSelectionCard from '../../components/AreaSelectionCard/AreaSelectionCard';
import CustomButton from '../../components/ui/CustomButton/CustomButton';
import Indicator from '../../components/Indicator/Indicator';
import oldPubArea from "../../images/TheGriffinInn_OldPubArea.png";
import restaurantArea from "../../images/Tap & Run_RestaurantArea.png";
import OutdoorTerraceRooms from "../../images/Tap & Run_OutdoorTerraceRooms.png";
import { updateSelectedPromotion, updateCurrentStep } from '../../store/bookingSlice';

export default function TopPickArea() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { bookingNumber } = location.state || {};

  // Get state from Redux
  const bookingState = useSelector((state) => state.booking);
  const {
    date,
    time,
    adults,
    children,
    returnBy,
    selectedPromotion,
    availablePromotionIds,
    pubType
  } = bookingState;

  // Local state
  const [promotions, setPromotions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const isFormValid = date && time && adults && selectedPromotion;

  useEffect(() => {
    let isMounted = true;
    let retryTimeout;

    const fetchPromotions = async () => {
      if (isMounted) {
        setIsLoading(true);
        setError(null);
      }

      if (!availablePromotionIds?.length) {
        console.log("No promotion IDs available, waiting for Redux update...");
        if (retryCount < 3) {
          if (isMounted) {
            setIsLoading(false);
            retryTimeout = setTimeout(() => {
              setRetryCount(prev => prev + 1);
            }, 1000);
          }
          return;
        }

        if (isMounted) {
          setError("Unable to load areas. Please try again.");
          setIsLoading(false);
        }
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        if (isMounted) {
          setError("Authentication token not found");
          setIsLoading(false);
        }
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      try {
        const queryString = availablePromotionIds
          .map(id => `promotionIds=${id}`)
          .join('&');

        const url = `/api/ConsumerApi/v1/Restaurant/${getCurrentRestaurant(pubType, window.location.pathname)}/Promotion?${queryString}`;
        console.log("Making TopPickArea API call to:", url);
        console.log("Current pathname:", window.location.pathname);
        console.log("Detected restaurant:", getCurrentRestaurant(pubType, window.location.pathname));

        const response = await getRequest(url, headers);
        console.log("Promotions response:", response.data);

        if (isMounted) {
          if (response.data && Array.isArray(response.data)) {
            setPromotions(response.data);
            setRetryCount(0);
          } else {
            setError("Invalid response format from server");
          }
        }
      } catch (error) {
        console.error("Failed to fetch promotions:", error);
        if (isMounted) {
          setError(error.message || "Failed to fetch promotions");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchPromotions();

    return () => {
      isMounted = false;
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, [availablePromotionIds, retryCount]);

  const handleNextClick = () => {
    if (!isFormValid) return;
    dispatch(updateCurrentStep(4));
    navigate("/TopConfirmed", {
      state: {
        date,
        time,
        adults,
        children,
        returnBy,
        bookingNumber,
        selectedPromotion
      }
    });
  };

  const togglePromotion = (promotion) => {
    if (!promotion) {
      dispatch(updateSelectedPromotion(null));
      return;
    }

    dispatch(updateSelectedPromotion(
      selectedPromotion?.Id === promotion.Id ? null : {
        Id: promotion.Id,
        Name: promotion.Name
      }
    ));
  };

  return (
    <div className={styles.AreaaMain} id="choose">
      <PubImageHeader
        pubLogo={logo}
        sectionImg={sectionimg2}
        pubLinkLabel="CHOOSE ANOTHER PUB"
        step={3}
        stepLength={4}
        pubLink="/Select"
      />

      <div className={styles.Ara_main} id="Area--main">
        <div className={`${styles.Data_type} ${styles.imgdata}`}>
          <img src={logo} alt="logo" />
        </div>
        <div className={styles.Area_type}>
          <h1 className={styles.logo_large}>Pick Your Area</h1>
        </div>
        <div className={styles.info_chip_container}>
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
            to="/TopEdit"
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
          <Indicator step={3}
            stepLength={4} />
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
