// API Configuration
const API_CONFIG = {
  sandbox: {
    restaurantIds: {
      tapAndRun: 'CatWicketsTest',
      griffin: 'CatWicketsTest'
    },
    promotionIds: {
      tapAndRun: ['2809', '2810'], // Temporary IDs, to be updated
      griffin: ['2809', '2810']    // Temporary IDs, to be updated
    }
  },
  production: {
    restaurantIds: {
      tapAndRun: '14603',
      griffin: '6857'
    },
    promotionIds: {
      tapAndRun: [], // To be updated with production IDs
      griffin: []    // To be updated with production IDs
    }
  }
};

// Current environment - change this to switch between sandbox and production
const CURRENT_ENV = 'sandbox';

export const getApiConfig = () => {
  return API_CONFIG[CURRENT_ENV];
};

export const getRestaurantId = (pub) => {
  return getApiConfig().restaurantIds[pub];
};

export const getPromotionIds = (pub) => {
  return getApiConfig().promotionIds[pub];
};

export const getHeaders = () => {
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
};

// Helper function to build promotion URL
export const buildPromotionUrl = (pub) => {
  const restaurantId = getRestaurantId(pub);
  const promotionIds = getPromotionIds(pub);
  
  if (!restaurantId) {
    throw new Error(`Invalid restaurant ID for ${pub}`);
  }
  
  // Ensure promotionIds is an array and has values
  if (!Array.isArray(promotionIds) || promotionIds.length === 0) {
    console.warn(`No promotion IDs configured for ${pub}`);
    return `/api/ConsumerApi/v1/Restaurant/${restaurantId}/Promotion`;
  }
  
  const promotionParams = promotionIds
    .filter(id => id) // Filter out any null/undefined values
    .map(id => `promotionIds=${encodeURIComponent(id)}`)
    .join('&');
    
  return `/api/ConsumerApi/v1/Restaurant/${restaurantId}/Promotion?${promotionParams}`;
}; 