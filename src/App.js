import React, { useEffect, useState } from 'react';
import { loginAndStoreToken } from './config/Auth/Login';
import { isTokenValid } from './config/Auth/ValidToken';
import Router from "./config/router";


function App() {
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    const checkAndLogin = async () => {
      if (isAuthenticating) return; // Prevent concurrent authentication attempts

      if (!isTokenValid()) {
        try {
          setIsAuthenticating(true);
          await loginAndStoreToken();
        } catch (error) {
          console.error('Initial authentication failed:', error);
          // Don't retry automatically - let the user refresh if needed
        } finally {
          setIsAuthenticating(false);
        }
      }
    };

    checkAndLogin();
  }, [isAuthenticating]);

  return (
    <div className="App">
      <Router />
    </div>
  );
}

export default App;
