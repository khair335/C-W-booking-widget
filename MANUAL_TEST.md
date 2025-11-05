# 🧪 Manual Test - Verify Restoration Works

Since the PaymentSuccess page isn't storing the drink data, let's manually test if the restoration logic works.

---

## Test 1: Manually Set Drink Data in localStorage

### Step 1: Go to Details Page
Navigate to any Details page (e.g., Long Hop Details)

### Step 2: Open Browser Console (F12)

### Step 3: Run This Code

**Paste this in the console and press Enter:**

```javascript
// Manually set the drink payment data
localStorage.setItem('drinkPurchased', 'true');
localStorage.setItem('drinkName', 'CW-BOOKING Test Item');
localStorage.setItem('drinkAmount', '10.50');

console.log('✅ Manually set drink data');
console.log('Verification:');
console.log('  drinkPurchased:', localStorage.getItem('drinkPurchased'));
console.log('  drinkName:', localStorage.getItem('drinkName'));
console.log('  drinkAmount:', localStorage.getItem('drinkAmount'));
```

### Step 4: Refresh the Page

Press **F5** to refresh the Details page

### Step 5: Check Special Requests Field

**Expected Result:**
The Special Requests field should now show:
```
Includes 2 children - Pre-ordered: CW-BOOKING Test Item - £10.50
```

**If this works**, the restoration logic is fine - the problem is just that PaymentSuccess isn't storing the data.

**If this doesn't work**, there's an issue with the restoration logic itself.

---

## Test 2: Check Backend Verification

### Test the backend directly:

```javascript
// Test backend verification API
fetch('https://cw-backend-inky.vercel.app/api/verify-payment?session_id=cs_test_a1mitVx8dLk4y8KGd14QPoDS0TYxxrly0Ib7wa7rCAY23SbKGGAPKej0Qh')
  .then(r => r.json())
  .then(data => {
    console.log('Backend Response:', data);
    if (data.success && data.paid) {
      console.log('✅ Backend verification works!');
      console.log('Drink:', data.drink);
      console.log('Amount:', data.amount);
    } else {
      console.log('❌ Backend says payment not successful');
    }
  })
  .catch(err => console.error('❌ Backend error:', err));
```

**Expected Output:**
```
Backend Response: {success: true, paid: true, drink: "...", amount: 10}
✅ Backend verification works!
```

---

## Test 3: Verify Stripe Redirect URL

### Option A: Check via Stripe Dashboard

1. Go to: https://dashboard.stripe.com/test/payment-links
2. Find: CW-BOOKING Test Item
3. **Copy the EXACT success URL** shown in Stripe
4. **Paste it here** so I can verify it's correct

### Option B: Test a Fresh Payment

1. **Make a new booking** (clear localStorage first)
2. **Click on CW-BOOKING Test Item**
3. **When Stripe payment page opens**, look at the URL
4. **Complete the payment**
5. **Immediately check the URL bar** - what URL did you land on?
6. **Copy that URL** and share it

---

## 🎯 Expected vs Actual

### Expected After Payment:
```
URL: https://c-w-booking-widget.vercel.app/payment-success?session_id=cs_test_xxx
Page: Shows "Payment Successful!" with drink info
Console: Shows "💾 Storing drink info to localStorage..."
localStorage: Has drinkPurchased=true, drinkName=..., drinkAmount=...
```

### What's Actually Happening:
```
URL: ??? (unknown - you're not telling me where you land)
Page: ??? (are you seeing PaymentSuccess page or not?)
Console: No logs about storing drink data
localStorage: drinkPurchased is NULL
```

---

## 🚨 Critical Information Needed

**Please answer these questions:**

1. **After paying in Stripe, what page do you see?**
   - [ ] "Payment Successful!" page (green checkmark)
   - [ ] "Payment Verification Failed" page (red X)
   - [ ] Details page (form)
   - [ ] Other: ____________

2. **What URL is in the address bar after payment?**
   - Copy and paste it here: ________________

3. **Have you configured the Stripe Payment Link success URL?**
   - [ ] Yes, I configured it
   - [ ] No, I haven't configured it yet
   - [ ] Not sure

4. **What's the exact success URL in your Stripe dashboard?**
   - Copy and paste from Stripe: ________________

---

## 🔧 Quick Fix: Configure Stripe Now

If you haven't configured Stripe yet, do this:

1. https://dashboard.stripe.com/test/payment-links
2. Click on CW-BOOKING Test Item
3. Click **Edit**
4. Click **"After payment"** tab
5. Select **"Don't show confirmation page"**
6. In the URL field, enter:
   ```
   https://c-w-booking-widget.vercel.app/payment-success?session_id={CHECKOUT_SESSION_ID}
   ```
7. Click **Save**
8. Test again

---

**Without knowing WHERE you land after payment, I can't fix this. Please share:**
- The URL you land on after payment
- The Stripe success URL configuration
- Screenshot of Stripe settings

