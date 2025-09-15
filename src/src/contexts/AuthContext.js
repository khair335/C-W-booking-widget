import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { loginAndStoreToken, isTokenValid } from '../config/Auth/Login';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(null);
  const initialAuthAttempted = useRef(false);

  const authenticate = async () => {
    // Prevent multiple simultaneous authentication attempts
    if (isAuthenticating) {
      console.log('Already authenticating, skipping...');
      return;
    }

    // If we're already authenticated with a valid token, don't re-authenticate
    if (isAuthenticated && token && isTokenValid()) {
      console.log('Already authenticated with valid token, skipping...');
      return;
    }

    console.log('Starting authentication process...', {
      isAuthenticating,
      isAuthenticated,
      hasToken: !!token,
      hasStoredToken: !!localStorage.getItem('token')
    });

    try {
      setIsAuthenticating(true);
      setAuthError(null);

      console.log('Calling loginAndStoreToken...');
      const newToken = await loginAndStoreToken();
      console.log('Login successful, token received:', newToken ? 'Yes' : 'No');

      // Verify token was stored
      const storedToken = localStorage.getItem('token');
      console.log('Token storage verification:', {
        stored: !!storedToken,
        length: storedToken?.length
      });

      if (!storedToken) {
        throw new Error('Token was not stored properly');
      }

      // Update both context state and local state
      setToken(storedToken);
      setIsAuthenticated(true);
      initialAuthAttempted.current = true;
      console.log('Authentication completed successfully');
    } catch (error) {
      console.error('Authentication failed:', {
        error: error.message,
        stack: error.stack
      });
      setAuthError(error.message);
      localStorage.removeItem('token');
      localStorage.removeItem('token_expiry');
      setToken(null);
      setIsAuthenticated(false);
    } finally {
      setIsAuthenticating(false);
      console.log('Authentication process finished', {
        isAuthenticated,
        hasToken: !!token,
        hasError: !!authError
      });
    }
  };

  // Initial authentication check - only runs once
  useEffect(() => {
    const checkInitialAuth = async () => {
      if (initialAuthAttempted.current) {
        console.log('Initial auth already attempted, skipping...');
        return;
      }

      console.log('Performing initial auth check...');
      const storedToken = localStorage.getItem('token');
      const isValid = isTokenValid();

      console.log('Initial auth state:', {
        hasStoredToken: !!storedToken,
        isValid,
        isAuthenticating,
        isAuthenticated
      });

      if (isValid && storedToken) {
        console.log('Valid token found, setting auth state');
        setToken(storedToken);
        setIsAuthenticated(true);
        initialAuthAttempted.current = true;
      } else {
        console.log('No valid token, starting authentication');
        setToken(null);
        setIsAuthenticated(false);
        await authenticate();
      }
    };

    checkInitialAuth();
  }, []); // Empty dependency array - only runs once on mount

  // Periodic token validation - only runs if we're authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkAuth = () => {
      console.log('Performing periodic auth check...');
      const storedToken = localStorage.getItem('token');
      const isValid = isTokenValid();

      console.log('Periodic auth check:', {
        hasStoredToken: !!storedToken,
        isValid,
        isAuthenticating,
        isAuthenticated
      });

      if (!isValid || !storedToken) {
        console.log('Token invalid or missing, clearing auth state');
        setToken(null);
        setIsAuthenticated(false);
        if (!isAuthenticating && !authError) {
          console.log('Starting re-authentication');
          authenticate();
        }
      }
    };

    // Set up interval for periodic checks
    const intervalId = setInterval(checkAuth, 60000); // Check every minute

    return () => {
      console.log('Cleaning up auth interval');
      clearInterval(intervalId);
    };
  }, [isAuthenticated, isAuthenticating, authError]);

  const retryAuth = () => {
    console.log('Manual retry of authentication requested');
    setAuthError(null);
    authenticate();
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticating,
      authError,
      isAuthenticated,
      token,
      authenticate,
      retryAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};