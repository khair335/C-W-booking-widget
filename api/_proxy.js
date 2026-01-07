const { HttpsProxyAgent } = require('https-proxy-agent');

// Centralized Fixie proxy configuration for serverless functions
const FIXIE_PROXY_URL = process.env.FIXIE_URL || 'http://fixie:CLI4vlSvIq9h3ez@criterium.usefixie.com:80';

// Create and export an agent configured with Fixie proxy
function getProxyAgent() {
  try {
    if (!FIXIE_PROXY_URL) {
      return undefined;
    }
    const agent = new HttpsProxyAgent(FIXIE_PROXY_URL);
    return agent;
  } catch (err) {
    console.error('Failed to create proxy agent:', err?.message);
    return undefined;
  }
}

module.exports = {
  getProxyAgent,
};


