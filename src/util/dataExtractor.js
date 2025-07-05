import { transitions } from "../transactions/transactionProcessPurchase";

export const getLabel = (categories, key) => {
  // Find the category that contains a subcategory with the matching key
  const foundCategory = categories.find(c =>
    c.subcategories.some(e => e.id === key)
  );

  // If foundCategory exists, find the subcategory with the matching key
  if (foundCategory) {
    const foundSubcategory = foundCategory.subcategories.find(e => e.id === key);

    return foundSubcategory ? foundSubcategory.name : key; // Return subcategory name or key if not found
  }

  return key; // Return key if no category or subcategory was found
};

export const formatLabel = (value) => {
  return !!value && value?.trim()
    ? value
      .toLowerCase()            // Convert all characters to lowercase
      .split('_')               // Split the string by underscores
      .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
      .join(' ')            // Join the words with spaces
    : ''
};

export const formatCardDuration = (duration) => {
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  const secs = Math.floor(duration % 60);

  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else if (minutes > 0) {
    return `${minutes}m`;
  } else if (secs > 0) {
    return `${secs}s`;
  } else {
    return "Calculating duration...";
  }
};


export const lastTransitions = [transitions.CONFIRM_PAYMENT, transitions.AUTO_COMPLETE, transitions.CREATE_PAYOUT, transitions.REVIEW_BY_CUSTOMER, transitions.EXPIRE_REVIEW_PERIOD, transitions.REFUND_REQUEST, transitions.REJECT_REFUND_REQUEST_BY_ADMIN, transitions.REVIEW_BY_CUSTOMER_AFTER_PAYOUT, transitions.CREATE_PAYOUT_AFTER_REVIEW];