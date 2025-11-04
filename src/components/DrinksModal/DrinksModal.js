import React from 'react';
import styles from './DrinksModal.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { updateSelectedDrink, updateSpecialRequests } from '../../store/bookingSlice';

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
  }
];

export default function DrinksModal({ isOpen, onClose, onContinue }) {
  const dispatch = useDispatch();
  const bookingState = useSelector((state) => state.booking);
  const { specialRequests, children } = bookingState;

  const handleDrinkSelection = (drink) => {
    // Store the selected drink
    dispatch(updateSelectedDrink(drink));

    // Update special requests with drink info
    const childrenPrefix = children > 0 ? `Includes ${children} children` : '';
    const drinkInfo = `Pre-ordered: ${drink.name} (${drink.price})`;
    
    let updatedRequests = '';
    if (childrenPrefix && specialRequests && specialRequests !== childrenPrefix) {
      // Has children and user has added additional requests
      const userRequests = specialRequests.replace(/^Includes \d+ children(?: - )?/, '');
      updatedRequests = `${childrenPrefix} - ${drinkInfo}${userRequests ? ` - ${userRequests}` : ''}`;
    } else if (childrenPrefix) {
      // Has children but no additional requests
      updatedRequests = `${childrenPrefix} - ${drinkInfo}`;
    } else if (specialRequests) {
      // No children but has special requests
      updatedRequests = `${drinkInfo} - ${specialRequests}`;
    } else {
      // No children and no special requests
      updatedRequests = drinkInfo;
    }

    dispatch(updateSpecialRequests(updatedRequests));

    // Open Stripe link in new tab
    window.open(drink.stripeLink, '_blank');

    // Continue to next page after a short delay
    setTimeout(() => {
      onContinue();
    }, 1000);
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
                PRE-ORDER NOW
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

