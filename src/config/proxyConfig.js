/**
 * Centralized Proxy Configuration for Fixie
 * This configuration handles proxy settings for different environments
 */

// Fixie proxy configuration
const FIXIE_CONFIG = {
  // Fixie proxy URL from your configuration
  proxyUrl: 'http://fixie:CLI4vlSvIq9h3ez@criterium.usefixie.com:80',
  
  // Target API base URL (ResDiary API)
  targetApiUrl: 'https://api.resdiary.com',
  
  // Environment-specific settings
  environments: {
    development: {
      useProxy: true,
      proxyType: 'fixie', // 'fixie' or 'default'
      baseURL: '', // Empty for relative URLs
      logRequests: true
    },
    production: {
      useProxy: false, // In production, use Vercel serverless functions
      proxyType: 'none',
      baseURL: '', // Empty for relative URLs to Vercel functions
      logRequests: false
    },
    test: {
      useProxy: true,
      proxyType: 'fixie',
      baseURL: '',
      logRequests: true
    }
  }
};

/**
 * Get the current environment configuration
 */
export const getEnvironmentConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  return FIXIE_CONFIG.environments[env] || FIXIE_CONFIG.environments.development;
};

/**
 * Check if we should use Fixie proxy for the current environment
 */
export const shouldUseFixieProxy = () => {
  const config = getEnvironmentConfig();
  return config.useProxy && config.proxyType === 'fixie';
};

/**
 * Get proxy configuration for axios
 */
export const getProxyConfig = () => {
  if (!shouldUseFixieProxy()) {
    return {};
  }

  return {
    proxy: {
      host: 'criterium.usefixie.com',
      port: 80,
      auth: {
        username: 'fixie',
        password: 'w3Z3TVYS77Lk7YV'
      },
      protocol: 'http'
    }
  };
};

/**
 * Get the base URL for API requests
 */
export const getBaseURL = () => {
  const config = getEnvironmentConfig();
  return config.baseURL;
};

/**
 * Check if requests should be logged
 */
export const shouldLogRequests = () => {
  const config = getEnvironmentConfig();
  return config.logRequests;
};

/**
 * Transform URL for proxy usage
 * In development with Fixie, we need to use the full ResDiary API URL
 * In production, we use relative URLs to Vercel functions
 */
export const transformUrlForEnvironment = (url) => {
  // In development, keep relative URLs so CRA setupProxy can forward via Fixie
  if (process.env.NODE_ENV === 'development') {
    return url;
  }

  // In other environments, leave as-is; production mapping is handled in AxiosRoutes
  return url;
};

/**
 * Get environment information for debugging
 */
export const getEnvironmentInfo = () => {
  const config = getEnvironmentConfig();
  return {
    environment: process.env.NODE_ENV,
    useProxy: config.useProxy,
    proxyType: config.proxyType,
    baseURL: config.baseURL,
    targetApiUrl: FIXIE_CONFIG.targetApiUrl,
    fixieProxyUrl: FIXIE_CONFIG.proxyUrl.replace(/\/\/.*@/, '//***:***@') // Hide credentials in logs
  };
};

export default FIXIE_CONFIG;
