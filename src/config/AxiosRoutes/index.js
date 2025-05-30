import axios from "axios";

// Determine if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

// Create axios instance with default config
const axiosInstance = axios.create({
  // In development, use the proxy (which will be handled by the React dev server)
  // In production, use the Vercel serverless function
  baseURL: isDevelopment
    ? '' // Empty baseURL in development to use the proxy
    : '', // Empty baseURL in production to use relative paths for Vercel functions

  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    // Add CORS headers for all environments
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept'
  }
});

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
      if (isDevelopment) {
        console.log('Request interceptor added token:', token ? 'Yes' : 'No');
      }
    }

    // Transform URLs based on environment
    if (!isDevelopment) {
      // In production (Vercel), use the serverless function endpoints
      if (config.url.includes('/api/Jwt/v2/Authenticate')) {
        config.url = '/api/auth';
      } else if (config.url.includes('/api/ConsumerApi/v1/Restaurant/CatWicketsTest/AvailabilitySearch')) {
        config.url = '/api/availability';
      } else if (config.url.includes('/api/ConsumerApi/v1/Restaurant/CatWicketsTest/Promotion')) {
        const url = new URL(config.url, 'http://dummy');
        const promotionIds = url.searchParams.getAll('promotionIds');
        config.url = `/api/promotion${promotionIds.length > 0 ? `?promotionIds=${promotionIds.join('&promotionIds=')}` : ''}`;
      } else if (config.url.includes('/api/ConsumerApi/v1/Restaurant/CatWicketsTest/BookingWithStripeToken')) {
        config.url = '/api/booking';
      }
    }
    // In development, we don't need to transform URLs because the proxy in package.json handles it

    // Ensure headers are properly set for CORS
    config.headers['Access-Control-Allow-Origin'] = '*';
    config.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, PATCH, OPTIONS';
    config.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, Accept';

    // Log request details in development
    if (isDevelopment) {
      console.log('Making request:', {
        url: config.url,
        method: config.method,
        headers: {
          ...config.headers,
          Authorization: config.headers.Authorization ? 'Bearer [REDACTED]' : undefined
        }
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
    // Log successful response in development
    if (isDevelopment) {
      console.log('Response received:', {
        status: response.status,
        statusText: response.statusText,
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
