import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PaymentCancelled.css';

const PaymentCancelled = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // For payment cancelled page, we assume it's always in an iframe context
    // since this page is only loaded within iframes in the demo setup
    const isInIframe = true;
    console.log('🚫 PaymentCancelled loaded - Always treating as iframe mode');

    // Listen for simulation messages from parent (for testing)
    const handleSimulationMessage = (event) => {
      if (event.data && event.data.type === 'SIMULATE_PAYMENT_CANCELLED') {
        console.log('🧪 Received simulation message for payment cancelled');

        // Notify parent of cancellation
        window.parent.postMessage({
          type: 'PAYMENT_CANCELLED'
        }, '*');
      }
    };

    window.addEventListener('message', handleSimulationMessage);

    // Always notify parent for payment cancellations (iframe mode)
    if (!window.location.search.includes('session_id')) {
      // Only notify if not already handled by real payment flow
      console.log('📱 Payment cancelled in iframe - notifying parent');

      // Send message to parent page
      window.parent.postMessage({
        type: 'PAYMENT_CANCELLED'
      }, '*'); // Use '*' for demo - in production, specify exact origin
    }

    return () => {
      window.removeEventListener('message', handleSimulationMessage);
    };
  }, []);

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


