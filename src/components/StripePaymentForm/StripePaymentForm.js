import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { postRequest } from "../../config/AxiosRoutes/index";
import CustomButton from '../ui/CustomButton/CustomButton';

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#9e2146',
    },
  },
};

const styles = {
  paymentForm: {
    width: '100%',
  
  },
  cardElementContainer: {
    marginBottom: '20px',
  },
  cardLabel: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '500',
    color: '#333',
  },
  errorMessage: {
    color: '#dc3545',
    backgroundColor: '#f8d7da',
    border: '1px solid #f5c6cb',
    borderRadius: '4px',
    padding: '10px',
    marginBottom: '15px',
    fontSize: '14px',
  },
};

export default function StripePaymentForm({ bookingData, bookingResponse, paymentStatus, onSuccess, onError, restaurant = 'TheTapRun' }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      console.log('Stripe not loaded');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      };

      const toUrlEncoded = (obj, prefix) => {
        const str = [];
        for (const p in obj) {
          if (obj.hasOwnProperty(p)) {
            const key = prefix ? `${prefix}[${p}]` : p;
            const value = obj[p];
            if (typeof value === 'object' && value !== null) {
              str.push(toUrlEncoded(value, key));
            } else {
              str.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
            }
          }
        }
        return str.join('&');
      };

      // 1. Create payment method with Stripe
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement),
      });

      if (stripeError) {
        setError(stripeError.message);
        setIsProcessing(false);
        return;
      }

      // 2. Second API call WITH whole booking data + PaymentMethodId + SetupIntentClientSecret + StripeAccountId
      // For PaymentFailed retry: prefer Booking data from response to ensure format matches server
      const existingBooking = bookingResponse?.Booking;
      const isRetry = existingBooking && (paymentStatus === 'PaymentFailed' || paymentStatus === 'PaymentRequired' || paymentStatus === 'CreditCardRequired');
      const baseData = isRetry
        ? {
            VisitDate: existingBooking.VisitDate?.split('T')[0] || bookingData.VisitDate,
            VisitTime: existingBooking.VisitTime || bookingData.VisitTime,
            PartySize: existingBooking.PartySize ?? bookingData.PartySize,
            PromotionId: existingBooking.PromotionId ?? bookingData.PromotionId,
            PromotionName: existingBooking.PromotionName ?? bookingData.PromotionName,
            SpecialRequests: existingBooking.SpecialRequests ?? bookingData.SpecialRequests,
            Customer: existingBooking.Customer || bookingData.Customer,
            ChannelCode: existingBooking.ChannelCode || bookingData.ChannelCode,
            IsLeaveTimeConfirmed: existingBooking.IsLeaveTimeConfirmed ?? bookingData.IsLeaveTimeConfirmed,
          }
        : { ...bookingData };

      const submissionData2 = {
        ...baseData,
        PaymentMethodId: paymentMethod.id,
        SetupIntentClientSecret: bookingResponse?.SetupIntentClientSecret || undefined,
        StripeAccountId: bookingResponse?.StripeAccountId || undefined,
        // Include Token/EditToken for retry (PaymentFailed) - required for backend to identify existing booking
        Token: bookingResponse?.Booking?.Token || bookingResponse?.Token,
        EditToken: bookingResponse?.Booking?.EditToken || bookingResponse?.EditToken,
        stripePaymentMethodId: paymentMethod.id,
      };

      // Remove undefined/null values to avoid API issues
      Object.keys(submissionData2).forEach(key => {
        if (submissionData2[key] === undefined || submissionData2[key] === null) {
          delete submissionData2[key];
        }
      });

      const encodedData2 = toUrlEncoded(submissionData2);

      const response2 = await postRequest(
        `/api/ConsumerApi/v1/Restaurant/${restaurant}/BookingWithStripeToken`,
        headers,
        encodedData2
      );

      console.log('Payment Response:', response2.data);

      if (response2.data.Status === 'Success' && response2.data.Booking) {
        // Extract transaction ID from various possible locations in the response
        const transactionId = response2.data.Booking.Reference ||
                              response2.data.Booking.Id ||
                              response2.data.paymentIntent?.id ||
                              response2.data.transactionId ||
                              paymentMethod.id;

        // Create enhanced response with transaction ID
        const enhancedResponse = {
          ...response2.data,
          transactionId: transactionId,
          paymentMethodId: paymentMethod.id,
        };

        onSuccess(enhancedResponse);
      } else {
        const apiError = response2.data?.Errors?.[0] || response2.data?.message;
        const errorMsg = apiError || `Payment failed (${response2.data?.Status || 'Unknown'}). Please try again.`;
        setError(errorMsg);
        // Don't call onError - keep modal open so user can retry with different card
      }

    } catch (error) {
      console.error('Payment Failed:', error);
      setError('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.paymentForm}>
      <div style={styles.cardElementContainer}>
        <label style={styles.cardLabel}>Card Details</label>
        <CardElement options={CARD_ELEMENT_OPTIONS} />
      </div>

      {error && (
        <div style={styles.errorMessage}>
          {error}
        </div>
      )}

      <CustomButton
        label={isProcessing ? "Processing..." : "Hold Card Details & Book Table"}
        onClick={handleSubmit}
        disabled={!stripe || isProcessing}
        type="submit"
      />
    </form>
  );
}