# Debugging Griffin Area Promotion API Issue

## Problem
When navigating from `/Griffin` to `/Area` on Vercel, the promotion API is not being called, but it works fine for Tap&Run (`/topandrun` → `/TopArea`).

## Changes Made
Added comprehensive logging to track URL transformations in the axios interceptor for production environment.

## What to Check in Vercel

### 1. Deploy and Test
After deploying these changes, navigate from `/Griffin` → `/Area` and open the browser console (F12).

### 2. Look for These Console Logs

You should see the following logs in order:

```
1. "Making Area API call to: /api/ConsumerApi/v1/Restaurant/TheGriffinInn/Promotion?promotionIds=251648&promotionIds=208169&promotionIds=208174"
2. "Current pathname: /Area"
3. "Detected restaurant: TheGriffinInn"
4. "Axios interceptor - Original URL: /api/ConsumerApi/v1/Restaurant/TheGriffinInn/Promotion?promotionIds=251648&promotionIds=208169&promotionIds=208174"
5. "Environment: production"
6. "Promotion URL transformation: { original: ..., transformed: ..., promotionIds: [...], restaurantName: TheGriffinInn }"
7. "Making request: { originalUrl: ..., transformedUrl: /api/promotion?..., method: GET, environment: production, hasAuth: true }"
```

### 3. Compare with Working Tap&Run Flow

Navigate from `/topandrun` → `/TopArea` and check the same logs. Compare:
- Are the logs appearing in the same order?
- Is the URL transformation happening correctly?
- Is the final transformed URL correct?

## Possible Issues to Check

### Issue 1: Redux State Not Persisting
**Symptom:** `availablePromotionIds` is empty or undefined when Area.js loads
**Check:** Look for this log: `"availablePromotionIds" []` or `undefined`
**Solution:** The Griffin page needs to dispatch the promotion IDs before navigating

### Issue 2: URL Not Matching Pattern
**Symptom:** No "Promotion URL transformation" log appears
**Check:** The original URL might not match the pattern in the interceptor
**Solution:** Verify the URL contains exactly `/api/ConsumerApi/v1/Restaurant/TheGriffinInn/Promotion`

### Issue 3: Environment Variable Issue
**Symptom:** Environment shows as "development" instead of "production"
**Check:** Look at the "Environment:" log
**Solution:** Ensure Vercel is building with NODE_ENV=production

### Issue 4: Request Not Reaching Interceptor
**Symptom:** No axios interceptor logs appear at all
**Check:** Area.js might not be making the API call
**Solution:** Check if `availablePromotionIds` has values when the useEffect runs

## Quick Comparison Checklist

| Item | Tap&Run (/TopArea) | Griffin (/Area) | Match? |
|------|-------------------|----------------|--------|
| Route path | `/TopArea` | `/Area` | |
| Redux pubType | `'top'` | `'griffin'` | |
| Detected restaurant | `TheTapRun` | `TheGriffinInn` | |
| availablePromotionIds | [array with IDs] | [array with IDs] | |
| API call made | ✓ | ? | |
| URL transformation | ✓ | ? | |
| Response received | ✓ | ? | |

## Next Steps

1. **Deploy** these changes to Vercel
2. **Test** both flows (Tap&Run and Griffin)
3. **Copy** the console logs from both flows
4. **Compare** the logs to identify where Griffin flow differs
5. **Share** the console logs if the issue persists

## Additional Debugging

If the promotion API still isn't being called, add this temporary code to Area.js (line 50):

```javascript
useEffect(() => {
  console.log('===== AREA.JS DEBUG =====');
  console.log('Component mounted');
  console.log('availablePromotionIds:', availablePromotionIds);
  console.log('pubType:', pubType);
  console.log('pathname:', window.location.pathname);
  console.log('========================');
  
  const fetchPromotions = async () => {
    // existing code...
  };
  
  fetchPromotions();
}, [availablePromotionIds]);
```

This will help identify if the component is receiving the correct data from Redux.
