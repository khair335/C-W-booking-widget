# 📋 Special Requests Field Format

## What Gets Added to Special Requests After Payment

When a user successfully completes payment for a drink, the Special Requests field will automatically include:

1. ✅ **Children information** (if any)
2. ✅ **Drink name and price**
3. ✅ **Payment transaction ID**
4. ✅ **Original user special requests**

---

## Format Examples

### Example 1: With Children + Drink + Custom Request
**Booking Details:**
- 2 Adults + 2 Children
- Drink: CW-BOOKING Test Item (£10.50)
- Payment ID: cs_test_a1mitVx8dLk4y8KGd14QPoDS0TYxxrly0Ib7wa7rCAY23SbKGGAPKej0Qh
- Original Request: "Window seat please"

**Special Requests Field:**
```
Includes 2 children - Pre-ordered: CW-BOOKING Test Item - £10.50 (Payment ID: cs_test_a1mitVx8dLk4y8KGd14QPoDS0TYxxrly0Ib7wa7rCAY23SbKGGAPKej0Qh) - Window seat please
```

---

### Example 2: No Children + Drink + Custom Request
**Booking Details:**
- 3 Adults + 0 Children
- Drink: Prosecco (£36.00)
- Payment ID: cs_test_xyz123abc
- Original Request: "Quiet table if possible"

**Special Requests Field:**
```
Pre-ordered: Prosecco - £36.00 (Payment ID: cs_test_xyz123abc)
Quiet table if possible
```

---

### Example 3: Children + Drink + No Custom Request
**Booking Details:**
- 2 Adults + 1 Child
- Drink: Veuve Clicquot Champagne (£79.00)
- Payment ID: cs_test_abc456def
- Original Request: (empty)

**Special Requests Field:**
```
Includes 1 children - Pre-ordered: Veuve Clicquot Champagne - £79.00 (Payment ID: cs_test_abc456def)
```

---

### Example 4: No Children + Drink Only
**Booking Details:**
- 4 Adults + 0 Children
- Drink: Chapel Down English Sparkling (£55.00)
- Payment ID: cs_test_789xyz
- Original Request: (empty)

**Special Requests Field:**
```
Pre-ordered: Chapel Down English Sparkling - £55.00 (Payment ID: cs_test_789xyz)
```

---

## Payment Transaction ID Format

The payment transaction ID is the **Stripe Checkout Session ID**:

- **Test Mode**: `cs_test_a1B2c3D4e5...` (starts with `cs_test_`)
- **Live Mode**: `cs_live_a1B2c3D4e5...` (starts with `cs_live_`)

This ID can be used to:
- ✅ Look up the payment in Stripe Dashboard
- ✅ Verify the transaction
- ✅ Process refunds if needed
- ✅ Track customer purchases

---

## Why Include Payment ID?

Including the payment transaction ID in Special Requests provides:

1. **Audit Trail**: Easy to verify which payment corresponds to which booking
2. **Customer Support**: Can look up payment details if customer has questions
3. **Refund Processing**: Quick reference for processing refunds
4. **Fraud Prevention**: Verify payment authenticity
5. **Reporting**: Track which drinks are most popular

---

## Data Flow

```
User completes payment
         ↓
Stripe generates session ID: cs_test_xxx
         ↓
Redirects to PaymentSuccess with session_id parameter
         ↓
Backend verifies payment and returns:
  - Drink name
  - Amount paid
  - Session ID
         ↓
Frontend stores in localStorage:
  - drinkPurchased: "true"
  - drinkName: "Drink Name"
  - drinkAmount: "10.50"
  - paymentSessionId: "cs_test_xxx"
         ↓
User returns to Details page
         ↓
Restoration logic builds Special Requests:
  "Includes X children - Pre-ordered: Drink - £XX.XX (Payment ID: cs_test_xxx) - Original requests"
         ↓
User submits booking with complete payment info
```

---

## Testing

### Manual Test (To verify format):

In browser console on Details page:

```javascript
// Set test data
localStorage.setItem('drinkPurchased', 'true');
localStorage.setItem('drinkName', 'CW-BOOKING Test Item');
localStorage.setItem('drinkAmount', '10.50');
localStorage.setItem('paymentSessionId', 'cs_test_EXAMPLE123ABC456');

// Refresh page
window.location.reload();

// After reload, check Special Requests field
// Should show: Pre-ordered: CW-BOOKING Test Item - £10.50 (Payment ID: cs_test_EXAMPLE123ABC456)
```

---

## Database Storage

When the booking is submitted, the Special Requests field (with payment ID) will be saved in your booking database.

**Example booking record:**
```json
{
  "customer": "John Doe",
  "email": "john@example.com",
  "date": "2025-11-20",
  "time": "12:30",
  "partySize": 4,
  "children": 2,
  "specialRequests": "Includes 2 children - Pre-ordered: CW-BOOKING Test Item - £10.50 (Payment ID: cs_test_xxx) - Window seat please"
}
```

---

## Stripe Dashboard Lookup

To look up a payment using the transaction ID:

1. Go to: https://dashboard.stripe.com/
2. Click **Payments** in left sidebar
3. Use search bar to search for the session ID (e.g., `cs_test_xxx`)
4. View full payment details, customer info, and receipt

---

## Benefits

✅ **Complete Payment Tracking**: Every drink order has verifiable payment ID  
✅ **Easy Refunds**: Can process refunds directly from Stripe using the ID  
✅ **Audit Compliance**: Full transaction trail for accounting  
✅ **Customer Service**: Quick lookup of payment details  
✅ **Dispute Resolution**: Proof of payment for any disputes  

---

## Next Steps After Deployment

After Vercel redeploys (1-2 minutes):

1. **Clear localStorage**: `localStorage.clear()`
2. **Start fresh booking**
3. **Complete payment**
4. **Verify Special Requests shows**:
   - Children count
   - Drink name and price
   - Payment transaction ID (cs_test_xxx or cs_live_xxx)
   - Original special requests

**The Special Requests field now includes complete payment information!** 🎉

