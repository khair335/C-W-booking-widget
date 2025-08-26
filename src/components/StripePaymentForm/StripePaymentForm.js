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

export default function StripePaymentForm({ bookingData, bookingResponse, paymentStatus, onSuccess, onError }) {
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
      const submissionData2 = {
        ...bookingData,
        PaymentMethodId: paymentMethod.id,
        SetupIntentClientSecret: bookingResponse?.SetupIntentClientSecret,
        StripeAccountId: bookingResponse?.StripeAccountId,
        // Include Token/EditToken if present so backend can identify booking context
        Token: bookingResponse?.Booking?.Token || bookingResponse?.Token,
        EditToken: bookingResponse?.Booking?.EditToken || bookingResponse?.EditToken,
        // Backward compatibility: some backends expect this field name
        stripePaymentMethodId: paymentMethod.id,
      };
      const encodedData2 = toUrlEncoded(submissionData2);

      const response2 = await postRequest(
        '/api/ConsumerApi/v1/Restaurant/CatWicketsTest/BookingWithStripeToken',
        headers,
        encodedData2
      );

      console.log('Payment Response:', response2.data);

      if (response2.data.Booking) {
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
        setError('Payment failed. Please try again.');
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