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

  // Only allow GET, PUT, and POST requests
  if (req.method !== 'GET' && req.method !== 'PUT' && req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get the authorization token from the request
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'Authorization token is required' });
    }

    // Get the booking reference from the URL
    const bookingReference = req.query.bookingReference;
    if (!bookingReference) {
      return res.status(400).json({ message: 'Booking reference is required' });
    }

    let response;
    if (req.method === 'GET') {
      // Handle GET request
      response = await axios.get(
        `https://api.rdbranch.com/api/ConsumerApi/v1/Restaurant/CatWicketsTest/Booking/${bookingReference}`,
        {
          headers: {
            'Accept': 'application/json',
            'Authorization': authHeader
          }
        }
      );
    } else if (req.method === 'PUT') {
      // Handle PUT request
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

      response = await axios.put(
        `https://api.rdbranch.com/api/ConsumerApi/v1/Restaurant/CatWicketsTest/Booking/${bookingReference}`,
        requestData,
        { headers: requestHeaders }
      );
    } else if (req.method === 'POST' && bookingReference === 'Cancel') {
      // Handle cancellation request
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

      // Extract the actual booking reference from the request body
      const actualBookingReference = requestData.bookingReference || (typeof requestData === 'string' ? JSON.parse(requestData).bookingReference : null);
      if (!actualBookingReference) {
        return res.status(400).json({ message: 'Booking reference is required in request body' });
      }

      response = await axios.post(
        `https://api.rdbranch.com/api/ConsumerApi/v1/Restaurant/CatWicketsTest/Booking/${actualBookingReference}/Cancel`,
        requestData,
        { headers: requestHeaders }
      );
    } else {
      return res.status(400).json({ message: 'Invalid request' });
    }

    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Booking details proxy error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      method: req.method,
      body: req.body
    });

    return res.status(error.response?.status || 500).json({
      message: error.response?.data?.message ||
        (req.method === 'GET' ? 'Failed to fetch booking details' :
         req.method === 'PUT' ? 'Failed to update booking details' :
         'Failed to process booking cancellation'),
      details: error.response?.data || error.message,
      status: error.response?.status || 500
    });
  }
};