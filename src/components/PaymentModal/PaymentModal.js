import React, { useState } from 'react';
import StripePaymentForm from '../StripePaymentForm/StripePaymentForm';
import CustomButton from '../ui/CustomButton/CustomButton';
import Toast from '../Toast/Toast';

const styles = {
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '30px',
    maxWidth: '500px',
    width: '90%',
    maxHeight: '80vh',
    overflowY: 'auto',
    position: 'relative',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '15px',
    borderBottom: '1px solid #eee',
  },
  modalTitle: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#666',
    padding: '5px',
    borderRadius: '50%',
    width: '35px',
    height: '35px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookingSummary: {
    backgroundColor: '#f8f9fa',
    padding: '15px',
    borderRadius: '6px',
    marginBottom: '20px',
  },
  summaryTitle: {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '10px',
    color: '#333',
  },
  summaryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '5px',
    fontSize: '14px',
  },
  summaryLabel: {
    color: '#666',
  },
  summaryValue: {
    fontWeight: '500',
    color: '#333',
  },
};

export default function PaymentModal({
  isOpen,
  onClose,
  bookingData,
  onSuccess,
  onError
}) {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [transactionId, setTransactionId] = useState('');

  if (!isOpen) return null;

  const handleClose = () => {
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Select Date";
    try {
      const [year, month, day] = dateString.split('-').map(Number);
      const dateObj = new Date(year, month - 1, day);
      return dateObj.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      return "Select Date";
    }
  };

  const handlePaymentSuccess = (responseData) => {
    // Extract transaction ID from response
    const txId = responseData.Booking?.Reference ||
                 responseData.paymentIntent?.id ||
                 responseData.transactionId ||
                 'N/A';

    setTransactionId(txId);
    setToastMessage('Card details held successfully! Your booking has been confirmed.');
    setShowToast(true);

    // Call the original success handler
    onSuccess(responseData);
  };

  const handlePaymentError = (error) => {
    setToastMessage(error || 'Failed to hold card details. Please try again.');
    setShowToast(true);
    onError(error);
  };

  const handleToastClose = () => {
    setShowToast(false);
  };

  return (
    <>
      <div style={styles.modalOverlay} onClick={handleBackdropClick}>
        <div style={styles.modalContent}>
          <div style={styles.modalHeader}>
            <h2 style={styles.modalTitle}>Hold Card Details</h2>
            <button
              style={styles.closeButton}
              onClick={handleClose}
              aria-label="Close modal"
            >
              ×
            </button>
          </div>

          <div style={styles.bookingSummary}>
            <h3 style={styles.summaryTitle}>Booking Summary</h3>
            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>Date:</span>
              <span style={styles.summaryValue}>{formatDate(bookingData.VisitDate)}</span>
            </div>
            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>Time:</span>
              <span style={styles.summaryValue}>{bookingData.VisitTime || "Select Time"}</span>
            </div>
            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>Party Size:</span>
              <span style={styles.summaryValue}>{bookingData.PartySize || "Select Party Size"}</span>
            </div>
            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>Area:</span>
              <span style={styles.summaryValue}>{bookingData.PromotionName || "Select Area"}</span>
            </div>
            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>Customer:</span>
              <span style={styles.summaryValue}>
                {bookingData.Customer?.FirstName} {bookingData.Customer?.Surname}
              </span>
            </div>
          </div>

          <div style={{
            backgroundColor: '#fff3cd',
            border: '1px solid #ffeaa7',
            borderRadius: '6px',
            padding: '15px',
            marginBottom: '20px',
            fontSize: '14px',
            color: '#856404'
          }}>
            <strong>Note:</strong> Your card details are securely held to confirm your booking. No payment will be taken unless you don't show up or cancel with less than 48 hours' notice.
          </div>

          <StripePaymentForm
            bookingData={bookingData}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <CustomButton
              label="Cancel"
              onClick={handleClose}
              color="#666"
              bgColor="#f8f9fa"
            />
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      <Toast
        isVisible={showToast}
        message={toastMessage}
        title={transactionId ? "Payment Successful!" : "Payment Status"}
        type={transactionId ? "success" : "error"}
        transactionId={transactionId}
        onClose={handleToastClose}
      />
    </>
  );
}