const axios = require('axios');

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
      return res.status(401).json({ message: 'Authorization token is required' });
    }

    const { VisitDate, ChannelCode, PartySize, RestaurantName } = req.body;
    if (!VisitDate || !ChannelCode || !PartySize) {
      return res.status(400).json({ message: 'VisitDate, ChannelCode, and PartySize are required' });
    }

    // Use the restaurant name from the request, or default to TheTapRun
    const restaurantName = RestaurantName || 'TheTapRun';
    console.log('Using restaurant for availability search:', restaurantName);

    const response = await axios.post(
      `https://api.resdiary.com/api/ConsumerApi/v1/Restaurant/${restaurantName}/AvailabilitySearch`,
      req.body,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': authHeader
        }
      }
    );

    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Availability search proxy error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    return res.status(error.response?.status || 500).json({
      message: error.response?.data?.message || 'Failed to fetch availability'
    });
  }
};