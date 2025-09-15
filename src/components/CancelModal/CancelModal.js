import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomButton from '../ui/CustomButton/CustomButton';

import styles from './CancelModal.module.css';
import { cancelBooking } from '../../services/bookingService';
import { useDispatch, useSelector } from 'react-redux';
import { resetBooking } from '../../store/bookingSlice';

const CancelModal = ({ refId, onClose }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  
  // Get pubType from Redux state
  const bookingState = useSelector((state) => state.booking);
  const { pubType } = bookingState;

  const handleCancel = async () => {
    if (!refId) {
      setError('Booking reference is missing');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await cancelBooking(refId, pubType);
      // Navigate to cancelled page after successful cancellation
      navigate('/');
      dispatch(resetBooking());
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <h2 className={styles.modalTitle}>Cancel Booking</h2>
        <p className={styles.modalText}>
          Are you sure you want to cancel your booking? This action cannot be undone.
          {refId && <br />}Reference: {refId}
        </p>
        {error && <p className={styles.errorText}>{error}</p>}
        <div className={styles.buttonContainer}>
          <CustomButton
            label="Keep Booking"
            onClick={onClose}
            className={styles.cancelButton}
            disabled={isLoading}
          />
          <CustomButton
            label={isLoading ? "Cancelling..." : "Cancel Booking"}
            onClick={handleCancel}
            className={styles.confirmButton}
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default CancelModal;