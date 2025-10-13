import { postRequest, getRequest } from '../config/AxiosRoutes/index';
import { getCurrentRestaurant } from '../utils/restaurantUtils';

/**
 * Cancels a booking with the given reference number
 * @param {string} bookingReference - The booking reference number to cancel
 * @param {string} pubType - The restaurant type ('top', 'griffin', or 'longHop')
 * @param {number} cancellationReasonId - The ID of the cancellation reason (defaults to 1)
 * @returns {Promise} - The API response
 * @throws {Error} - If the cancellation fails
 */
export const cancelBooking = async (bookingReference, pubType, cancellationReasonId = 1) => {
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
    micrositeName: getCurrentRestaurant(pubType, window.location.pathname),
    bookingReference: bookingReference,
    cancellationReasonId: parseInt(cancellationReasonId),
  };

  try {
    const restaurant = getCurrentRestaurant(pubType, window.location.pathname);
    console.log('cancelBooking - pubType:', pubType, 'restaurant:', restaurant);
    const response = await postRequest(
      `/api/ConsumerApi/v1/Restaurant/${restaurant}/Booking/${bookingReference}/Cancel`,
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
 * @param {string} pubType - The restaurant type ('top', 'griffin', or 'longHop')
 * @returns {Promise} - The transformed booking data matching booking state format
 * @throws {Error} - If the request fails
 */
export const getBooking = async (bookingReference, pubType) => {
  if (!bookingReference) {
    throw new Error('Booking reference is required');
  }

  try {
    const restaurant = getCurrentRestaurant(pubType, window.location.pathname);
    console.log('getBooking - pubType:', pubType, 'restaurant:', restaurant);
    const response = await getRequest(
      `/api/ConsumerApi/v1/Restaurant/${restaurant}/Booking/${bookingReference}`
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

/**
 * Gets availability for a date range
 * @param {string} dateFrom - Start date in ISO format
 * @param {string} dateTo - End date in ISO format
 * @param {number} partySize - Number of guests
 * @param {string} pubType - The restaurant type ('top', 'griffin', or 'longHop')
 * @param {string} availabilityType - Type of availability (defaults to "Reservation")
 * @returns {Promise} - The API response with available dates and times
 * @throws {Error} - If the request fails
 */
export const getAvailabilityForDateRange = async (dateFrom, dateTo, partySize, pubType, availabilityType = "Reservation") => {
  if (!dateFrom || !dateTo || !partySize) {
    throw new Error('DateFrom, DateTo, and PartySize are required');
  }

  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication token is required');
  }

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  try {
    const restaurantName = getCurrentRestaurant(pubType, window.location.pathname);
    console.log('getAvailabilityForDateRange - pubType:', pubType, 'restaurant:', restaurantName);
    
    const data = {
      DateFrom: dateFrom,
      DateTo: dateTo,
      PartySize: parseInt(partySize),
      AvailabilityType: availabilityType,
      RestaurantName: restaurantName
    };

    const response = await postRequest(
      `/api/ConsumerApi/v1/Restaurant/${restaurantName}/AvailabilityForDateRangeV2`,
      headers,
      data
    );
    return response.data;
  } catch (error) {
    console.error('Availability range fetch error:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch availability range. Please try again.');
  }
};