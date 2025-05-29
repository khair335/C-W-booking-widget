import { loginRequest } from '../AxiosRoutes/index';

export const loginAndStoreToken = async () => {
  try {
    // Clear any existing tokens before attempting login
    localStorage.removeItem('token');
    localStorage.removeItem('token_expiry');

    // Log the environment and credentials being used (remove in production)
    console.log('Login attempt:', {
      environment: process.env.NODE_ENV,
      baseUrl: process.env.REACT_APP_API_BASE_URL,
      username: process.env.REACT_APP_API_USERNAME ? '***' : 'using default',
      hasPassword: !!process.env.REACT_APP_API_PASSWORD
    });

    const credentials = {
      username: process.env.REACT_APP_API_USERNAME || "cat.wickets+api@resdiary.com",
      password: process.env.REACT_APP_API_PASSWORD || "yZ/&J[!tGKIt[9Ke+[g/sfQ#3h|l8K"
    };

    const response = await loginRequest('/api/Jwt/v2/Authenticate', credentials);

    if (!response?.Token) {
      console.error('Invalid login response:', response);
      throw new Error('Invalid login response: No token received');
    }

    const { Token, TokenExpiryUtc } = response;

    // Store token and expiry
    localStorage.setItem('token', Token);
    localStorage.setItem('token_expiry', TokenExpiryUtc);

    // Log successful login (remove in production)
    console.log('Successfully authenticated with ResDiary API');

    return Token;
  } catch (error) {
    // Enhanced error logging
    console.error('Login failed:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      statusText: error.response?.statusText,
      headers: error.response?.headers,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL,
        headers: error.config?.headers
      }
    });

    // Clear any existing invalid tokens
    localStorage.removeItem('token');
    localStorage.removeItem('token_expiry');

    // Handle specific error cases
    if (!error.response) {
      throw new Error('Network error. Please check your internet connection and try again.');
    }

    switch (error.response.status) {
      case 400:
        throw new Error('Invalid credentials. Please check your API username and password.');
      case 401:
        throw new Error('Authentication failed. Please try again.');
      case 403:
        throw new Error('Access denied. Please check your API permissions.');
      case 404:
        throw new Error('API endpoint not found. Please check the API configuration.');
      case 500:
        throw new Error('Server error. Please try again later.');
      default:
        throw new Error(error.response?.data?.message || 'Authentication failed. Please try again.');
    }
  }
};

export const isTokenValid = () => {
  try {
    const token = localStorage.getItem('token');
    const expiry = localStorage.getItem('token_expiry');

    if (!token || !expiry) {
      return false;
    }

    const now = new Date();
    const expiryDate = new Date(expiry);

    // Add 5-minute buffer to prevent edge cases
    const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
    if (now >= expiryDate - bufferTime) {
      // Clear expired token
      localStorage.removeItem('token');
      localStorage.removeItem('token_expiry');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error checking token validity:', error);
    return false;
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('token_expiry');
};
