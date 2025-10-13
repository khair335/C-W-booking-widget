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
  const [imageError, setImageError] = useState(false);
  const isRestaurant = promotion.Name.toLowerCase().includes("restaurant");

  const handleInfoClick = (e) => {
    e.stopPropagation();
    setIsInfoOpen(!isInfoOpen);
  };

  const handleImageError = () => {
    console.log(`Image failed to load for promotion: ${promotion.Name}, URL: ${restaurantImage}`);
    setImageError(true);
  };

  // Use restaurantImage if available, otherwise use defaultImage, or show placeholder
  const imageSrc = restaurantImage || defaultImage;

  return (
    <div className={`${styles.areasection} ${className || ''}`} key={promotion.Id}>
      <div className={`${styles.area_1and2} ${isSelected ? styles.selected : ""}`}>
        <div className={styles.restArea}>
          {imageSrc && !imageError ? (
            <img
              src={imageSrc}
              alt={promotion.Name}
              className={styles.Newbrimg}
              onError={handleImageError}
            />
          ) : (
            <div className={styles.imagePlaceholder}>
              <span className={styles.placeholderText}>No Image</span>
            </div>
          )}
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
            {promotion.Description && showInfoToggle && (
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
        {promotion.Description  && (
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