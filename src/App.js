import React, { useEffect, useState } from 'react';
import { loginAndStoreToken } from './config/Auth/Login';
import { isTokenValid } from './config/Auth/ValidToken';
import Router from "./config/router";

function App() {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const checkAndLogin = async () => {
      // Don't attempt to authenticate if we're already trying or if there's an error
      if (isAuthenticating || authError) return;

      if (!isTokenValid()) {
        try {
          setIsAuthenticating(true);
          setAuthError(null); // Clear any previous errors
          await loginAndStoreToken();
        } catch (error) {
          console.error('Initial authentication failed:', error);
          setAuthError(error.message);
          // Clear any existing invalid tokens
          localStorage.removeItem('token');
          localStorage.removeItem('token_expiry');
        } finally {
          setIsAuthenticating(false);
        }
      }
    };

    checkAndLogin();
  }, [isAuthenticating, authError]);

  // Add a retry button if authentication fails
  const handleRetry = () => {
    setAuthError(null);
  };

  return (
    <div className="App">
      {authError ? (
        <div style={{
          padding: '20px',
          textAlign: 'center',
          color: 'red'
        }}>
          <p>Authentication Error: {authError}</p>
          <button onClick={handleRetry}>Retry Authentication</button>
        </div>
      ) : (
        <Router />
      )}
    </div>
  );
}

export default App;
