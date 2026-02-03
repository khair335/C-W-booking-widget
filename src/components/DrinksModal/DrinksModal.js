import React, { useState, useEffect } from 'react';
import styles from './DrinksModal.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { updateSelectedDrink } from '../../store/bookingSlice';
import { v4 as uuidv4 } from 'uuid';

const drinks = [
  {
    id: 1,
    name: 'Prosecco',
    price: '£36.00',
    stripeLink: 'https://book.stripe.com/9B6eVd5kOa6E3ty0Afg7e02'
  },
  {
    id: 2,
    name: 'Veuve Clicquot Champagne',
    price: '£79.00',
    stripeLink: 'https://book.stripe.com/dRm8wP8x0ceMe8c4Qvg7e03'
  },
  {
    id: 3,
    name: 'Chapel Down English Sparkling',
    price: '£55.00',
    stripeLink: 'https://buy.stripe.com/4gM00j5kO6Usfcg3Mrg7e04'
  },
  // {
  //   id: 4,
  //   name: 'Chapel Down Sparkling test',
  //   price: '£55.00',
  //   stripeLink: 'https://buy.stripe.com/test_bJe7sL28C1A84xC2Ing7e01'
  // },
  // {
  //   id: 4,
  //   name: 'CW-BOOKING Test Item',
  //   price: 'Test',
  //   stripeLink: 'https://buy.stripe.com/test_bJe3cu58Q5fz8iy5PBeQM00'
  // },
  // Local development test links (uncomment for testing)
  /*
  {
    id: 5,
    name: 'LOCAL TEST - Prosecco',
    price: '£36.00',
    stripeLink: 'https://buy.stripe.com/test_bJe7sL28C1A84xC2Ing7e01'
  }
  */
];

export default function DrinksModal({ isOpen, onClose, onContinue }) {
  const dispatch = useDispatch();
  const bookingState = useSelector((state) => state.booking);
  const { 
    specialRequests, 
    children,
    date,
    time,
    adults,
    returnBy,
    selectedPromotion,
    customerDetails,
    selectedPub,
    pubType
  } = bookingState;

  const [bookingReference, setBookingReference] = useState(null);

  // Generate booking reference when modal opens
  useEffect(() => {
    if (isOpen && !bookingReference) {
      const newBookingRef = uuidv4();
      setBookingReference(newBookingRef);
      console.log('Generated booking reference:', newBookingRef);
    }
  }, [isOpen, bookingReference]);

  const saveBookingDataToLocalStorage = (selectedDrink) => {
    // Prepare complete booking data
    const bookingData = {
      // Form data from Redux
      date,
      time,
      adults,
      children,
      returnBy,
      selectedArea: selectedPromotion?.Name || 'Main Area',
      PromotionId: selectedPromotion?.Id || null,
      PromotionName: selectedPromotion?.Name || null,
      selectedPromotion,
      
      // Customer details
      firstName: customerDetails.FirstName,
      surname: customerDetails.Surname,
      name: `${customerDetails.FirstName} ${customerDetails.Surname}`.trim(),
      email: customerDetails.Email,
      phone: customerDetails.Mobile,
      mobileCountryCode: customerDetails.MobileCountryCode,
      birthday: customerDetails.Birthday,
      
      // Special requests
      specialRequests,
      
      // Restaurant info
      restaurant: pubType || selectedPub || 'unknown',
      selectedPub,
      pubType,
      
      // Tracking data
      bookingReference,
      selectedDrink: selectedDrink.name,
      selectedDrinkPrice: selectedDrink.price,
      awaitingPayment: true,
      timestamp: Date.now()
    };

    console.log('Saving booking data to localStorage:', bookingData);

    // Save to localStorage
    try {
      localStorage.setItem('pendingBookingData', JSON.stringify(bookingData));
      localStorage.setItem('bookingReference', bookingReference);
      localStorage.setItem('awaitingPayment', 'true');
      console.log('✓ Booking data saved to localStorage');
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  const handleDrinkSelection = (drink) => {
    console.log('Drink selected:', drink.name);

    // 1. Store the selected drink in Redux
    dispatch(updateSelectedDrink(drink));

    // 2. Save ALL booking data to localStorage BEFORE redirecting
    saveBookingDataToLocalStorage(drink);

    // 3. Check if we're in an iframe and communicate with parent for breakout
    if (window.parent !== window) {
      console.log('📡 Running in iframe - requesting parent to handle Stripe redirect');
      // Send message to parent to handle iframe breakout
      window.parent.postMessage({
        type: 'IFRAME_REDIRECT',
        url: drink.stripeLink,
        drinkName: drink.name,
        drinkPrice: drink.price
      }, '*');
    } else {
      // Not in iframe - direct redirect
      console.log('🏠 Not in iframe - redirecting directly to Stripe');
      window.location.href = drink.stripeLink;
    }
  };

  const handleSkip = () => {
    onContinue();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>
        
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Pre-Order Drinks</h2>
          <p className={styles.modalSubtitle}>
            Would you like to pre-order a bottle for your table?
          </p>
        </div>

        <div className={styles.drinksContainer}>
          {drinks.map((drink) => (
            <div key={drink.id} className={styles.drinkCard}>
              <div className={styles.drinkInfo}>
                <span className={styles.drinkName}>{drink.name}</span>
                <span className={styles.drinkPrice}>{drink.price}</span>
              </div>
              <button
                className={styles.drinkButton}
                onClick={() => handleDrinkSelection(drink)}
              >
               
               ADD TO BOOKING
              </button>
            </div>
          ))}
        </div>

        <button
          className={styles.skipButton}
          onClick={handleSkip}
        >
          SKIP - CONTINUE WITHOUT DRINKS
        </button>
      </div>
    </div>
  );
}
