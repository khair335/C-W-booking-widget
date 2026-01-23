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

  console.log('🚀 PaymentSuccess component loaded');

  // Function to handle continue booking logic
  const handleContinueBooking = () => {
    console.log('🎯 Continue booking clicked');

    // Get booking data
    const bookingData = localStorage.getItem('pendingBookingData');
    console.log('📦 Booking data:', bookingData);

    let restaurant = 'unknown';
    if (bookingData) {
      const parsed = JSON.parse(bookingData);
      restaurant = (parsed.restaurant || parsed.pubType || '').toLowerCase();
    }

    // SIMPLIFIED APPROACH: Redirect the entire page
    // Instead of iframe communication, redirect to a success URL that Squarespace can handle

    console.log('🔄 Redirecting entire page to success URL');

    // Create success URL with booking data
    const baseUrl = document.referrer || window.location.origin;
    const successParams = new URLSearchParams({
      booking_success: 'true',
      restaurant: restaurant,
      drink_amount: drinkInfo?.amount || '0',
      drink_name: drinkInfo?.drink || 'Drink',
      session_id: searchParams.get('session_id') || 'unknown'
    });

    // Try to redirect to referrer with success params, fallback to current origin
    let redirectUrl;
    if (document.referrer && document.referrer.includes('http')) {
      // Strip any existing query params from referrer and add success params
      const referrerBase = document.referrer.split('?')[0];
      redirectUrl = `${referrerBase}?${successParams.toString()}`;
    } else {
      redirectUrl = `${window.location.origin}/booking-success?${successParams.toString()}`;
    }

    console.log('🚀 Redirecting to:', redirectUrl);
    window.top.location.href = redirectUrl;
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
          Continue with Booking
          <br /><small style={{fontSize: '10px', color: '#666'}}>
            Redirects to confirmation page
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
