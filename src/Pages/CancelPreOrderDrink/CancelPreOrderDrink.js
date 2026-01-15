import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { putRequest } from "../../config/AxiosRoutes/index";
import { getCurrentRestaurant } from '../../utils/restaurantUtils';
import styles from "./CancelPreOrderDrink.module.css";
import CustomButton from '../../components/ui/CustomButton/CustomButton';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { updateSpecialRequests } from '../../store/bookingSlice';

export default function CancelPreOrderDrink() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [cancelStatus, setCancelStatus] = useState(null);
  const [error, setError] = useState('');
  const [drinkInfo, setDrinkInfo] = useState(null);

  const sessionId = searchParams.get('session_id');
  const source = searchParams.get('source');

  useEffect(() => {
    // Load drink information from localStorage if available
    const drinkName = localStorage.getItem('drinkName');
    const drinkAmount = localStorage.getItem('drinkAmount');
    const drinkPurchased = localStorage.getItem('drinkPurchased');

    if (drinkPurchased === 'true' && drinkName && drinkAmount) {
      setDrinkInfo({
        name: drinkName,
        amount: drinkAmount
      });
    }

    if (!sessionId) {
      setError('No session ID provided for drink cancellation');
    }
  }, [sessionId]);

  const handleCancelDrinkOrder = async () => {
    if (!sessionId) return;

    setIsLoading(true);
    setError('');

    try {
      console.log('Attempting to cancel drink order for session:', sessionId);

      // Call backend API to cancel the Stripe payment
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/cancel-payment?session_id=${sessionId}`);

      if (response.data && response.data.success) {
        setCancelStatus(response.data);
        console.log('Drink order cancelled successfully:', response.data);

        // Check if there's saved booking data before cancellation (from confirmed pages)
        const savedBookingData = localStorage.getItem('bookingDataBeforeCancel');
        if (savedBookingData && source) {
          console.log('Found saved booking data, updating SpecialRequests...');
          const bookingData = JSON.parse(savedBookingData);

          // Update SpecialRequests by removing the Pre-ordered part
          const updatedSpecialRequests = bookingData.specialRequests
            ? bookingData.specialRequests.split(' - Pre-ordered:')[0].trim()
            : '';

          // Automatically submit the updated booking
          await updateBookingAfterDrinkCancellation(bookingData, updatedSpecialRequests);

          // Update Redux state with cleaned SpecialRequests
          dispatch(updateSpecialRequests(updatedSpecialRequests));

          // Clear drink-related localStorage data
          localStorage.removeItem('drinkPurchased');
          localStorage.removeItem('drinkName');
          localStorage.removeItem('drinkAmount');
          localStorage.removeItem('paymentSessionId');
          localStorage.removeItem('pendingBookingData');
          localStorage.removeItem('bookingDataBeforeCancel');

          // Navigate back to the source page
          navigate(`/${source}`);
        } else {
          // Clear drink-related localStorage data
          localStorage.removeItem('drinkPurchased');
          localStorage.removeItem('drinkName');
          localStorage.removeItem('drinkAmount');
          localStorage.removeItem('paymentSessionId');
          localStorage.removeItem('pendingBookingData');

          // No saved booking data, redirect to select page
          navigate('/Select');
        }
      } else {
        throw new Error(response.data?.message || 'Failed to cancel drink order');
      }
    } catch (error) {
      console.error('Cancel drink order failed:', error);
      setError(error.response?.data?.message || error.message || 'Failed to cancel drink order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReturnToBooking = () => {
    navigate('/Select');
  };

  const handleReturnToDetails = () => {
    navigate('/Details');
  };

  const updateBookingAfterDrinkCancellation = async (bookingData, updatedSpecialRequests) => {
    try {
      console.log('Updating booking after drink cancellation...');

      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No auth token found for booking update');
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      };

      const toUrlEncoded = (obj, prefix) => {
        const str = [];
        for (const p in obj) {
          if (obj.hasOwnProperty(p)) {
            const key = prefix ? `${prefix}[${p}]` : p;
            const value = obj[p];
            if (value === null || value === undefined) {
              continue;
            }
            if (typeof value === 'object' && value !== null) {
              str.push(toUrlEncoded(value, key));
            } else {
              const stringValue = typeof value === 'boolean' ? value.toString() : value;
              str.push(encodeURIComponent(key) + '=' + encodeURIComponent(stringValue));
            }
          }
        }
        return str.join('&');
      };

      const bookingPayload = {
        VisitDate: bookingData.date,
        VisitTime: bookingData.time,
        PartySize: parseInt(bookingData.adults) + parseInt(bookingData.children || 0),
        PromotionId: bookingData.selectedPromotion?.Id || '',
        PromotionName: bookingData.selectedPromotion?.Name || '',
        Customer: {
          FirstName: bookingData.customerDetails.FirstName || '',
          Surname: bookingData.customerDetails.Surname || '',
          MobileCountryCode: bookingData.customerDetails.MobileCountryCode || '+44',
          Mobile: bookingData.customerDetails.Mobile || '',
          Email: bookingData.customerDetails.Email || '',
          ReceiveEmailMarketing: bookingData.customerDetails.ReceiveEmailMarketing || false,
          ReceiveSmsMarketing: bookingData.customerDetails.ReceiveSmsMarketing || false,
          ReceiveRestaurantEmailMarketing: bookingData.customerDetails.ReceiveRestaurantEmailMarketing || false,
          ReceiveRestaurantSmsMarketing: bookingData.customerDetails.ReceiveRestaurantSmsMarketing || false,
          Birthday: bookingData.customerDetails.Birthday || ''
        },
        SpecialRequests: updatedSpecialRequests,
        ChannelCode: 'ONLINE',
        IsLeaveTimeConfirmed: true
      };

      const encodedData = toUrlEncoded(bookingPayload);
      console.log('Updating booking with SpecialRequests:', updatedSpecialRequests);

      const restaurant = getCurrentRestaurant(bookingData.pubType, window.location.pathname);
      const response = await putRequest(
        `/api/ConsumerApi/v1/Restaurant/${restaurant}/Booking/${bookingData.successBookingData.reference}`,
        headers,
        encodedData
      );

      if (response.data) {
        console.log('Booking updated successfully after drink cancellation:', response.data);
      } else {
        console.error('Failed to update booking after drink cancellation');
      }
    } catch (error) {
      console.error('Error updating booking after drink cancellation:', error);
    }
  };

  if (!sessionId) {
    return (
      <div>
   
        <div className={styles.cancelContainer}>
          <div className={styles.cancelCard}>
            <h2 className={styles.title}>Invalid Request</h2>
            <div className={styles.errorIcon}>⚠️</div>
            <p className={styles.errorMessage}>No session ID provided for drink cancellation.</p>
            <div className={styles.buttonGroup}>
              <CustomButton
                label="Return to Booking"
                onClick={handleReturnToBooking}
                bgColor="#C39A7B"
                color="#fff"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div>
        {/* Simple Header */}
        

        <div className={styles.cancelContainer}>
          <div className={styles.cancelCard}>
            <h2 className={styles.title}>Cancelling Your Drink Order</h2>
            <div className={styles.loadingSpinner}></div>
            <p className={styles.message}>Please wait while we process your drink order cancellation...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
    

        <div className={styles.cancelContainer}>
          <div className={styles.cancelCard}>
            <h2 className={styles.title}>Cancellation Failed</h2>
            <div className={styles.errorIcon}>❌</div>
            <p className={styles.errorMessage}>{error}</p>
            <div className={styles.buttonGroup}>
              <CustomButton
                label="Try Again"
                onClick={handleCancelDrinkOrder}
                bgColor="#FD6F53"
                color="#fff"
              />
              <CustomButton
                label="Return to Details"
                onClick={handleReturnToDetails}
                bgColor="#C39A7B"
                color="#fff"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cancelStatus) {
    return (
      <div>
      

        <div className={styles.cancelContainer}>
          <div className={styles.cancelCard}>
            <h2 className={styles.title}>Drink Order Cancelled Successfully</h2>
            <div className={styles.successIcon}>✅</div>
            <div className={styles.cancelDetails}>
              <p className={styles.message}>
                {cancelStatus.type === 'refund'
                  ? 'Your drink payment has been refunded successfully.'
                  : 'Your drink order has been cancelled successfully.'
                }
              </p>
              {drinkInfo && (
                <div className={styles.drinkInfo}>
                  <h3>Cancelled Item:</h3>
                  <p><strong>{drinkInfo.name}</strong></p>
                  <p>Amount: £{parseFloat(drinkInfo.amount).toFixed(2)}</p>
                </div>
              )}
              {cancelStatus.refund && (
                <div className={styles.refundInfo}>
                  <p><strong>Refund ID:</strong> {cancelStatus.refund.id}</p>
                  <p><strong>Amount Refunded:</strong> £{(cancelStatus.refund.amount / 100).toFixed(2)}</p>
                </div>
              )}
              <p className={styles.note}>
                You will receive a confirmation email shortly. Your table booking remains active.
              </p>
            </div>
            <div className={styles.buttonGroup}>
              <CustomButton
                label="Return to Details"
                onClick={handleReturnToDetails}
                bgColor="#1C1C1C"
                color="#fff"
              />
              <CustomButton
                label="Make New Booking"
                onClick={handleReturnToBooking}
                bgColor="#C39A7B"
                color="#fff"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
    

      <div className={styles.cancelContainer}>
        <div className={styles.cancelCard}>
          <h2 className={styles.title}>Cancel Pre-Ordered Drink</h2>

          {drinkInfo && (
            <div className={styles.drinkInfo}>
              <h3>You are about to cancel:</h3>
              <p><strong>{drinkInfo.name}</strong></p>
              <p>Amount: £{parseFloat(drinkInfo.amount).toFixed(2)}</p>
            </div>
          )}

          <div className={styles.warningSection}>
            <div className={styles.warningIcon}>⚠️</div>
            <p className={styles.warningText}>
              <strong>Important:</strong> Cancelling your drink order will issue a refund, but your table booking will remain active.
              You can still proceed with your reservation without the pre-ordered drink.
            </p>
          </div>

          <div className={styles.buttonGroup}>
            <CustomButton
              label="Cancel Drink Order"
              onClick={handleCancelDrinkOrder}
              bgColor="#FD6F53"
              color="#fff"
            />
            <CustomButton
              label="Keep Drink Order"
              onClick={handleReturnToDetails}
              bgColor="#1C1C1C"
              color="#fff"
            />
          </div>
        </div>
      </div>
    </div>
  );
}