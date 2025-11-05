# Stripe Payment Links Setup Guide

This guide explains how to configure Stripe Payment Links to work with the drinks payment tracking system.

## Prerequisites

- Stripe account (test mode for development, live mode for production)
- Backend server running (default: http://localhost:5000)
- Frontend running (default: http://localhost:3000)

---

## Step 1: Access Stripe Dashboard

1. Go to https://dashboard.stripe.com/
2. Make sure you're in **Test Mode** (toggle in top right) for development
3. Navigate to **Products** → **Payment Links**

---

## Step 2: Configure Existing Payment Links

You already have 3 payment links in `DrinksModal.js`:

### Payment Link 1: Prosecco (£36.00)
- **Current URL**: `https://book.stripe.com/9B6eVd5kOa6E3ty0Afg7e02`

### Payment Link 2: Veuve Clicquot Champagne (£79.00)
- **Current URL**: `https://book.stripe.com/dRm8wP8x0ceMe8c4Qvg7e03`

### Payment Link 3: Chapel Down English Sparkling (£55.00)
- **Current URL**: `https://buy.stripe.com/4gM00j5kO6Usfcg3Mrg7e04`

---

## Step 3: Update Each Payment Link

For **EACH** of the 3 payment links above:

### 1. Open Payment Link Settings

- Click on the payment link in Stripe Dashboard
- Click **"Edit"** or **"Settings"**

### 2. Set Success URL

In the **"After payment"** section:

**For Development (Testing):**
```
http://localhost:3000/payment-success?session_id={CHECKOUT_SESSION_ID}
```

**For Production:**
```
https://yourdomain.com/payment-success?session_id={CHECKOUT_SESSION_ID}
```

⚠️ **Important**: Make sure to include `{CHECKOUT_SESSION_ID}` exactly as shown - Stripe will replace this with the actual session ID.

### 3. Set Cancel URL

In the **"After payment"** section:

**For Development:**
```
http://localhost:3000/payment-cancelled
```

**For Production:**
```
https://yourdomain.com/payment-cancelled
```

### 4. Save Changes

Click **"Save"** or **"Update payment link"**

---

## Step 4: Verify Configuration

### Test Each Payment Link:

1. **Start your servers:**
   ```bash
   # Terminal 1: Backend
   cd backend
   npm run dev
   
   # Terminal 2: Frontend
   npm start
   ```

2. **Test payment flow:**
   - Go to a Details page (Griffin, Long Hop, or Tap & Run)
   - Fill in booking details
   - Click "Next" to open DrinksModal
   - Click on any drink option
   - You should be redirected to Stripe payment page
   - Use test card: `4242 4242 4242 4242` (any future date, any CVV)
   - After payment, you should be redirected to `/payment-success`
   - You should see payment verification and drink info
   - Click "Continue with Booking"
   - You should return to Details page with drink added to Special Requests

3. **Test cancellation:**
   - Go through the same flow
   - On Stripe payment page, click the back button or close the page
   - Manually navigate to `http://localhost:3000/payment-cancelled`
   - You should see the cancellation page

---

## Step 5: Environment Variables

### Backend (.env)

Make sure your backend has the correct Stripe secret key:

```env
PORT=5000
NODE_ENV=development
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx
FRONTEND_URL=http://localhost:3000
```

⚠️ **Get your secret key from:** https://dashboard.stripe.com/apikeys

### Frontend (.env)

If you need the Stripe publishable key:

```env
REACT_APP_BACKEND_URL=http://localhost:5000
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx
```

---

## Step 6: Production Deployment

When deploying to production:

### 1. Update Backend URL in Frontend

In `PaymentSuccess.js` (line 23), change:
```javascript
const response = await axios.get(
  `http://localhost:5000/api/verify-payment?session_id=${sessionId}`
);
```

To:
```javascript
const response = await axios.get(
  `${process.env.REACT_APP_BACKEND_URL}/api/verify-payment?session_id=${sessionId}`
);
```

Then set in `.env`:
```
REACT_APP_BACKEND_URL=https://your-backend-domain.com
```

### 2. Switch Stripe to Live Mode

- In Stripe Dashboard, toggle to **Live Mode**
- Get your **live** secret key from API keys section
- Update backend `.env` with live key: `sk_live_xxxxx`

### 3. Update Payment Link URLs

- Go to each payment link in **Live Mode**
- Update Success URL to: `https://yourdomain.com/payment-success?session_id={CHECKOUT_SESSION_ID}`
- Update Cancel URL to: `https://yourdomain.com/payment-cancelled`

### 4. Test with Real Card

⚠️ Use a real card or use Stripe's test card in live mode to verify everything works.

---

## Troubleshooting

### Issue: "No payment session found"

**Cause**: The `session_id` parameter is missing from the URL.

**Solution**: 
- Check that the Success URL includes `{CHECKOUT_SESSION_ID}`
- Verify the URL in Stripe Dashboard payment link settings

---

### Issue: "Invalid session ID"

**Cause**: Backend can't verify the session with Stripe.

**Solution**:
- Check backend `.env` has correct `STRIPE_SECRET_KEY`
- Make sure backend server is running
- Check backend logs for errors

---

### Issue: "Payment verified but drink not added to Special Requests"

**Cause**: localStorage not being read or cleared too early.

**Solution**:
- Check browser console for errors
- Verify localStorage has `drinkPurchased`, `drinkName`, `drinkAmount`
- Clear browser cache and try again

---

### Issue: CORS error when calling backend

**Cause**: Frontend URL not allowed by backend CORS.

**Solution**:
- Check backend `.env` has correct `FRONTEND_URL`
- Restart backend server after changing `.env`

---

## Testing Checklist

- [ ] Backend server starts without errors
- [ ] Frontend can reach backend `/api/health` endpoint
- [ ] Can select drink and redirect to Stripe
- [ ] Can complete payment with test card
- [ ] Redirected to `/payment-success` after payment
- [ ] Payment verification successful
- [ ] Drink info stored in localStorage
- [ ] Return to Details page
- [ ] Form data restored (name, email, etc.)
- [ ] Special Requests includes drink info
- [ ] Can submit final booking successfully
- [ ] localStorage cleared after booking

---

## Test Card Numbers

Use these in Test Mode:

| Card Number | Description |
|-------------|-------------|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0000 0000 0002` | Card declined |
| `4000 0000 0000 9995` | Insufficient funds |

- Expiry: Any future date
- CVV: Any 3 digits
- ZIP: Any 5 digits

---

## Support

If you encounter issues:

1. Check backend logs: Backend server console output
2. Check frontend logs: Browser DevTools console (F12)
3. Check Stripe logs: Dashboard → Developers → Logs
4. Check network requests: Browser DevTools Network tab

---

## Summary

✅ Configure 3 payment links in Stripe Dashboard
✅ Set Success URL with `{CHECKOUT_SESSION_ID}` parameter
✅ Set Cancel URL
✅ Add Stripe secret key to backend `.env`
✅ Start backend server (port 5000)
✅ Start frontend (port 3000)
✅ Test complete payment flow
✅ Verify drink added to Special Requests
✅ For production: Update URLs and switch to Live Mode

**Your payment tracking system is now ready!** 🎉


