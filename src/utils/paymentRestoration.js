/**
 * Utility functions for restoring booking data after payment
 */

/**
 * Restore booking data from localStorage after payment redirect
 * @returns {Object|null} Restored booking data or null if none exists
 */
export const restoreBookingData = () => {
  try {
    const savedData = localStorage.getItem('pendingBookingData');
    if (savedData) {
      const bookingData = JSON.parse(savedData);
      console.log('✓ Restored booking data from localStorage:', bookingData);
      return bookingData;
    }
  } catch (error) {
    console.error('Error restoring booking data:', error);
  }
  return null;
};

/**
 * Check if drink payment was completed and get drink info
 * @returns {Object|null} { drinkName, drinkAmount } or null
 */
export const getDrinkPaymentInfo = () => {
  try {
    const drinkPurchased = localStorage.getItem('drinkPurchased');
    if (drinkPurchased === 'true') {
      const drinkName = localStorage.getItem('drinkName');
      const drinkAmount = localStorage.getItem('drinkAmount');
      
      if (drinkName && drinkAmount) {
        console.log('✓ Drink payment confirmed:', drinkName, drinkAmount);
        return {
          drinkName,
          drinkAmount: parseFloat(drinkAmount)
        };
      }
    }
  } catch (error) {
    console.error('Error getting drink payment info:', error);
  }
  return null;
};

/**
 * Build special requests text with drink info
 * @param {string} existingRequests - Existing special requests
 * @param {Object} drinkInfo - { drinkName, drinkAmount }
 * @param {number} children - Number of children
 * @returns {string} Combined special requests
 */
export const buildSpecialRequestsWithDrink = (existingRequests, drinkInfo, children = 0) => {
  if (!drinkInfo) return existingRequests;

  // Build drink info text
  const drinkText = `Pre-ordered: ${drinkInfo.drinkName} - £${drinkInfo.drinkAmount.toFixed(2)}`;

  // Handle children prefix if needed
  const childrenPrefix = children > 0 ? `Includes ${children} children` : '';

  let combinedRequests = '';

  if (childrenPrefix && existingRequests) {
    // Has children and existing requests
    // Remove old children prefix if it exists
    const cleanedRequests = existingRequests.replace(/^Includes \d+ children(?: - )?/, '');
    combinedRequests = `${childrenPrefix} - ${drinkText}${cleanedRequests ? ` - ${cleanedRequests}` : ''}`;
  } else if (childrenPrefix) {
    // Has children but no existing requests
    combinedRequests = `${childrenPrefix} - ${drinkText}`;
  } else if (existingRequests) {
    // No children but has existing requests
    // Check if drink info already exists in requests
    if (!existingRequests.includes('Pre-ordered:')) {
      combinedRequests = `${drinkText}\n${existingRequests}`;
    } else {
      combinedRequests = existingRequests;
    }
  } else {
    // No children and no existing requests
    combinedRequests = drinkText;
  }

  return combinedRequests;
};

/**
 * Clear drink payment flags from localStorage (keep booking data)
 */
export const clearDrinkPaymentFlags = () => {
  try {
    localStorage.removeItem('drinkPurchased');
    localStorage.removeItem('drinkName');
    localStorage.removeItem('drinkAmount');
    console.log('✓ Cleared drink payment flags');
  } catch (error) {
    console.error('Error clearing drink payment flags:', error);
  }
};

/**
 * Clear all booking and payment data from localStorage
 * Call this after successful booking submission
 */
export const clearAllBookingData = () => {
  try {
    localStorage.removeItem('pendingBookingData');
    localStorage.removeItem('bookingReference');
    localStorage.removeItem('awaitingPayment');
    localStorage.removeItem('drinkPurchased');
    localStorage.removeItem('drinkName');
    localStorage.removeItem('drinkAmount');
    console.log('✓ Cleared all booking data from localStorage');
  } catch (error) {
    console.error('Error clearing booking data:', error);
  }
};

/**
 * Complete restoration workflow for Details pages
 * Returns data to populate form fields
 * @param {Object} currentCustomerDetails - Current Redux customer details
 * @param {string} currentSpecialRequests - Current Redux special requests
 * @param {number} children - Number of children in booking
 * @returns {Object} { customerDetails, specialRequests, shouldUpdate }
 */
export const restoreBookingAfterPayment = (currentCustomerDetails, currentSpecialRequests, children = 0) => {
  // Check for restored booking data
  const restoredData = restoreBookingData();
  
  // Check for drink payment
  const drinkInfo = getDrinkPaymentInfo();

  let shouldUpdate = false;
  let customerDetails = currentCustomerDetails;
  let specialRequests = currentSpecialRequests;

  // Restore customer details if available
  if (restoredData) {
    customerDetails = {
      FirstName: restoredData.firstName || restoredData.name?.split(' ')[0] || '',
      Surname: restoredData.surname || restoredData.name?.split(' ').slice(1).join(' ') || '',
      Email: restoredData.email || '',
      Mobile: restoredData.phone || '',
      MobileCountryCode: restoredData.mobileCountryCode || '+44',
      Birthday: restoredData.birthday || '',
    };
    specialRequests = restoredData.specialRequests || '';
    shouldUpdate = true;
  }

  // Add drink info to special requests if payment was completed
  if (drinkInfo) {
    specialRequests = buildSpecialRequestsWithDrink(specialRequests, drinkInfo, children);
    clearDrinkPaymentFlags();
    shouldUpdate = true;
  }

  return {
    customerDetails,
    specialRequests,
    shouldUpdate,
    restoredData
  };
};


