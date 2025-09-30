const axios = require('axios');
const { getProxyAgent } = require('./_proxy');
const querystring = require('querystring');

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
      console.error('Missing authorization header');
      return res.status(401).json({ message: 'Authorization token is required' });
    }

    // Validate request body
    if (!req.body) {
      console.error('Missing request body');
      return res.status(400).json({ message: 'Request body is required' });
    }

    // Determine content type and prepare request data
    const contentType = req.headers['content-type'] || 'application/json';
    let requestData;
    let requestHeaders;

    if (contentType.includes('application/x-www-form-urlencoded')) {
      requestData = typeof req.body === 'string' ? req.body : querystring.stringify(req.body);
      requestHeaders = {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': authHeader
      };
    } else {
      requestData = req.body;
      requestHeaders = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': authHeader
      };
    }

    // Extract restaurant name from the request body or use default
    const restaurantName = req.body.RestaurantName || 'TheTapRun';
    console.log('Using restaurant for booking:', restaurantName);

    const response = await axios.post(
      `https://api.resdiary.com/api/ConsumerApi/v1/Restaurant/${restaurantName}/BookingWithStripeToken`,
      requestData,
      { headers: requestHeaders, httpsAgent: getProxyAgent() }
    );

    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Booking proxy error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });

    return res.status(error.response?.status || 500).json({
      message: error.response?.data?.message || 'Failed to process booking',
      details: error.response?.data || error.message,
      status: error.response?.status || 500
    });
  }
};