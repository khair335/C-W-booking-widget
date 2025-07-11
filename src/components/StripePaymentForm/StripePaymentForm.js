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
    maxWidth: '400px',
    margin: '0 auto',
    padding: '20px',
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

export default function StripePaymentForm({ bookingData, onSuccess, onError }) {
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
      // Create payment method with Stripe
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement),
      });

      if (stripeError) {
        setError(stripeError.message);
        setIsProcessing(false);
        return;
      }

      // Call your external API with the payment method
      const token = localStorage.getItem('token');
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      };

      // Add payment method to booking data
      const submissionData = {
        ...bookingData,
        stripePaymentMethodId: paymentMethod.id,
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

      const encodedData = toUrlEncoded(submissionData);

      const response = await postRequest(
        '/api/ConsumerApi/v1/Restaurant/CatWicketsTest/BookingWithStripeToken',
        headers,
        encodedData
      );

      console.log('Payment Response:', response.data);

      if (response.data.Booking) {
        // Extract transaction ID from various possible locations in the response
        const transactionId = response.data.Booking.Reference ||
                            response.data.Booking.Id ||
                            response.data.paymentIntent?.id ||
                            response.data.transactionId ||
                            paymentMethod.id;

        // Create enhanced response with transaction ID
        const enhancedResponse = {
          ...response.data,
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
        label={isProcessing ? "Processing Payment..." : "Pay & Book Table"}
        onClick={handleSubmit}
        disabled={!stripe || isProcessing}
        type="submit"
      />
    </form>
  );
}