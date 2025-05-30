import { postRequest } from '../config/AxiosRoutes/index';

/**
 * Cancels a booking with the given reference number
 * @param {string} bookingReference - The booking reference number to cancel
 * @param {number} cancellationReasonId - The ID of the cancellation reason (defaults to 1)
 * @returns {Promise} - The API response
 * @throws {Error} - If the cancellation fails
 */
export const cancelBooking = async (bookingReference, cancellationReasonId = 1) => {
  if (!bookingReference) {
    throw new Error('Booking reference is required');
  }

  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication token is required');
  }

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const data = {
    micrositeName: "CatWicketsTest",
    bookingReference: bookingReference,
    cancellationReasonId: parseInt(cancellationReasonId),
  };

  try {
    const response = await postRequest(
      `/api/ConsumerApi/v1/Restaurant/CatWicketsTest/Booking/${bookingReference}/Cancel`,
      headers,
      data
    );
    return response.data;
  } catch (error) {
    console.error('Cancel booking error:', error);
    throw new Error(error.response?.data?.message || 'Failed to cancel the booking. Please try again.');
  }
};