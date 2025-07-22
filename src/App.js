import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Router from "./config/router";
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

function AppContent() {
  const { authError, retryAuth, isAuthenticated, isAuthenticating } = useAuth();

  if (authError) {
    return (
      <div style={{
        padding: '20px',
        textAlign: 'center',
        color: 'red'
      }}>
        <p>Authentication Error: {authError}</p>
        <button
          onClick={retryAuth}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Retry Authentication
        </button>
      </div>
    );
  }

  // if (!isAuthenticated && isAuthenticating) {
  //   return (
  //     <div style={{
  //       padding: '20px',
  //       textAlign: 'center'
  //     }}>
  //       <p>Authenticating...</p>
  //     </div>
  //   );
  // }

  return <Router />;
}

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe('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');

function App() {
  return (
    <div className="App">
      <Elements stripe={stripePromise}>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Elements>
    </div>
  );
}

export default App;