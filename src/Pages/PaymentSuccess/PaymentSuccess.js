import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import './PaymentSuccess.css';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [drinkInfo, setDrinkInfo] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      // 1. Get session_id from URL
      const sessionId = searchParams.get('session_id');

      if (!sessionId) {
        setError('No payment session found. Please try again.');
        setLoading(false);
        return;
      }

      try {
        console.log('Verifying payment session:', sessionId);

        // 2. Call backend to verify payment
        const response = await axios.get(
          `https://cw-backend-inky.vercel.app/api/verify-payment?session_id=${sessionId}`
        );

        console.log('Payment verification response:', response.data);

        if (response.data.success && response.data.paid) {
          // 3. Payment verified! Store drink info in localStorage
          localStorage.setItem('drinkPurchased', 'true');
          localStorage.setItem('drinkName', response.data.drink);
          localStorage.setItem('drinkAmount', response.data.amount.toString());

          setDrinkInfo(response.data);
          setLoading(false);
        } else {
          setError('Payment verification failed. Please contact support.');
          setLoading(false);
        }
      } catch (err) {
        console.error('Error verifying payment:', err);
        setError('Error verifying payment: ' + (err.response?.data?.error || err.message));
        setLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams]);

  const handleContinue = () => {
    // Get booking data to determine which restaurant
    const bookingData = localStorage.getItem('pendingBookingData');
    
    if (bookingData) {
      const parsed = JSON.parse(bookingData);
      const restaurant = parsed.restaurant || parsed.pubType;

      console.log('Restaurant/PubType from localStorage:', restaurant);

      // Redirect back to appropriate Details page based on restaurant
      if (restaurant === 'griffin') {
        navigate('/Details'); // Griffin uses /Details route
      } else if (restaurant === 'longhop') {
        navigate('/longhopdetails'); // Long Hop uses /longhopdetails route
      } else if (restaurant === 'top' || restaurant === 'tapandrun') {
        navigate('/TopDetails'); // Tap & Run uses /TopDetails route
      } else {
        // Fallback - try to guess from current data
        console.log('Unknown restaurant, using fallback /Details');
        navigate('/Details');
      }
    } else {
      // No booking data found, go to home
      console.log('No booking data found, going home');
      navigate('/');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="payment-success-container">
        <div className="payment-success-card">
          <div className="spinner"></div>
          <h2>Verifying Payment...</h2>
          <p>Please wait while we confirm your payment.</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="payment-success-container">
        <div className="payment-success-card error">
          <div className="error-icon">✗</div>
          <h2>Payment Verification Failed</h2>
          <p className="error-message">{error}</p>
          <div className="button-group">
            <button onClick={() => navigate('/')} className="btn-secondary">
              Go Home
            </button>
            <button onClick={() => window.location.reload()} className="btn-primary">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  return (
    <div className="payment-success-container">
      <div className="payment-success-card success">
        <div className="success-icon">✓</div>
        <h2>Payment Successful!</h2>
        <p className="success-message">
          Thank you for your payment. Your drink has been added to your booking.
        </p>
        
        {drinkInfo && (
          <div className="drink-info">
            <div className="drink-detail">
              <span className="label">Drink:</span>
              <span className="value">{drinkInfo.drink}</span>
            </div>
            <div className="drink-detail">
              <span className="label">Amount Paid:</span>
              <span className="value">£{drinkInfo.amount.toFixed(2)}</span>
            </div>
            {drinkInfo.customer_email && (
              <div className="drink-detail">
                <span className="label">Receipt sent to:</span>
                <span className="value">{drinkInfo.customer_email}</span>
              </div>
            )}
          </div>
        )}

        <button onClick={handleContinue} className="btn-continue">
          Continue with Booking
        </button>

        <p className="note">
          Your drink details will be automatically added to your booking.
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccess;
