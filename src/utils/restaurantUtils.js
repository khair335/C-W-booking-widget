// Utility functions for restaurant selection

/**
 * Get the restaurant name based on the current route
 * @param {string} pathname - Current pathname from useLocation()
 * @returns {string} - Restaurant name ('TheTapRun', 'TheGriffinInn', or 'TheLongHop')
 */
export const getRestaurantFromRoute = (pathname) => {
  // Tap & Run routes (routes starting with /Top or /topandrun)
  if (pathname.startsWith('/topandrun') || pathname.startsWith('/Top')) {
    return 'TheTapRun';
  }
  
  // Long Hop routes (routes starting with /longhop)
  if (pathname.startsWith('/longhop')) {
    return 'TheLongHop';
  }
  
  // Griffin routes (all other routes)
  return 'TheGriffinInn';
};

/**
 * Get the restaurant name based on Redux state
 * @param {string} pubType - pubType from Redux state ('top', 'griffin', or 'longHop')
 * @returns {string} - Restaurant name ('TheTapRun', 'TheGriffinInn', or 'TheLongHop')
 */
export const getRestaurantFromState = (pubType) => {
  if (pubType === 'top') {
    return 'TheTapRun';
  }
  if (pubType === 'longHop') {
    return 'TheLongHop';
  }
  return 'TheGriffinInn';
};

/**
 * Get the restaurant name based on Redux state or fallback to route
 * @param {string} pubType - pubType from Redux state
 * @param {string} pathname - Current pathname from useLocation()
 * @returns {string} - Restaurant name ('TheTapRun', 'TheGriffinInn', or 'TheLongHop')
 */
export const getCurrentRestaurant = (pubType, pathname) => {
  // Prefer Redux state if available
  if (pubType) {
    return getRestaurantFromState(pubType);
  }
  
  // Fallback to route-based detection
  return getRestaurantFromRoute(pathname);
};

/**
 * Build API URL with dynamic restaurant
 * @param {string} restaurant - Restaurant name ('TheTapRun', 'TheGriffinInn', or 'TheLongHop')
 * @param {string} endpoint - API endpoint (e.g., 'AvailabilitySearch')
 * @param {string} params - Optional query parameters
 * @returns {string} - Complete API URL
 */
export const buildApiUrl = (restaurant, endpoint, params = '') => {
  const baseUrl = `/api/ConsumerApi/v1/Restaurant/${restaurant}/${endpoint}`;
  return params ? `${baseUrl}?${params}` : baseUrl;
};


