import { postRequest, getRequest } from '../config/AxiosRoutes/index';

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

/**
 * Gets booking details for a given booking reference and transforms it to match booking state format
 * @param {string} bookingReference - The booking reference number
 * @returns {Promise} - The transformed booking data matching booking state format
 * @throws {Error} - If the request fails
 */
export const getBooking = async (bookingReference) => {
  if (!bookingReference) {
    throw new Error('Booking reference is required');
  }

  try {
    const response = await getRequest(
      `/api/ConsumerApi/v1/Restaurant/CatWicketsTest/Booking/${bookingReference}`
    );

    // Log the response to see what we're getting
    console.log("API Response in getBooking:", response);

    if (!response.data) {
      throw new Error('No data received from the API');
    }

    return response.data;
  } catch (error) {
    console.error('Get booking error:', error);
    throw new Error(
      error.response?.data?.message ||
      'Failed to get booking details. Please try again.'
    );
  }
};