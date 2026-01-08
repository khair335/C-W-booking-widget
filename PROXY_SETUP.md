# Fixie Proxy Configuration

This application now uses a centralized proxy configuration system that integrates with Fixie for development and testing environments.

## Configuration Files

### 1. `src/config/proxyConfig.js`
This is the main configuration file that manages proxy settings for different environments:

- **Development**: Uses Fixie proxy to route requests through `http://fixie:2pCgmoJRwa8erbn@criterium.usefixie.com:80`
- **Production**: Uses Vercel serverless functions (no proxy needed)
- **Test**: Uses Fixie proxy for testing

### 2. `src/config/AxiosRoutes/index.js`
Updated to use the centralized proxy configuration. All API calls now automatically use the appropriate proxy based on the environment.

## How It Works

### Development Environment
- All API calls are routed through the Fixie proxy
- URLs are transformed to use the full ResDiary API URL (`https://api.resdiary.com`)
- Requests include proper authentication headers
- Detailed logging is enabled for debugging

### Production Environment
- Uses Vercel serverless functions located in the `/api` directory
- No proxy configuration needed
- URLs are transformed to use relative paths to Vercel functions

## Environment Detection

The system automatically detects the environment using `process.env.NODE_ENV`:

```javascript
// Environment-specific behavior
const config = getEnvironmentConfig();
// Returns configuration based on NODE_ENV
```

## Usage

No changes needed in your existing code! All API calls using the axios instance will automatically use the correct proxy configuration.

### Example API Call
```javascript
import { getRequest } from '../config/AxiosRoutes/index';

// This will automatically use Fixie proxy in development
// and Vercel functions in production
const response = await getRequest('/api/ConsumerApi/v1/Restaurant/TheTapRun/AvailabilitySearch');
```

## Proxy Details

- **Proxy URL**: `http://fixie:2pCgmoJRwa8erbn@criterium.usefixie.com:80`
- **Outbound IPs**: 52.5.155.132, 52.87.82.133
- **Target API**: `https://api.resdiary.com`
- **Plan**: Tricycle (500 requests/month, 100MB data transfer)

## Testing the Configuration

You can test the proxy configuration by running:

```bash
# Start the development server
npm start

# Check the browser console for configuration logs
# You should see "Axios Configuration:" with environment details
```

## Troubleshooting

1. **Check Environment**: Ensure `NODE_ENV` is set correctly
2. **Verify Proxy**: Check that the Fixie proxy URL is accessible
3. **Check Logs**: Enable debug logging to see request/response details
4. **Network Issues**: Verify that your network allows proxy connections

## Security Notes

- Proxy credentials are embedded in the configuration (appropriate for client-side proxy usage)
- In production, no proxy is used (requests go through Vercel functions)
- All sensitive data is logged with `[REDACTED]` placeholders
