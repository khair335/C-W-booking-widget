import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Router from "./config/router";

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

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </div>
  );
}

export default App;
