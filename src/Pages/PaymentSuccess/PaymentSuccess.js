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

  // For payment success page, we assume it's always in an iframe context
  // since this page is only loaded within iframes in the demo setup
  const isInIframe = true;
  console.log('🚀 PaymentSuccess component loaded - Always treating as iframe mode');

  // Function to handle continue booking logic (always iframe mode for payment success)
  const handleContinueBooking = () => {
    console.log('📱 PaymentSuccess: Always in iframe mode - notifying parent to continue booking');

    // Get booking data to determine which restaurant
    const bookingData = localStorage.getItem('pendingBookingData');
    console.log('📦 Booking data from localStorage:', bookingData);

    let restaurant = 'unknown';
    if (bookingData) {
      const parsed = JSON.parse(bookingData);
      restaurant = (parsed.restaurant || parsed.pubType || '').toLowerCase();
      console.log('🏠 Restaurant from localStorage:', parsed.restaurant || parsed.pubType, '-> normalized:', restaurant);
    }

    // Send message to parent page to continue the booking flow
    const messageData = {
      type: 'CONTINUE_BOOKING',
      restaurant: restaurant,
      drinkInfo: drinkInfo
    };
    console.log('📤 Sending message to parent:', messageData);

    try {
      window.parent.postMessage(messageData, '*'); // Use '*' for demo - in production, specify exact origin
      console.log('✅ Message sent successfully to parent');
    } catch (error) {
      console.error('❌ Failed to send message to parent:', error);
    }

    // Always block navigation in iframe mode
    console.log('🛑 Blocking navigation - parent handles continuation');
  };

  useEffect(() => {

    const verifyPayment = async () => {
      // 1. Get session_id from URL
      const sessionId = searchParams.get('session_id');

      if (!sessionId) {
        // Don't set error immediately - might be waiting for simulation
        setLoading(true);
        return;
      }

      try {
        console.log('Verifying payment session:', sessionId);

        // 2. Call backend to verify payment
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/verify-payment?session_id=${sessionId}`
        );

        console.log('Payment verification response:', response.data);

        if (response.data.success && response.data.paid) {
          // 3. Payment verified! Store drink info in localStorage
          console.log('💾 Storing drink info to localStorage:', {
            drinkName: response.data.drink,
            drinkAmount: response.data.amount,
            sessionId: response.data.session_id
          });

          localStorage.setItem('drinkPurchased', 'true');
          localStorage.setItem('drinkName', response.data.drink);
          localStorage.setItem('drinkAmount', response.data.amount.toString());
          // Store session_id for inclusion in Special Requests
          localStorage.setItem('paymentSessionId', sessionId);

          // Verify it was stored
          console.log('✅ Verified localStorage after storing:', {
            drinkPurchased: localStorage.getItem('drinkPurchased'),
            drinkName: localStorage.getItem('drinkName'),
            drinkAmount: localStorage.getItem('drinkAmount'),
            paymentSessionId: localStorage.getItem('paymentSessionId')
          });

          setDrinkInfo(response.data);

          // 4. Check if we're in an iframe and notify parent
          const isInIframe = window !== window.parent;
          if (isInIframe) {
            console.log('📱 Running in iframe - notifying parent of payment success');

            // Send message to parent page
            window.parent.postMessage({
              type: 'PAYMENT_SUCCESS',
              sessionId: sessionId,
              drinkInfo: response.data
            }, '*'); // Use '*' for demo - in production, specify exact origin
          }

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

  const handleContinue = (e) => {
    console.log('🎯 Continue button clicked - calling handleContinueBooking');
    e.preventDefault(); // Prevent any default behavior
    e.stopPropagation(); // Stop event bubbling

    // Always iframe mode for payment success page
    console.log('📱 PaymentSuccess: Always iframe mode - blocking navigation');
    handleContinueBooking();

    console.log('✅ handleContinue completed');
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
          Continue with Booking (Iframe Mode)
          <br /><small style={{fontSize: '10px', color: '#666'}}>
            Sends message to parent page
          </small>
        </button>

        <p className="note">
          Your drink details will be automatically added to your booking.
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccess;
