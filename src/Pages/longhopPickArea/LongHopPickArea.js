import React, { useState, useEffect } from "react";
import { getCurrentRestaurant } from '../../utils/restaurantUtils';
import { getRequest } from "../../config/AxiosRoutes/index"
import logo from "../../images/The Long Hop - text.png";
import sectionimage from "../../images/TheLongHop_MainiMAGE.jpg";
import dateicon from "../../images/Chips Icons Mobile.png";
import timeicon from "../../images/Chips Icons Mobile (1).png";
import membericon from "../../images/Chips Icons Mobile (3).png";
import reacticon from "../../images/Chips Icons Mobile (2).png";
import resturanticon from "../../images/table_restaurant.png";
import tabimg from "../../images/Menu Icon Mobile (1).png";
import { Link, useLocation, useNavigate } from "react-router-dom";
import styles from "./LongHopPickArea.module.css";
import PubImageHeaderLongHop from '../../components/PubImageHeaderLongHop/PubImageHeaderLongHop';
import InfoChip from '../../components/InfoChip/InfoChip';
import AreaSelectionCard from '../../components/AreaSelectionCard/AreaSelectionCard';
import Indicator from '../../components/Indicator/Indicator';
import CustomButton from '../../components/ui/CustomButton/CustomButton';
import { updateCurrentStep, updateSelectedPromotion } from '../../store/bookingSlice';
import { useDispatch, useSelector } from 'react-redux';

export default function LongHopPickArea() {
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
        console.log("Long Hop PickArea - No promotion IDs available, waiting for Redux update...");
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
        console.log("Making Long Hop PickArea API call to:", url);
        console.log("Current pathname:", window.location.pathname);
        console.log("Detected restaurant:", getCurrentRestaurant(pubType, window.location.pathname));

        const response = await getRequest(url, headers);
        console.log("Long Hop PickArea - Promotions response:", response.data);

        if (isMounted) {
          if (response.data && Array.isArray(response.data)) {
            setPromotions(response.data);
            setRetryCount(0);
          } else {
            setError("Invalid response format from server");
          }
        }
      } catch (error) {
        console.error("Long Hop PickArea - Failed to fetch promotions:", error);
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
  }, [availablePromotionIds, retryCount, pubType]);

  const handleNextClick = () => {
    if (!isFormValid) return;
    dispatch(updateCurrentStep(4));
    navigate("/longhopConfirmed", {
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
      <PubImageHeaderLongHop
        pubLogo={logo}
        sectionImg={sectionimage}
        pubLinkLabel="CHOOSE ANOTHER PUB"
        step={3}
        stepLength={4}
        pubLink="/select"
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
        </div>

        <div className={`${styles.Area_type} ${styles.DatabtnMain}`}>
          <CustomButton
            label="BACK"
            to="/longhopEdit"
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
          <Link to="/select" className="chose__another__link">
            CHOOSE ANOTHER PUB
          </Link>
          <Link to="/longhopHome" className="exist__link">
            Exit And Cancel Booking
          </Link>
        </div>
      </div>
    </div>
  );
}

