import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const StripeContext = createContext();

export const useStripeContext = () => {
  const context = useContext(StripeContext);
  if (!context) {
    throw new Error('useStripeContext must be used within a StripeProvider');
  }
  return context;
};

export const StripeProvider = ({ children }) => {
  const [stripeInstance, setStripeInstance] = useState(null);
  const [stripeConfig, setStripeConfig] = useState({
    publishableKey: process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY,
    accountId: null
  });
  const [isLoading, setIsLoading] = useState(false);

  // Initialize Stripe with dynamic configuration
  const initializeStripe = async (publishableKey, accountId = null) => {
    if (!publishableKey) {
      console.error('Stripe publishable key is required');
      return null;
    }

    // If same configuration, return existing instance
    if (stripeInstance && 
        stripeConfig.publishableKey === publishableKey && 
        stripeConfig.accountId === accountId) {
      return stripeInstance;
    }

    setIsLoading(true);
    try {
      const stripe = await loadStripe(publishableKey, {
        stripeAccount: accountId
      });
      
      setStripeInstance(stripe);
      setStripeConfig({ publishableKey, accountId });
      
      return stripe;
    } catch (error) {
      console.error('Failed to initialize Stripe:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Update Stripe configuration from API response
  const updateStripeConfig = (bookingResponse) => {
    if (bookingResponse?.StripePublishableKey) {
      initializeStripe(
        bookingResponse.StripePublishableKey,
        bookingResponse.StripeAccountId
      );
    }
  };

  // Reset Stripe configuration
  const resetStripeConfig = () => {
    setStripeInstance(null);
    setStripeConfig({
      publishableKey: process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY,
      accountId: null
    });
  };

  const value = {
    stripeInstance,
    stripeConfig,
    isLoading,
    initializeStripe,
    updateStripeConfig,
    resetStripeConfig
  };

  return (
    <StripeContext.Provider value={value}>
      {children}
    </StripeContext.Provider>
  );
};

export default StripeContext;
