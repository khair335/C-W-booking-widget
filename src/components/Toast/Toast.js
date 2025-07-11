import React, { useEffect } from 'react';

const styles = {
  toastContainer: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    zIndex: 9999,
    maxWidth: '400px',
  },
  toast: {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '16px 20px',
    borderRadius: '8px',
    marginBottom: '10px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    animation: 'slideIn 0.3s ease-out',
  },
  errorToast: {
    backgroundColor: '#f44336',
  },
  successIcon: {
    fontSize: '20px',
    marginRight: '10px',
  },
  toastContent: {
    flex: 1,
  },
  toastTitle: {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '4px',
  },
  toastMessage: {
    fontSize: '14px',
    opacity: 0.9,
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: 'white',
    fontSize: '18px',
    cursor: 'pointer',
    padding: '0',
    marginLeft: '10px',
    opacity: 0.7,
  },
  '@keyframes slideIn': {
    from: {
      transform: 'translateX(100%)',
      opacity: 0,
    },
    to: {
      transform: 'translateX(0)',
      opacity: 1,
    },
  },
};

export default function Toast({
  isVisible,
  message,
  title = 'Success!',
  type = 'success',
  transactionId = null,
  onClose
}) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000); // Auto close after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const toastStyle = {
    ...styles.toast,
    ...(type === 'error' ? styles.errorToast : {}),
  };

  return (
    <div style={styles.toastContainer}>
      <div style={toastStyle}>
        <div style={styles.toastContent}>
          <div style={styles.toastTitle}>{title}</div>
          <div style={styles.toastMessage}>
            {message}
            {transactionId && (
              <div style={{ marginTop: '8px', fontSize: '12px', opacity: 0.8 }}>
                Transaction ID: <strong>{transactionId}</strong>
              </div>
            )}
          </div>
        </div>
        <button
          style={styles.closeButton}
          onClick={onClose}
          aria-label="Close toast"
        >
          ×
        </button>
      </div>
    </div>
  );
}