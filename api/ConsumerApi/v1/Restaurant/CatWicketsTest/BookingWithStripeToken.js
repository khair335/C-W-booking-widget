const axios = require('axios');
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
    // Log incoming request details
    console.log('Incoming booking request:', {
      headers: req.headers,
      body: req.body,
      contentType: req.headers['content-type']
    });

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
      // If the body is already a string (urlencoded), use it directly
      requestData = typeof req.body === 'string' ? req.body : querystring.stringify(req.body);
      requestHeaders = {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': authHeader
      };
    } else {
      // For JSON or other content types
      requestData = req.body;
      requestHeaders = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': authHeader
      };
    }

    // Log the request we're about to make
    console.log('Making booking request to API:', {
      url: 'https://api.rdbranch.com/api/ConsumerApi/v1/Restaurant/CatWicketsTest/BookingWithStripeToken',
      headers: {
        ...requestHeaders,
        Authorization: 'Bearer [REDACTED]'
      },
      body: requestData
    });

    const response = await axios.post(
      'https://api.rdbranch.com/api/ConsumerApi/v1/Restaurant/CatWicketsTest/BookingWithStripeToken',
      requestData,
      { headers: requestHeaders }
    );

    // Log successful response
    console.log('Booking request successful:', {
      status: response.status,
      data: response.data
    });

    return res.status(200).json(response.data);
  } catch (error) {
    // Enhanced error logging
    console.error('Booking proxy error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      requestBody: req.body,
      requestHeaders: {
        ...req.headers,
        authorization: req.headers.authorization ? 'Bearer [REDACTED]' : undefined
      }
    });

    // Return more detailed error response
    return res.status(error.response?.status || 500).json({
      message: error.response?.data?.message || 'Failed to process booking',
      details: error.response?.data || error.message,
      status: error.response?.status || 500
    });
  }
};