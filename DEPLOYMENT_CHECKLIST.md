# 🚀 Complete Deployment Checklist

Quick checklist for deploying the drinks payment tracking system to production.

---

## 📋 Backend Deployment (Vercel)

### Step 1: Deploy to Vercel
- [ ] Go to https://vercel.com/
- [ ] Sign in with GitHub account
- [ ] Click "Add New..." → "Project"
- [ ] Import: `khair335/cw-backend`
- [ ] Framework: **Other**
- [ ] Root Directory: `.` (leave default)

### Step 2: Add Environment Variables
- [ ] `STRIPE_SECRET_KEY` = Your Stripe secret key (from dashboard.stripe.com/apikeys)
- [ ] `FRONTEND_URL` = `https://c-w-booking-widget.vercel.app`
- [ ] `NODE_ENV` = `production`
- [ ] Check all three boxes: Production, Preview, Development

### Step 3: Deploy
- [ ] Click "Deploy"
- [ ] Wait for deployment to complete (1-2 min)
- [ ] Copy your backend URL: `https://cw-backend.vercel.app` (or similar)

### Step 4: Test Backend
- [ ] Open: `https://your-backend-url.vercel.app/api/health`
- [ ] Should see: `{"status": "ok", "message": "..."}`

---

## 🎨 Frontend Configuration

### Step 1: Update Backend URL in Frontend

**Option A - Direct Update:**
Edit `/src/Pages/PaymentSuccess/PaymentSuccess.js` line ~23:
```javascript
const response = await axios.get(
  `https://cw-backend.vercel.app/api/verify-payment?session_id=${sessionId}`
);
```

**Option B - Environment Variable (Recommended):**
1. Create/update `.env` in frontend root:
   ```
   REACT_APP_BACKEND_URL=https://cw-backend.vercel.app
   ```
2. Update `PaymentSuccess.js`:
   ```javascript
   const response = await axios.get(
     `${process.env.REACT_APP_BACKEND_URL}/api/verify-payment?session_id=${sessionId}`
   );
   ```
3. Add same env var in Vercel frontend project settings

### Step 2: Commit and Deploy Frontend
```bash
git add .
git commit -m "Update backend URL for production"
git push origin main
```

- [ ] Vercel auto-deploys frontend
- [ ] Wait for deployment
- [ ] Check deployment succeeded

---

## 💳 Stripe Configuration

### For Testing (Test Mode):
- [ ] Go to https://dashboard.stripe.com/
- [ ] Make sure in **Test Mode** (toggle top-right)
- [ ] Go to **Payment Links**
- [ ] Find your CW-BOOKING test link
- [ ] Click **Edit** → **"After payment"** tab
- [ ] Set **Success URL**: 
  ```
  https://c-w-booking-widget.vercel.app/payment-success?session_id={CHECKOUT_SESSION_ID}
  ```
- [ ] Set **Cancel URL**:
  ```
  https://c-w-booking-widget.vercel.app/payment-cancelled
  ```
- [ ] Save changes
- [ ] Repeat for other drink links (Prosecco, Champagne, Sparkling)

### For Production (Live Mode):
- [ ] Switch to **Live Mode** in Stripe
- [ ] Update Stripe secret key in Vercel backend (use `sk_live_...`)
- [ ] Update all Payment Links with same URLs as above
- [ ] Test with real card (or Stripe test card in live mode)

---

## 🧪 Complete Flow Test

### Test in Production:
- [ ] Go to: `https://c-w-booking-widget.vercel.app`
- [ ] Select a restaurant (Griffin, Long Hop, or Tap & Run)
- [ ] Choose date, time, party size, area
- [ ] Fill in details:
  - [ ] Name: Test User
  - [ ] Email: test@example.com
  - [ ] Phone: 1234567890
  - [ ] Special Requests: "Window seat"
- [ ] Click "Next" → DrinksModal opens
- [ ] Click "CW-BOOKING Test Item"
- [ ] Pay with test card: `4242 4242 4242 4242`
- [ ] Should redirect to payment success page
- [ ] Should see: "Payment Successful!" with drink name
- [ ] Click "Continue with Booking"
- [ ] Verify all form data restored:
  - [ ] Name: "Test User"
  - [ ] Email: "test@example.com"
  - [ ] Phone: "1234567890"
  - [ ] Special Requests includes: "Window seat\nPre-ordered: CW-BOOKING Test Item - £XX.XX"
- [ ] Complete booking
- [ ] Verify booking successful

---

## 🔍 Verify Everything Works

### Backend Health:
```bash
curl https://your-backend-url.vercel.app/api/health
```
**Expected:** `{"status":"ok",...}`

### Frontend:
- [ ] All pages load correctly
- [ ] No console errors (F12)
- [ ] DrinksModal shows all drink options
- [ ] Payment links work

### Payment Flow:
- [ ] Can select drink
- [ ] Redirects to Stripe
- [ ] Payment succeeds
- [ ] Returns to success page
- [ ] Verifies payment
- [ ] Returns to details page
- [ ] Data restored
- [ ] Drink added to Special Requests

### localStorage:
**Before payment (after clicking drink):**
- [ ] `pendingBookingData` exists
- [ ] `bookingReference` exists
- [ ] `awaitingPayment` = "true"

**After payment:**
- [ ] `drinkPurchased` = "true"
- [ ] `drinkName` = correct drink name
- [ ] `drinkAmount` = correct amount

**After booking complete:**
- [ ] All localStorage cleared

---

## 🚨 Troubleshooting

### If payment verification fails:
1. Check Vercel backend logs (Dashboard → Project → Functions → Logs)
2. Verify `STRIPE_SECRET_KEY` in Vercel environment variables
3. Make sure using same Stripe account/mode
4. Check frontend console for errors

### If CORS errors:
1. Check `FRONTEND_URL` in backend Vercel settings
2. Must match exactly: `https://c-w-booking-widget.vercel.app`
3. Redeploy backend after changing

### If data not restored:
1. Check browser console (F12) for errors
2. Verify localStorage has data (F12 → Application → Local Storage)
3. Check you clicked the drink (not just closed modal)
4. Try different browser

---

## 📊 Monitoring

### Check Logs:
**Backend:**
- Vercel Dashboard → cw-backend → Deployments → Functions → Logs

**Frontend:**
- Vercel Dashboard → C-W-booking-widget → Deployments → Logs

**Stripe:**
- Stripe Dashboard → Developers → Logs

### Monitor Payments:
- Stripe Dashboard → Payments
- See all test/live payments
- Check for errors or disputes

---

## ✅ Final Checklist

### Production Ready:
- [ ] Backend deployed and healthy
- [ ] Frontend updated with backend URL
- [ ] Stripe Payment Links configured
- [ ] Complete flow tested successfully
- [ ] All data persists through redirect
- [ ] Drink info added to Special Requests
- [ ] localStorage cleaned after booking
- [ ] No console errors
- [ ] No CORS errors
- [ ] Tested on multiple browsers
- [ ] Tested on mobile (optional)

### For Going Live:
- [ ] Switch Stripe to Live Mode
- [ ] Update backend with live Stripe key (`sk_live_...`)
- [ ] Update all Payment Links with production URLs
- [ ] Test with real payment (small amount)
- [ ] Monitor first few real transactions
- [ ] Set up error alerts (optional)

---

## 🎉 You're Live!

Once all checkboxes are checked, your drinks payment tracking system is fully deployed and ready for production use!

### Quick Links:
- **Frontend**: https://c-w-booking-widget.vercel.app
- **Backend**: https://your-backend-url.vercel.app
- **Backend Health**: https://your-backend-url.vercel.app/api/health
- **Stripe Dashboard**: https://dashboard.stripe.com/
- **GitHub Backend**: https://github.com/khair335/cw-backend

### Support Docs:
- `VERCEL_DEPLOYMENT.md` - Detailed Vercel deployment guide
- `STRIPE_PAYMENT_LINKS_SETUP.md` - Stripe configuration guide
- `TEST_WITH_CW_BOOKING.md` - Testing guide
- `IMPLEMENTATION_COMPLETE.md` - Complete feature documentation
- `START_HERE.md` - Quick start guide

---

**Congratulations on deploying your payment tracking system! 🚀**

