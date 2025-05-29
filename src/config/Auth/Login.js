import { loginRequest } from '../AxiosRoutes/index';

export const loginAndStoreToken = async () => {
  try {
    // Clear any existing tokens before attempting login
    localStorage.removeItem('token');
    localStorage.removeItem('token_expiry');

    const response = await loginRequest('/api/Jwt/v2/Authenticate', {
      username: process.env.REACT_APP_API_USERNAME || "cat.wickets+api@resdiary.com",
      password: process.env.REACT_APP_API_PASSWORD || "yZ/&J[!tGKIt[9Ke+[g/sfQ#3h|l8K"
    });

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
    console.error('Login failed:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      statusText: error.response?.statusText
    });

    // Clear any existing invalid tokens
    localStorage.removeItem('token');
    localStorage.removeItem('token_expiry');

    // Handle specific error cases
    if (error.response?.status === 400) {
      throw new Error('Invalid credentials. Please check your API username and password.');
    } else if (error.response?.status === 401) {
      throw new Error('Authentication failed. Please try again.');
    } else if (error.response?.status === 403) {
      throw new Error('Access denied. Please check your API permissions.');
    } else if (error.response?.status === 0) {
      throw new Error('Network error. Please check your internet connection.');
    } else {
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
