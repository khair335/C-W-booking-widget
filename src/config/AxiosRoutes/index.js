import axios from "axios";
import { 
  getProxyConfig, 
  getBaseURL, 
  shouldLogRequests, 
  transformUrlForEnvironment,
  getEnvironmentInfo 
} from '../proxyConfig';

// Determine if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

// Get proxy configuration
const proxyConfig = getProxyConfig();
const baseURL = getBaseURL();
const shouldLog = shouldLogRequests();

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: baseURL,
  ...proxyConfig, // Include proxy configuration if needed
  
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    // Add CORS headers for all environments
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept'
  }
});

// Log environment info on initialization
if (shouldLog) {
  console.log('Axios Configuration:', getEnvironmentInfo());
}

// Add request interceptor to handle auth token and URL transformation
axiosInstance.interceptors.request.use(
  (config) => {
    // Add token if available
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token available in request interceptor');
      // Don't throw here, let the individual requests handle the error
    } else {
      config.headers.Authorization = `Bearer ${token}`;
      // Log in development
      if (shouldLog) {
        console.log('Request interceptor added token:', token ? 'Yes' : 'No');
      }
    }

    // Transform URLs based on environment using centralized configuration
    const originalUrl = config.url;
    
    // Log the original URL for debugging
    if (shouldLog || process.env.NODE_ENV === 'production') {
      console.log('Axios interceptor - Original URL:', originalUrl);
      console.log('Environment:', process.env.NODE_ENV);
    }
    
    if (isDevelopment) {
      // In development, transform URLs for Fixie proxy or direct API calls
      config.url = transformUrlForEnvironment(originalUrl);
    } else {
      // In production (Vercel), use the serverless function endpoints
      if (originalUrl.includes('/api/Jwt/v2/Authenticate')) {
        config.url = '/api/auth';
      } else if (originalUrl.includes('/api/ConsumerApi/v1/Restaurant/TheTapRun/AvailabilitySearch') || 
                 originalUrl.includes('/api/ConsumerApi/v1/Restaurant/TheGriffinInn/AvailabilitySearch')) {
        // Ensure serverless function receives the correct restaurant name
        const restaurantName = originalUrl.includes('TheTapRun') ? 'TheTapRun' : 'TheGriffinInn';
        config.url = '/api/availability';
        // Guard against non-object payloads
        if (config.data == null || typeof config.data !== 'object') {
          config.data = {};
        }
        // Inject RestaurantName so /api/availability does not default to TheTapRun
        config.data.RestaurantName = restaurantName;
        if (shouldLog || process.env.NODE_ENV === 'production') {
          console.log('Availability URL transformation:', {
            original: originalUrl,
            transformed: config.url,
            restaurantName,
            payloadKeys: Object.keys(config.data || {})
          });
        }
      } else if (originalUrl.includes('/api/ConsumerApi/v1/Restaurant/TheTapRun/AvailabilityForDateRangeV2') || 
                 originalUrl.includes('/api/ConsumerApi/v1/Restaurant/TheGriffinInn/AvailabilityForDateRangeV2')) {
        config.url = '/api/availability-range';
      } else if (originalUrl.includes('/api/ConsumerApi/v1/Restaurant/TheTapRun/Promotion') || 
                 originalUrl.includes('/api/ConsumerApi/v1/Restaurant/TheGriffinInn/Promotion')) {
        try {
          // Parse the URL - need to provide a base URL for relative paths
          const url = new URL(originalUrl, 'http://localhost');
          const promotionIds = url.searchParams.getAll('promotionIds');
          const restaurantName = originalUrl.includes('TheTapRun') ? 'TheTapRun' : 'TheGriffinInn';
          
          // Build the new URL with all promotion IDs
          if (promotionIds.length > 0) {
            const promotionParams = promotionIds.map(id => `promotionIds=${encodeURIComponent(id)}`).join('&');
            config.url = `/api/promotion?${promotionParams}&restaurantName=${restaurantName}`;
          } else {
            config.url = `/api/promotion?restaurantName=${restaurantName}`;
          }
          
          if (shouldLog || process.env.NODE_ENV === 'production') {
            console.log('Promotion URL transformation:', {
              original: originalUrl,
              transformed: config.url,
              promotionIds: promotionIds,
              restaurantName: restaurantName
            });
          }
        } catch (error) {
          console.error('Error parsing promotion URL:', error, 'Original URL:', originalUrl);
          config.url = originalUrl;
        }
      } else if (originalUrl.includes('/api/ConsumerApi/v1/Restaurant/TheTapRun/BookingWithStripeToken') || 
                 originalUrl.includes('/api/ConsumerApi/v1/Restaurant/TheGriffinInn/BookingWithStripeToken')) {
        config.url = '/api/booking';
      } else if (originalUrl.includes('/api/ConsumerApi/v1/Restaurant/TheTapRun/Booking/') || 
                 originalUrl.includes('/api/ConsumerApi/v1/Restaurant/TheGriffinInn/Booking/')) {
        // Extract the booking reference from the URL
        const bookingReference = originalUrl.split('/').pop();
        const restaurantName = originalUrl.includes('TheTapRun') ? 'TheTapRun' : 'TheGriffinInn';
        config.url = `/api/booking-details?bookingReference=${bookingReference}&restaurantName=${restaurantName}`;
      } else {
        // For other URLs in production, use as-is
        config.url = originalUrl;
      }
    }

    // Ensure headers are properly set for CORS
    config.headers['Access-Control-Allow-Origin'] = '*';
    config.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, PATCH, OPTIONS';
    config.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, Accept';

    // Log request details if logging is enabled
    if (shouldLog || process.env.NODE_ENV === 'production') {
      console.log('Making request:', {
        originalUrl: originalUrl,
        transformedUrl: config.url,
        method: config.method,
        environment: process.env.NODE_ENV,
        hasAuth: !!config.headers.Authorization
      });
    }

    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => {
    // Log successful response if logging is enabled
    if (shouldLog) {
      console.log('Response received:', {
        status: response.status,
        statusText: response.statusText,
        url: response.config?.url,
        environment: process.env.NODE_ENV,
        headers: response.headers,
        data: response.data
      });
    }
    return response;
  },
  async (error) => {
    // Log the full error for debugging
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: {
        ...error.config?.headers,
        Authorization: error.config?.headers?.Authorization ? 'Bearer [REDACTED]' : undefined
      }
    });

    if (error.response?.status === 401) {
      // Clear invalid token
      localStorage.removeItem('token');
      localStorage.removeItem('token_expiry');
      console.log('Cleared invalid token due to 401 response');
    }
    return Promise.reject(error);
  }
);

const loginRequest = async (path, data) => {
  try {
    const response = await axiosInstance.post(path, data);
    return response.data;
  } catch (error) {
    console.error('Login request failed:', error);
    throw error;
  }
};

const postRequest = async (path, headers, data) => {
  try {
    const response = await axiosInstance.post(path, data, { headers });
    return response;
  } catch (error) {
    console.error('POST request failed:', error);
    throw error;
  }
};

const getRequest = async (path, headers, params) => {
  try {
    const response = await axiosInstance.get(path, { headers, params });
    return response;
  } catch (error) {
    console.error('GET request failed:', error);
    throw error;
  }
};

const delRequest = async (path, headers, data) => {
  try {
    const response = await axiosInstance.delete(path, { headers, data });
    if (response.status === 200) {
      return "Record Deleted Successfully!";
    }
    throw new Error(`Error: ${response.statusText}`);
  } catch (error) {
    console.error('DELETE request failed:', error);
    throw error;
  }
};

const patchRequest = async (path, headers, data) => {
  try {
    const response = await axiosInstance.patch(path, data, { headers });
    return response;
  } catch (error) {
    console.error('PATCH request failed:', error);
    throw error;
  }
};

const putRequest = async (path, headers, data) => {
  try {
    const response = await axiosInstance.put(path, data, { headers });
    return response;
  } catch (error) {
    console.error('PUT request failed:', error);
    throw error;
  }
};

export {
  loginRequest,
  getRequest,
  postRequest,
  delRequest,
  patchRequest,
  putRequest,
};
