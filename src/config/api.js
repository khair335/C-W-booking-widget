// API Configuration
const API_CONFIG = {
  sandbox: {
    restaurantIds: {
      tapAndRun: 'CatWicketsTest',
      griffin: 'CatWicketsTest',
      longHop: 'CatWicketsTest'  // NEW - using same test ID for sandbox
    },
    promotionIds: {
      tapAndRun: ['2809', '2810'], // Temporary IDs, to be updated
      griffin: ['2809', '2810'],    // Temporary IDs, to be updated
      longHop: ['2809', '2810']     // NEW - using same test IDs for sandbox
    }
  },
  production: {
    restaurantIds: {
      tapAndRun: 'TheTapRun',
      griffin: 'TheGriffinInn',
      longHop: 'TheLongHop'  // NEW
    },
    promotionIds: {
      tapAndRun: [], // To be updated with production IDs
      griffin: [],    // To be updated with production IDs
      longHop: []     // NEW - to be updated with production IDs
    }
  }
};

// Current environment - change this to switch between sandbox and production
const CURRENT_ENV = 'production';

export const getApiConfig = () => {
  return API_CONFIG[CURRENT_ENV];
};

export const getRestaurantId = (pub) => {
  return getApiConfig().restaurantIds[pub];
};

export const getPromotionIds = (pub) => {
  return getApiConfig().promotionIds[pub];
};

// New function to get restaurant name dynamically
export const getRestaurantName = (pubType) => {
  if (pubType === 'top') {
    return getApiConfig().restaurantIds.tapAndRun;
  }
  if (pubType === 'longHop') {
    return getApiConfig().restaurantIds.longHop;
  }
  return getApiConfig().restaurantIds.griffin;
};

export const getHeaders = (token) => {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

// Helper function to build promotion URL with dynamic restaurant
export const buildPromotionUrl = (restaurantName, promotionIds = []) => {
  if (!restaurantName) {
    throw new Error('Restaurant name is required');
  }

  // Ensure promotionIds is an array and has values
  if (!Array.isArray(promotionIds) || promotionIds.length === 0) {
    console.warn(`No promotion IDs configured for ${restaurantName}`);
    return `/api/ConsumerApi/v1/Restaurant/${restaurantName}/Promotion`;
  }

  const promotionParams = promotionIds
    .filter(id => id) // Filter out any null/undefined values
    .map(id => `promotionIds=${encodeURIComponent(id)}`)
    .join('&');

  return `/api/ConsumerApi/v1/Restaurant/${restaurantName}/Promotion?${promotionParams}`;
};