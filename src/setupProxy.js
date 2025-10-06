const { createProxyMiddleware } = require('http-proxy-middleware');

// For local development, use direct connection without Fixie proxy
// This avoids proxy authentication issues while keeping Vercel production working
module.exports = function(app) {
  console.log('Setting up local development proxy (direct connection to ResDiary API)');

  // Forward all ResDiary API paths directly (no Fixie proxy)
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://api.resdiary.com',
      changeOrigin: true,
      secure: true,
      logLevel: 'silent', // Reduce log noise
      onProxyReq: (proxyReq, req, res) => {
        // Only log in development if needed for debugging
        if (process.env.NODE_ENV === 'development' && process.env.DEBUG_PROXY) {
          console.log('Local proxy request:', req.method, req.url);
        }
      },
      onError: (err, req, res) => {
        console.error('Local proxy error for', req.url, ':', err.message);
        res.status(500).json({ error: 'Proxy error: ' + err.message });
      }
    })
  );
};


