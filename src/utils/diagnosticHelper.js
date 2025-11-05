/**
 * Diagnostic helper to debug payment flow issues
 */

/**
 * Log all localStorage data
 */
export const logAllLocalStorage = () => {
  console.log('=== 📦 ALL LOCALSTORAGE DATA ===');
  
  if (localStorage.length === 0) {
    console.log('⚠️  localStorage is EMPTY');
    return;
  }

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const value = localStorage.getItem(key);
    
    try {
      // Try to parse as JSON
      const parsed = JSON.parse(value);
      console.log(`${key}:`, parsed);
    } catch {
      // Not JSON, just log the value
      console.log(`${key}:`, value);
    }
  }
  
  console.log('=== END ===');
};

/**
 * Check if payment data exists in localStorage
 */
export const checkPaymentData = () => {
  console.log('=== 🔍 PAYMENT DATA CHECK ===');
  
  const drinkPurchased = localStorage.getItem('drinkPurchased');
  const drinkName = localStorage.getItem('drinkName');
  const drinkAmount = localStorage.getItem('drinkAmount');
  const paymentSessionId = localStorage.getItem('paymentSessionId');
  
  const hasPaymentData = drinkPurchased === 'true' && drinkName && drinkAmount;
  
  console.log('Payment Data Status:', {
    drinkPurchased,
    drinkName,
    drinkAmount,
    paymentSessionId,
    hasPaymentData
  });
  
  if (!hasPaymentData) {
    console.log('❌ PROBLEM: Payment data is MISSING from localStorage');
    console.log('This means PaymentSuccess page did not store the data.');
    console.log('Possible reasons:');
    console.log('  1. PaymentSuccess page was not reached after Stripe payment');
    console.log('  2. Backend verification failed');
    console.log('  3. Stripe redirect URL is not configured correctly');
  } else {
    console.log('✅ Payment data exists in localStorage');
  }
  
  console.log('=== END ===');
  
  return hasPaymentData;
};

/**
 * Manually set test payment data (for testing restoration logic)
 */
export const setTestPaymentData = () => {
  console.log('🧪 Setting test payment data...');
  
  localStorage.setItem('drinkPurchased', 'true');
  localStorage.setItem('drinkName', 'CW-BOOKING Test Item');
  localStorage.setItem('drinkAmount', '10.50');
  localStorage.setItem('paymentSessionId', 'cs_test_MANUAL_TEST_123');
  
  console.log('✅ Test payment data set. Refresh page to see if restoration works.');
  console.log('If restoration works after refresh, the problem is with PaymentSuccess page not storing data.');
};

// Make available globally for easy console access
if (typeof window !== 'undefined') {
  window.diagnosticHelper = {
    logAllLocalStorage,
    checkPaymentData,
    setTestPaymentData
  };
}

