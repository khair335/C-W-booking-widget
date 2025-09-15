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

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get the authorization token from the request
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'Authorization token is required' });
    }

    // Get promotion IDs from query parameters
    const promotionIds = req.query.promotionIds;
    if (!promotionIds) {
      return res.status(400).json({ message: 'Promotion IDs are required' });
    }

    // Build the URL with query parameters
    const queryString = Array.isArray(promotionIds)
      ? promotionIds.map(id => `promotionIds=${encodeURIComponent(id)}`).join('&')
      : `promotionIds=${encodeURIComponent(promotionIds)}`;

    const response = await axios.get(
      `https://api.resdiary.com/api/ConsumerApi/v1/Restaurant/TheTapRun/Promotion?${queryString}`,
      {
        headers: {
          'Accept': 'application/json',
          'Authorization': authHeader
        }
      }
    );

    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Promotion proxy error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      query: req.query
    });

    return res.status(error.response?.status || 500).json({
      message: error.response?.data?.message || 'Failed to fetch promotions'
    });
  }
};