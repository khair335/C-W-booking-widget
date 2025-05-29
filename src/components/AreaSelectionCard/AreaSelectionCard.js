import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './AreaSelectionCard.module.css';

const AreaSelectionCard = ({
  promotion,
  isSelected,
  onSelect,
  defaultImage,
  restaurantImage,
  tabImage,
  showInfoToggle = true,
  className,
}) => {
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const isRestaurant = promotion.Name.toLowerCase().includes("restaurant");

  const handleInfoClick = (e) => {
    e.stopPropagation();
    setIsInfoOpen(!isInfoOpen);
  };

  return (
    <div className={`${styles.areasection} ${className || ''}`} key={promotion.Id}>
      <div className={`${styles.area_1and2} ${isSelected ? styles.selected : ""}`}>
        <div className={styles.restArea}>
          <img
            src={restaurantImage}
            alt={promotion.Name}
            className={styles.Newbrimg}
          />
          <p className={styles.Areatextmain}>
            <h3>
              {promotion.Name.includes("(dog friendly)") ? (
                <>
                  {promotion.Name.split("(dog friendly)")[0].trim()}
                  <br />
                  <span className={styles.dogFriendly}>(dog friendly)</span>
                </>
              ) : (
                promotion.Name
              )}
            </h3>
            {promotion.Description && isRestaurant && showInfoToggle && (
              <Link
                className={`${styles.readinfo} ${isInfoOpen ? styles.open : ''}`}
                onClick={handleInfoClick}
              >
                {isInfoOpen ? "Hide Info" : "Read Info"}
                <img
                  src={tabImage}
                  alt="tab_img"
                />
              </Link>
            )}
          </p>
        </div>
        {promotion.Description && isRestaurant && (
          <div
            className={`${styles.readtext} ${isInfoOpen ? styles.open : ''}`}
            aria-hidden={!isInfoOpen}
          >
            {promotion.Description}
          </div>
        )}
        <button
          onClick={() => onSelect(promotion)}
          className={styles.selectbtn}
        >
          {isSelected ? "Selected" : "Select"}
        </button>
      </div>
    </div>
  );
};

export default AreaSelectionCard;