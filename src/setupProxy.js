const { createProxyMiddleware } = require('http-proxy-middleware');
const { HttpsProxyAgent } = require('https-proxy-agent');

// Use FIXIE_URL from env if provided; fallback to the known value
const FIXIE_URL = process.env.FIXIE_URL || 'http://fixie:w3Z3TVYS77Lk7YV@criterium.usefixie.com:80';

module.exports = function(app) {
  const agent = new HttpsProxyAgent(FIXIE_URL);

  // Forward all ResDiary API paths through Fixie
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://api.resdiary.com',
      changeOrigin: true,
      secure: true,
      logLevel: 'silent',
      agent
    })
  );
};


