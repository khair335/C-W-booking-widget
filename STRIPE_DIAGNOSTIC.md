# 🔍 Stripe Payment Link Diagnostic Guide

## Issue: Drink data not being stored after payment

---

## Step-by-Step Diagnostic

### 1. Verify Stripe Payment Link Configuration

**Go to Stripe Dashboard:**
1. Visit: https://dashboard.stripe.com/
2. Make sure you're in **Test Mode** (toggle top-right)
3. Click **"Payment links"** in left sidebar

**Find Your Link:**
- Look for: **CW-BOOKING Test Item**
- Or search for link ID: `test_bJe3cu58Q5fz8iy5PBeQM00`
- Or look in your DrinksModal code - the 4th drink link

**Check Configuration:**
1. Click on the payment link
2. Click **"Edit"** button
3. Look for tabs: **"Payment page"** and **"After payment"**
4. Click **"After payment"** tab

**What You Should See:**

Under "Confirmation page" or "After payment" section:

```
○ Show confirmation page
● Don't show confirmation page
  Redirect customers to your website
  
  [Text field showing URL]
```

**The URL field MUST contain:**
```
https://c-w-booking-widget.vercel.app/payment-success?session_id={CHECKOUT_SESSION_ID}
```

**Critical Points:**
- ✅ Must include `?session_id={CHECKOUT_SESSION_ID}`
- ✅ Must be EXACTLY this URL
- ✅ The `{CHECKOUT_SESSION_ID}` is case-sensitive
- ✅ Don't remove the curly braces { }

---

### 2. Test the Payment Link Directly

**Manual Test:**

1. Copy your Stripe payment link:
   ```
   https://buy.stripe.com/test_bJe3cu58Q5fz8iy5PBeQM00
   ```

2. Open it in a **new incognito/private window**

3. Complete payment with test card: `4242 4242 4242 4242`

4. **Watch WHERE Stripe redirects you:**
   - Should go to: `https://c-w-booking-widget.vercel.app/payment-success?session_id=cs_test_xxx`
   - If it goes somewhere else, the Stripe config is wrong

5. **Check the URL bar** - copy and paste the exact URL you land on

---

### 3. Check All localStorage Keys

After completing payment and landing on any page, open console and run:

```javascript
console.log('=== ALL LOCALSTORAGE KEYS ===');
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  const value = localStorage.getItem(key);
  console.log(key + ':', value);
}
console.log('=== END ===');
```

**Expected Output Should Include:**
```
pendingBookingData: {...}
bookingReference: 3b487bff-ba92-43df-8aeb-82d9e05edda3
awaitingPayment: true
drinkPurchased: true        ← MUST HAVE THIS
drinkName: CW-BOOKING Test Item    ← MUST HAVE THIS
drinkAmount: 10             ← MUST HAVE THIS
```

---

### 4. Verify Stripe Payment Link Settings

**Option A: Via Stripe Dashboard UI**

After clicking "Edit" on your payment link:
- Screenshot the "After payment" settings
- Make sure "Don't show confirmation page" is selected
- Make sure URL field is filled correctly

**Option B: Via Stripe API (Advanced)**

If you have Stripe CLI:
```bash
stripe payment_links list --limit 10
```

Look for your link and check the `after_completion` settings.

---

### 5. Alternative: Check From Payment History

1. Go to: https://dashboard.stripe.com/test/payments
2. Find your recent test payment
3. Click on it
4. Look at the "Events and logs" section
5. See if there's a `checkout.session.completed` event
6. Check what redirect URL was used

---

## 🔧 Common Issues & Fixes

### Issue A: Wrong Success URL in Stripe

**Symptoms:**
- After payment, not redirected to PaymentSuccess page
- localStorage doesn't have drink data

**Fix:**
1. Update Stripe Payment Link success URL
2. Must include `?session_id={CHECKOUT_SESSION_ID}`

---

### Issue B: Multiple Payment Links

**Symptoms:**
- Some drinks work, others don't

**Fix:**
- You have 4 drinks in DrinksModal
- Each needs its own Stripe Payment Link
- Each link must be configured with the same success URL

**Your 4 links:**
1. `https://book.stripe.com/9B6eVd5kOa6E3ty0Afg7e02` (Prosecco)
2. `https://book.stripe.com/dRm8wP8x0ceMe8c4Qvg7e03` (Champagne)
3. `https://buy.stripe.com/4gM00j5kO6Usfcg3Mrg7e04` (Sparkling)
4. `https://buy.stripe.com/test_bJe3cu58Q5fz8iy5PBeQM00` (Test Item)

**ALL 4 must have the same success URL configured!**

---

### Issue C: Session ID Not Being Passed

**Symptoms:**
- PaymentSuccess page shows "No payment session found"

**Fix:**
- Verify success URL includes `{CHECKOUT_SESSION_ID}` placeholder
- Check spelling and capitalization exactly

---

## 📸 What I Need From You

To help debug, please provide:

1. **Screenshot** of Stripe Payment Link "After payment" settings
2. **Copy-paste** the exact URL from Stripe's success URL field
3. **Console logs** when you land on PaymentSuccess page
4. **URL bar** content when you land after payment

---

## 🎯 Quick Verification Commands

Run these in browser console on the Details page:

```javascript
// Check if you ever visited PaymentSuccess
console.log('Session Storage:', sessionStorage);

// Check all localStorage
Object.keys(localStorage).forEach(key => {
  console.log(key, '=', localStorage.getItem(key));
});

// Check if PaymentSuccess route exists
console.log('Current location:', window.location.href);
```

---

## ⚡ Immediate Action Required

**Please do this NOW:**

1. Go to Stripe Dashboard → Payment Links
2. Click on CW-BOOKING Test Item
3. Click Edit → After payment tab
4. **Copy the EXACT text** from the success URL field
5. **Paste it here**

This will tell me if the Stripe configuration is correct or not.

**Without seeing the actual Stripe configuration, I can't fix this issue.** Please share what's in the Stripe success URL field! 🙏
