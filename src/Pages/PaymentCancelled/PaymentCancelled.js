import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PaymentCancelled.css';

const PaymentCancelled = () => {
  const navigate = useNavigate();

  const handleTryAgain = () => {
    // Get booking data to determine which restaurant
    const bookingData = localStorage.getItem('pendingBookingData');
    
    if (bookingData) {
      const parsed = JSON.parse(bookingData);
      const restaurant = parsed.restaurant;

      // Redirect back to appropriate Details page
      if (restaurant === 'griffin') {
        navigate('/griffin/details');
      } else if (restaurant === 'longhop') {
        navigate('/longhop/details');
      } else if (restaurant === 'tapandrun') {
        navigate('/tap-and-run/details');
      } else {
        navigate('/details');
      }
    } else {
      navigate('/');
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="payment-cancelled-container">
      <div className="payment-cancelled-card">
        <div className="warning-icon">⚠</div>
        <h2>Payment Cancelled</h2>
        <p className="message">
          Your payment was cancelled. Don't worry, no charges were made.
        </p>
        <p className="sub-message">
          You can continue with your booking without pre-ordering drinks, or try again if you'd like to add drinks to your reservation.
        </p>

        <div className="button-group">
          <button onClick={handleTryAgain} className="btn-primary">
            Continue Booking
          </button>
          <button onClick={handleGoHome} className="btn-secondary">
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancelled;


