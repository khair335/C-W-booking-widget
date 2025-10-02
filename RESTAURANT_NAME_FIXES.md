# Restaurant Name Injection Fixes for Vercel Production

## 🎯 Problem
Several API endpoints were defaulting to `TheTapRun` in production (Vercel) instead of using the correct restaurant name (`TheGriffinInn` vs `TheTapRun`), causing Griffin Inn bookings and other operations to fail.

## 🔍 Root Cause
The Vercel serverless functions have fallback defaults to `'TheTapRun'` when `RestaurantName` is not provided in the request body:

```javascript
// In serverless functions:
const restaurantName = req.body.RestaurantName || 'TheTapRun'; // ❌ Always defaults to TheTapRun
```

## ✅ Solution
Updated the axios interceptor to **inject the correct `RestaurantName`** into the request body before sending to serverless functions.

## 📋 Fixed Endpoints

### 1. ✅ AvailabilitySearch (Already Fixed)
- **Original URL**: `/api/ConsumerApi/v1/Restaurant/TheGriffinInn/AvailabilitySearch`
- **Vercel Function**: `/api/availability`
- **Fix**: Inject `RestaurantName: 'TheGriffinInn'` into POST body

### 2. ✅ AvailabilityForDateRangeV2 (Fixed)
- **Original URL**: `/api/ConsumerApi/v1/Restaurant/TheGriffinInn/AvailabilityForDateRangeV2`
- **Vercel Function**: `/api/availability-range`
- **Fix**: Inject `RestaurantName: 'TheGriffinInn'` into POST body

### 3. ✅ BookingWithStripeToken (Fixed)
- **Original URL**: `/api/ConsumerApi/v1/Restaurant/TheGriffinInn/BookingWithStripeToken`
- **Vercel Function**: `/api/booking`
- **Fix**: Inject `RestaurantName: 'TheGriffinInn'` into POST body

### 4. ✅ Promotion (Already Working)
- **Original URL**: `/api/ConsumerApi/v1/Restaurant/TheGriffinInn/Promotion?promotionIds=...`
- **Vercel Function**: `/api/promotion?promotionIds=...&restaurantName=TheGriffinInn`
- **Fix**: Pass `restaurantName` as query parameter

### 5. ✅ Booking Details (Already Working)
- **Original URL**: `/api/ConsumerApi/v1/Restaurant/TheGriffinInn/Booking/12345`
- **Vercel Function**: `/api/booking-details?bookingReference=12345&restaurantName=TheGriffinInn`
- **Fix**: Pass `restaurantName` as query parameter

## 🔧 Implementation Details

The axios interceptor now detects the restaurant from the original URL and injects it into the request:

```javascript
// Example for BookingWithStripeToken:
if (originalUrl.includes('/api/ConsumerApi/v1/Restaurant/TheGriffinInn/BookingWithStripeToken')) {
  const restaurantName = 'TheGriffinInn'; // Detected from URL
  config.url = '/api/booking';
  config.data.RestaurantName = restaurantName; // ✅ Injected into body
}
```

## 🧪 Testing Checklist

After deploying these changes, test the following Griffin Inn flows:

### ✅ Availability Search
- Navigate to `/Griffin`
- Select date, time, party size
- **Expected**: Should fetch availability for TheGriffinInn
- **Check**: Browser console should show `"Using restaurant: TheGriffinInn"`

### ✅ Promotion Fetch
- Navigate from `/Griffin` → `/Area`
- **Expected**: Should fetch promotions for TheGriffinInn areas
- **Check**: Should see promotion cards for Stables, New Bar, Old Pub areas

### ✅ Booking Creation
- Complete booking flow: Griffin → Area → Details → Payment
- **Expected**: Should create booking for TheGriffinInn
- **Check**: Booking confirmation should show correct restaurant

### ✅ Booking Management
- View/edit/cancel existing Griffin bookings
- **Expected**: Should work with TheGriffinInn bookings
- **Check**: Operations should target correct restaurant

## 📊 Before vs After

### Before (Broken)
```javascript
// Griffin request to booking endpoint:
POST /api/booking
Body: { stripeToken: "...", partySize: 4 }

// Serverless function defaults to TheTapRun:
const restaurantName = req.body.RestaurantName || 'TheTapRun'; // ❌ Wrong!
// Result: Booking created for TheTapRun instead of TheGriffinInn
```

### After (Fixed)
```javascript
// Griffin request to booking endpoint:
POST /api/booking
Body: { stripeToken: "...", partySize: 4, RestaurantName: "TheGriffinInn" }

// Serverless function uses correct restaurant:
const restaurantName = req.body.RestaurantName || 'TheTapRun'; // ✅ Correct!
// Result: Booking created for TheGriffinInn
```

## 🚀 Deployment Steps

1. **Commit changes**:
   ```bash
   git add .
   git commit -m "Fix: Inject RestaurantName for all Griffin Inn API calls in production"
   git push
   ```

2. **Deploy to Vercel** (auto-deploy if connected to GitHub)

3. **Test Griffin Inn flows**:
   - Complete booking process
   - Check browser console for correct restaurant names
   - Verify bookings are created for TheGriffinInn

## 🎉 Expected Results

After deployment:
- ✅ Griffin Inn availability search works correctly
- ✅ Griffin Inn promotion fetching works correctly  
- ✅ Griffin Inn booking creation works correctly
- ✅ Griffin Inn booking management works correctly
- ✅ All Griffin Inn operations use correct restaurant name
- ✅ Tap&Run operations continue to work as before

## 📝 Console Logs to Look For

In production, you should now see these logs for Griffin Inn operations:

```javascript
// Availability Search
"Availability URL transformation: { restaurantName: 'TheGriffinInn', ... }"

// Availability Range
"AvailabilityRange URL transformation: { restaurantName: 'TheGriffinInn', ... }"

// Booking
"Booking URL transformation: { restaurantName: 'TheGriffinInn', ... }"

// Promotion
"Promotion URL transformation: { restaurantName: 'TheGriffinInn', ... }"
```

## 🔍 Debugging

If Griffin Inn operations still fail:

1. **Check browser console** for transformation logs
2. **Check Vercel function logs** for "Using restaurant: TheGriffinInn"
3. **Verify request body** contains `RestaurantName: "TheGriffinInn"`
4. **Test with network tab** to see actual API calls

The Griffin Inn booking flow should now work perfectly in production! 🎉
