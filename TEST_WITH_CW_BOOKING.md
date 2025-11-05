# 🧪 Testing with CW-BOOKING Test Item

## Test Payment Link
**CW-BOOKING Test Item**  
URL: `https://buy.stripe.com/test_bJe3cu58Q5fz8iy5PBeQM00`

This test link has been added to the DrinksModal as the 4th drink option.

---

## ⚙️ Step 1: Configure This Link in Stripe Dashboard

### 1. Go to Stripe Dashboard
- Visit: https://dashboard.stripe.com/
- Make sure you're in **Test Mode** (toggle in top right)

### 2. Find the Payment Link
- Go to **Products** → **Payment Links**
- Find the payment link with this ID: `test_bJe3cu58Q5fz8iy5PBeQM00`
- Or search for "CW-BOOKING"

### 3. Edit the Payment Link
Click **"Edit"** or **"Settings"** on the payment link

### 4. Configure After Payment URLs

**Success URL:**
```
http://localhost:3000/payment-success?session_id={CHECKOUT_SESSION_ID}
```

**Cancel URL:**
```
http://localhost:3000/payment-cancelled
```

⚠️ **Important**: 
- Copy these URLs exactly as shown
- Don't forget `{CHECKOUT_SESSION_ID}` - Stripe will replace this automatically
- Save the changes

---

## 🚀 Step 2: Start the Servers

### Terminal 1 - Backend Server
```bash
cd backend
npm run dev
```

Expected output:
```
🚀 Payment Verification Server Started
📡 Server running on: http://localhost:5000
💳 Stripe: Configured ✓
```

### Terminal 2 - Frontend
```bash
# From project root
npm start
```

---

## 🧪 Step 3: Test the Complete Flow

### 1. Navigate to Booking
- Go to: http://localhost:3000/
- Choose any restaurant (Griffin, Long Hop, or Tap & Run)

### 2. Fill Booking Details
- **Date**: Any future date
- **Time**: Any available time
- **Party Size**: Any number
- **Select Area**: Choose any available area

### 3. Enter Your Details
- **Name**: Test User
- **Email**: test@example.com
- **Phone**: 1234567890
- **Special Requests**: "Window seat, please"

### 4. Open Drinks Modal
- Click **"Next"** button
- DrinksModal should open showing 4 drink options

### 5. Select Test Item
- Click on **"CW-BOOKING Test Item"** (the 4th option)
- You'll be redirected to Stripe payment page

### 6. Complete Payment
Use Stripe test card:
- **Card Number**: `4242 4242 4242 4242`
- **Expiry**: Any future date (e.g., 12/25)
- **CVV**: Any 3 digits (e.g., 123)
- **ZIP**: Any 5 digits (e.g., 12345)

Click **"Pay"**

### 7. Verify Payment Success Page
After payment, you should see:
- ✓ Payment successful message
- ✓ Drink name: "CW-BOOKING Test Item"
- ✓ Amount paid (from Stripe)
- ✓ "Continue with Booking" button

### 8. Check Backend Logs
In your backend terminal, you should see:
```
Verifying payment for session: cs_test_...
Session retrieved: { id: '...', payment_status: 'paid', status: 'complete' }
✓ Payment verification successful
```

### 9. Return to Booking
- Click **"Continue with Booking"**
- You should return to the Details page

### 10. Verify Data Restoration
Check that ALL data is restored:
- ✅ Name: "Test User"
- ✅ Email: "test@example.com"
- ✅ Phone: "1234567890"
- ✅ Date, Time, Party Size: All preserved
- ✅ Special Requests includes:
  ```
  Window seat, please
  Pre-ordered: CW-BOOKING Test Item - £XX.XX
  ```

### 11. Complete the Booking
- Review all details
- Click final submit button
- Complete your test booking!

---

## 🔍 What to Check in Browser DevTools

### Before Payment (After clicking drink):
Open DevTools (F12) → Application → Local Storage → `http://localhost:3000`

Should see:
```
pendingBookingData: {"name":"Test User","email":"test@example.com",...}
bookingReference: "uuid-string"
awaitingPayment: "true"
```

### After Payment (On payment success page):
```
drinkPurchased: "true"
drinkName: "CW-BOOKING Test Item"
drinkAmount: "10.00" (or whatever the actual amount is)
```

### After Returning to Details:
- `drinkPurchased`, `drinkName`, `drinkAmount` should be cleared
- `pendingBookingData` should still exist until final booking

---

## 🧪 Additional Test Scenarios

### Test 1: Cancel Payment
1. Follow steps 1-5 above
2. On Stripe payment page, click **browser back button**
3. Manually go to: `http://localhost:3000/payment-cancelled`
4. Should see cancellation message
5. Click "Continue Booking" to return to Details page
6. Data should still be preserved (without drink)

### Test 2: Invalid Session ID
1. Manually navigate to: `http://localhost:3000/payment-success?session_id=invalid123`
2. Should see error: "Payment verification failed"
3. Backend logs should show: "Invalid session ID"

### Test 3: Multiple Bookings
1. Complete full booking with test item
2. Start a new booking
3. Verify localStorage is clean
4. Complete another booking to ensure no conflicts

### Test 4: Different Restaurants
Test the flow with all 3 restaurants:
- **Griffin** (`/griffin` → Details page)
- **Long Hop** (`/longhop` → longhopDetails page)
- **Tap & Run** (`/topandrun` → TopDetails page)

All should work identically.

---

## 📊 Expected Results

| Step | Expected Result |
|------|-----------------|
| Click test item | Redirects to Stripe payment page |
| Complete payment | Redirects to `/payment-success` |
| Success page loads | Shows "Verifying payment..." spinner |
| Verification complete | Shows success message with drink details |
| Click continue | Returns to Details page |
| Check form | All fields restored + drink in Special Requests |
| Submit booking | Booking completes with drink info included |
| After booking | localStorage cleared |

---

## 🐛 Troubleshooting

### "No payment session found"
**Problem**: Success URL doesn't include session_id

**Fix**: 
1. Go to Stripe Dashboard
2. Edit the CW-BOOKING payment link
3. Make sure Success URL is: `http://localhost:3000/payment-success?session_id={CHECKOUT_SESSION_ID}`
4. Save and try again

---

### "Invalid session ID"
**Problem**: Backend can't verify with Stripe

**Fix**:
1. Check backend `.env` has correct `STRIPE_SECRET_KEY`
2. Make sure it starts with `sk_test_`
3. Restart backend server: `npm run dev`

---

### Backend not responding
**Problem**: Backend server not running or wrong port

**Fix**:
1. Check backend terminal - should show "Server running on: http://localhost:5000"
2. Test backend: Open browser to `http://localhost:5000/api/health`
3. Should see: `{"status":"ok","message":"..."}`

---

### CORS error
**Problem**: Frontend can't reach backend

**Fix**:
1. Check backend `.env` has: `FRONTEND_URL=http://localhost:3000`
2. Restart backend server
3. Clear browser cache (Ctrl+Shift+Delete)

---

### Form data not restored
**Problem**: localStorage not working

**Fix**:
1. Check browser console (F12) for errors
2. Make sure you clicked the test item (not just closed modal)
3. Check localStorage in DevTools:
   - F12 → Application → Local Storage
   - Should see `pendingBookingData`
4. Try different browser (Chrome recommended)

---

## ✅ Success Criteria

You'll know everything is working when:

- ✅ DrinksModal shows 4 drink options (including CW-BOOKING Test Item)
- ✅ Clicking test item saves data to localStorage
- ✅ Redirects to Stripe payment page
- ✅ Payment completes successfully
- ✅ Backend verifies payment (check backend logs)
- ✅ Payment success page displays correctly
- ✅ All form data restored on Details page
- ✅ Special Requests includes: "Pre-ordered: CW-BOOKING Test Item - £XX.XX"
- ✅ Can complete final booking
- ✅ localStorage cleared after booking

---

## 📝 Notes

- **Test Mode**: Always use test mode for development
- **Test Cards**: Only use Stripe test cards (4242...)
- **Real Charges**: No real charges are made in test mode
- **Session Expiry**: Stripe sessions expire after 24 hours
- **localStorage**: Persists until manually cleared or after successful booking

---

## 🎯 Quick Test Command

Run this in browser console (F12) to check localStorage:

```javascript
// Check what's saved
console.log('Pending Booking:', localStorage.getItem('pendingBookingData'));
console.log('Drink Purchased:', localStorage.getItem('drinkPurchased'));
console.log('Drink Name:', localStorage.getItem('drinkName'));
console.log('Drink Amount:', localStorage.getItem('drinkAmount'));
console.log('Booking Reference:', localStorage.getItem('bookingReference'));

// Clear everything (if needed)
// localStorage.clear();
```

---

## 🚀 Ready to Test!

Your test payment link is now integrated. Follow the steps above to test the complete payment flow.

**Quick start:**
1. Configure payment link in Stripe Dashboard (Step 1)
2. Start backend: `cd backend && npm run dev`
3. Start frontend: `npm start`
4. Test the flow (Steps 1-11)
5. Verify everything works ✅

**Good luck with testing!** 🎉


