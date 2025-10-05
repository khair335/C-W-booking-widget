# Form-Encoded Data Fix for BookingWithStripeToken 400 Error

## 🎯 Problem
The BookingWithStripeToken API was returning **400 Bad Request** in Vercel production because the axios interceptor was incorrectly trying to inject `RestaurantName` into form-encoded data.

## 🔍 Root Cause
The booking requests send data as **`application/x-www-form-urlencoded`** (a string), but the interceptor was treating it as a JSON object:

```javascript
// ❌ WRONG: Trying to set property on a string
config.data.RestaurantName = restaurantName; // config.data is a string like "VisitDate=2024-01-15&PartySize=4"

// ✅ CORRECT: Append to form-encoded string
config.data = `${config.data}&RestaurantName=${encodeURIComponent(restaurantName)}`;
```

## 🔧 The Fix
Updated the axios interceptor to properly handle **both data formats**:

### **Form-Encoded Data (String)**
```javascript
// Input: "VisitDate=2024-01-15&PartySize=4"
// Output: "VisitDate=2024-01-15&PartySize=4&RestaurantName=TheGriffinInn"
if (config.data && typeof config.data === 'string') {
  const separator = config.data.includes('=') ? '&' : '';
  config.data = `${config.data}${separator}RestaurantName=${encodeURIComponent(restaurantName)}`;
}
```

### **JSON Data (Object)**
```javascript
// Input: { VisitDate: "2024-01-15", PartySize: 4 }
// Output: { VisitDate: "2024-01-15", PartySize: 4, RestaurantName: "TheGriffinInn" }
else if (config.data && typeof config.data === 'object') {
  config.data.RestaurantName = restaurantName;
}
```

## 📋 Fixed Endpoints

### ✅ BookingWithStripeToken
- **Issue**: 400 Bad Request due to form-encoded data handling
- **Fix**: Properly append RestaurantName to form-encoded string
- **Used by**: Payment flow, booking creation

### ✅ AvailabilitySearch  
- **Fix**: Handle both JSON and form-encoded data
- **Used by**: Time slot fetching

### ✅ AvailabilityForDateRangeV2
- **Fix**: Handle both JSON and form-encoded data  
- **Used by**: Date range availability

## 🧪 Testing

### Before Fix (Broken)
```javascript
// Request body sent to /api/booking:
"VisitDate=2024-01-15&PartySize=4&PaymentMethodId=pm_123"

// Serverless function:
const restaurantName = req.body.RestaurantName || 'TheTapRun'; // ❌ undefined, defaults to TheTapRun

// Result: Booking created for wrong restaurant
```

### After Fix (Working)
```javascript
// Request body sent to /api/booking:
"VisitDate=2024-01-15&PartySize=4&PaymentMethodId=pm_123&RestaurantName=TheGriffinInn"

// Serverless function:
const restaurantName = req.body.RestaurantName || 'TheTapRun'; // ✅ "TheGriffinInn"

// Result: Booking created for correct restaurant
```

## 🚀 Deployment Steps

1. **Commit changes**:
   ```bash
   git add .
   git commit -m "Fix: Handle form-encoded data properly in axios interceptor for restaurant name injection"
   git push
   ```

2. **Deploy to Vercel**

3. **Test Griffin Inn booking flow**:
   - Complete booking: Griffin → Area → Details → Payment
   - Check browser console for transformation logs
   - Verify booking is created for TheGriffinInn

## 📊 Console Logs to Look For

In production, you should now see:

```javascript
// For form-encoded data (BookingWithStripeToken):
"Booking URL transformation: { 
  restaurantName: 'TheGriffinInn', 
  dataType: 'string', 
  dataLength: 150 
}"

// For JSON data (AvailabilitySearch):
"Availability URL transformation: { 
  restaurantName: 'TheGriffinInn', 
  dataType: 'object', 
  dataLength: 8 
}"
```

## 🎉 Expected Results

After deployment:
- ✅ **No more 400 Bad Request errors** for Griffin Inn bookings
- ✅ **BookingWithStripeToken works correctly** for both restaurants
- ✅ **All form-encoded requests** properly include RestaurantName
- ✅ **All JSON requests** properly include RestaurantName
- ✅ **Griffin Inn bookings** are created for the correct restaurant
- ✅ **Tap&Run bookings** continue to work as before

## 🔍 Debugging

If you still get 400 errors:

1. **Check browser console** for transformation logs
2. **Check request payload** in Network tab - should include `RestaurantName=TheGriffinInn`
3. **Check Vercel function logs** for "Using restaurant for booking: TheGriffinInn"
4. **Verify data type** - form-encoded should be string, JSON should be object

The Griffin Inn booking flow should now work perfectly! 🎉

