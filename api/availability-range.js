const axios = require('axios');
const { getProxyAgent } = require('./_proxy');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get the authorization token from the request
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.log('No authorization header provided');
      return res.status(401).json({ message: 'Authorization token is required' });
    }

    // Extract restaurant name from the request body or use a default
    // The restaurant name should be passed in the request body
    const { DateFrom, DateTo, PartySize, AvailabilityType, RestaurantName } = req.body;
    console.log('Availability range request:', { DateFrom, DateTo, PartySize, AvailabilityType, RestaurantName });
    
    if (!DateFrom || !DateTo || !PartySize) {
      console.log('Missing required fields:', { DateFrom, DateTo, PartySize });
      return res.status(400).json({ message: 'DateFrom, DateTo, and PartySize are required' });
    }

    // Use the restaurant name from the request, or default to TheTapRun
    const restaurantName = RestaurantName || 'TheTapRun';
    console.log('Using restaurant:', restaurantName);

    const response = await axios.post(
      `https://api.resdiary.com/api/ConsumerApi/v1/Restaurant/${restaurantName}/AvailabilityForDateRangeV2`,
      req.body,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': authHeader
        },
        httpsAgent: getProxyAgent()
      }
    );

    console.log('Availability range API response:', {
      status: response.status,
      dataKeys: Object.keys(response.data || {}),
      hasTimeSlots: !!response.data?.TimeSlots
    });

    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Availability range search proxy error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    return res.status(error.response?.status || 500).json({
      message: error.response?.data?.message || 'Failed to fetch availability range'
    });
  }
}; 