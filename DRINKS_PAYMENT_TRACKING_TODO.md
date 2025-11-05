# Drinks Payment Tracking Implementation Plan

## Overview
Implement a system to track when users successfully complete Stripe payment for pre-ordered drinks, and automatically populate the Special Requests field with drink information.

---

## Architecture Decision

### **Separate Backend Server**
- **Technology**: Node.js + Express
- **Port**: 5000 (development)
- **Location**: `/backend` folder
- **Why**: Independent from Vercel serverless functions, easier debugging, can handle webhooks reliably

### **Database**: 
- **Option A**: MongoDB (recommended for quick setup)
- **Option B**: PostgreSQL (if you prefer SQL)
- **Option C**: JSON file storage (for MVP/testing only)

---

## Implementation Flow

### **Step 1: User Journey**
```
1. User fills booking details (Details page)
2. User clicks "Next" → DrinksModal opens
3. [NEW] Before redirect: Save ALL form data to localStorage (name, email, phone, date, time, etc.)
4. User selects a drink → Opens Stripe Payment Link (user leaves site)
5. User pays on Stripe → Stripe redirects to success page with session_id
6. Success page verifies payment via backend → Stores drink info in localStorage
7. User returns to Details page → Restores ALL form data + Auto-fills Special Requests with drink
8. User completes booking with all data preserved + drink info included
```

### **Data Persistence Strategy: localStorage**
We're using localStorage to persist booking form data because:
- ✅ Survives page redirects to Stripe and back
- ✅ Survives page refresh and browser close
- ✅ No backend database needed
- ✅ Simple to implement

**localStorage Keys Used:**
```javascript
'pendingBookingData'    // All form fields (name, email, phone, date, time, etc.)
'bookingReference'      // Unique booking ID
'awaitingPayment'       // Boolean: user went to Stripe
'drinkPurchased'        // Boolean: payment verified
'drinkName'             // Name of purchased drink
'drinkAmount'           // Amount paid for drink
```

### **Step 2: Stripe Configuration**
```
Payment Link 1: Premium Lager
- Success URL: http://localhost:3000/payment-success?session_id={CHECKOUT_SESSION_ID}
- Cancel URL: http://localhost:3000/payment-cancelled

Payment Link 2: Craft Beer Selection
- Success URL: http://localhost:3000/payment-success?session_id={CHECKOUT_SESSION_ID}
- Cancel URL: http://localhost:3000/payment-cancelled

Payment Link 3: Wine Package
- Success URL: http://localhost:3000/payment-success?session_id={CHECKOUT_SESSION_ID}
- Cancel URL: http://localhost:3000/payment-cancelled
```

### **Step 3: Backend Webhook (Optional but Recommended)**
```
- Webhook URL: http://yourdomain.com:5000/api/stripe-webhook
- Event: checkout.session.completed
- Purpose: Store payment records in database for audit/recovery
```

---

## Backend Server Structure

```
/backend
  /server.js                 # Main Express server
  /routes
    /payment.js              # Payment verification routes
    /webhook.js              # Stripe webhook handler
  /models
    /Payment.js              # Payment record model
  /controllers
    /paymentController.js    # Payment logic
  /config
    /stripe.js               # Stripe configuration
    /database.js             # Database connection
  /middleware
    /errorHandler.js         # Error handling
  /.env                      # Environment variables
  /package.json              # Backend dependencies
```

---

## Todo List

### **Phase 1: Backend Server Setup**

- [ ] **Task 1.1**: Create backend folder structure
  - Create `/backend` folder
  - Initialize npm: `npm init -y`
  - Install dependencies: `express`, `cors`, `dotenv`, `stripe`
  - Install dev dependencies: `nodemon`

- [ ] **Task 1.2**: Setup Express server
  - Create `server.js` with basic Express setup
  - Configure CORS to allow frontend origin
  - Setup port 5000 for development
  - Add error handling middleware

- [ ] **Task 1.3**: Configure environment variables
  - Create `.env` file in `/backend`
  - Add Stripe Secret Key
  - Add Stripe Webhook Secret (if using webhooks)
  - Add frontend URL for CORS
  - Add database connection string (if using DB)

- [ ] **Task 1.4**: Setup Stripe configuration
  - Create `/backend/config/stripe.js`
  - Initialize Stripe with secret key
  - Export Stripe instance for use in routes

### **Phase 2: Payment Verification API**

- [ ] **Task 2.1**: Create payment verification endpoint
  - Route: `GET /api/verify-payment?session_id=xxx`
  - Call Stripe API: `stripe.checkout.sessions.retrieve(session_id)`
  - Validate payment status
  - Extract drink information from session metadata or product name
  - Return: `{ success: true, drink: "...", amount: ..., paid: true }`

- [ ] **Task 2.2**: Add error handling
  - Handle invalid session_id
  - Handle unpaid sessions
  - Handle expired sessions
  - Return proper error messages

- [ ] **Task 2.3**: Add payment record storage (optional)
  - Create database model for payments
  - Store: session_id, drink_name, amount, timestamp, booking_reference
  - Add duplicate check (don't verify same session twice)

### **Phase 3: Stripe Webhook Handler (Optional)**

- [ ] **Task 3.1**: Create webhook endpoint
  - Route: `POST /api/stripe-webhook`
  - Verify webhook signature using Stripe webhook secret
  - Handle `checkout.session.completed` event

- [ ] **Task 3.2**: Store payment records
  - Extract session data from webhook
  - Store in database for permanent record
  - This acts as backup to frontend flow

- [ ] **Task 3.3**: Configure Stripe webhook
  - Add webhook URL in Stripe Dashboard
  - Subscribe to `checkout.session.completed`
  - Test with Stripe CLI: `stripe listen --forward-to localhost:5000/api/stripe-webhook`

### **Phase 4: Frontend - Payment Success Page**

- [ ] **Task 4.1**: Create PaymentSuccess component
  - Location: `/src/Pages/PaymentSuccess/PaymentSuccess.js`
  - Location: `/src/Pages/PaymentSuccess/PaymentSuccess.css`
  - Get `session_id` from URL query params
  - Show loading state while verifying

- [ ] **Task 4.2**: Call backend verification API
  - Use axios to call `http://localhost:5000/api/verify-payment?session_id=xxx`
  - Handle loading, success, and error states
  - Display success message with drink info

- [ ] **Task 4.3**: Store payment info in localStorage
  - On successful verification, store:
    ```javascript
    {
      drinkPurchased: true,
      drinkName: "Premium Lager",
      drinkAmount: 10.00,
      timestamp: Date.now()
    }
    ```
  - This persists even if user closes browser

- [ ] **Task 4.4**: Add redirect to booking flow
  - Button: "Continue with Booking"
  - Redirect back to Details page with drink info preserved

- [ ] **Task 4.5**: Create PaymentCancelled component
  - Location: `/src/Pages/PaymentCancelled/PaymentCancelled.js`
  - Show message: "Payment was cancelled"
  - Button: "Try Again" → Back to DrinksModal

### **Phase 5: Frontend - DrinksModal Updates**

- [ ] **Task 5.1**: Accept form data as props from Details page
  - DrinksModal should receive: `{ name, email, phone, date, time, partySize, specialRequests, area, restaurant }`
  - Or retrieve from Redux if using Redux for form state

- [ ] **Task 5.2**: Generate booking reference before payment
  - Install `uuid`: `npm install uuid`
  - Generate unique ID when modal opens: `const bookingRef = uuidv4()`
  - Store in state

- [ ] **Task 5.3**: Save ALL data to localStorage before Stripe redirect
  - Before user clicks Stripe link, save complete booking data:
    ```javascript
    const bookingData = {
      // Form data
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      date: formData.date,
      time: formData.time,
      partySize: formData.partySize,
      specialRequests: formData.specialRequests,
      selectedArea: formData.area,
      restaurant: formData.restaurant,
      
      // Tracking data
      bookingReference: bookingRef,
      selectedDrink: "Premium Lager", // which drink was clicked
      awaitingPayment: true,
      timestamp: Date.now()
    };
    
    localStorage.setItem('pendingBookingData', JSON.stringify(bookingData));
    localStorage.setItem('bookingReference', bookingRef);
    localStorage.setItem('awaitingPayment', 'true');
    ```

- [ ] **Task 5.4**: Update Stripe Payment Link click handlers
  - Keep existing Stripe links as-is
  - Before opening link, call save function
  - Track which drink was clicked (save to localStorage)
  - Then allow redirect to Stripe

### **Phase 6: Frontend - Details Pages (6 files)**

Files to update:
1. `/src/Pages/Details/Details.js` (Griffin)
2. `/src/Pages/longhopDetails/longhopDetails.js` (Long Hop)
3. `/src/Pages/topDetails/topDetails.js` (Tap & Run)
4. [And their 3 edit page equivalents]

- [ ] **Task 6.1**: Restore ALL form data on component mount
  - In `useEffect`, check localStorage for `pendingBookingData`
  - If found, restore ALL fields:
    ```javascript
    useEffect(() => {
      const savedData = localStorage.getItem('pendingBookingData');
      if (savedData) {
        const bookingData = JSON.parse(savedData);
        
        // Restore all form fields
        setName(bookingData.name || '');
        setEmail(bookingData.email || '');
        setPhone(bookingData.phone || '');
        setDate(bookingData.date || '');
        setTime(bookingData.time || '');
        setPartySize(bookingData.partySize || 0);
        setSpecialRequests(bookingData.specialRequests || '');
        // ... restore other fields
      }
    }, []);
    ```

- [ ] **Task 6.2**: Check for successful drink purchase
  - Check localStorage for `drinkPurchased: true`
  - If true, read `drinkName` and `drinkAmount`

- [ ] **Task 6.3**: Auto-populate Special Requests with drink info
  - Format: "Pre-ordered: [Drink Name] - £[Amount]"
  - Example: "Pre-ordered: Premium Lager - £10.00"
  - Append to existing Special Requests if any:
    ```javascript
    const drinkInfo = `Pre-ordered: ${drinkName} - £${drinkAmount}`;
    const existingRequests = bookingData.specialRequests || '';
    const newRequests = existingRequests 
      ? `${existingRequests}\n${drinkInfo}` 
      : drinkInfo;
    setSpecialRequests(newRequests);
    ```
  - Allow user to edit/remove if needed

- [ ] **Task 6.4**: Clear localStorage after booking submission
  - When final booking is submitted successfully, clear all data:
    ```javascript
    localStorage.removeItem('pendingBookingData');
    localStorage.removeItem('bookingReference');
    localStorage.removeItem('awaitingPayment');
    localStorage.removeItem('drinkPurchased');
    localStorage.removeItem('drinkName');
    localStorage.removeItem('drinkAmount');
    ```

- [ ] **Task 6.5**: Handle edge cases
  - User closes browser after payment → localStorage persists ✓
  - User makes multiple bookings → Clear flags after each booking
  - User cancels payment → Keep form data but remove drink flags
  - Form validation still works with restored data

### **Phase 7: Router Configuration**

- [ ] **Task 7.1**: Add new routes to React Router
  - Add route: `/payment-success` → PaymentSuccess component
  - Add route: `/payment-cancelled` → PaymentCancelled component
  - Test routing works correctly

### **Phase 8: Stripe Dashboard Configuration**

- [ ] **Task 8.1**: Update Payment Links (Test Mode)
  - Go to Stripe Dashboard → Payment Links
  - For each drink payment link:
    - Set Success URL: `http://localhost:3000/payment-success?session_id={CHECKOUT_SESSION_ID}`
    - Set Cancel URL: `http://localhost:3000/payment-cancelled`
  - Save changes

- [ ] **Task 8.2**: Test with Stripe Test Mode
  - Use test card: 4242 4242 4242 4242
  - Verify redirect works
  - Verify session_id is passed correctly

- [ ] **Task 8.3**: Configure Production URLs (when ready)
  - Update Success URL: `https://yourdomain.com/payment-success?session_id={CHECKOUT_SESSION_ID}`
  - Update Cancel URL: `https://yourdomain.com/payment-cancelled`

### **Phase 9: Testing**

- [ ] **Task 9.1**: Test complete flow
  - Start booking → Select drink → Pay → Return to details
  - Verify Special Requests auto-filled
  - Complete booking and check final data

- [ ] **Task 9.2**: Test error scenarios
  - Invalid session_id
  - Expired session
  - Network errors
  - User cancels payment

- [ ] **Task 9.3**: Test multiple bookings
  - Complete one booking with drink
  - Start another booking → Should be clean
  - Verify localStorage cleaned properly

### **Phase 10: Production Deployment**

- [ ] **Task 10.1**: Deploy backend server
  - Options: Heroku, Railway, DigitalOcean, AWS
  - Set environment variables in hosting platform
  - Get production URL: `https://api.yourdomain.com`

- [ ] **Task 10.2**: Update frontend API URLs
  - Change from `localhost:5000` to production URL
  - Use environment variables: `REACT_APP_BACKEND_URL`

- [ ] **Task 10.3**: Update Stripe webhook URL (if used)
  - Update to production URL in Stripe Dashboard
  - Test webhook in production

- [ ] **Task 10.4**: Final testing in production
  - Test with real payment (small amount)
  - Verify entire flow works
  - Monitor for errors

---

## Environment Variables Needed

### **Backend (.env)**
```env
PORT=5000
STRIPE_SECRET_KEY=sk_test_xxxxx (or sk_live_xxxxx for production)
STRIPE_WEBHOOK_SECRET=whsec_xxxxx (if using webhooks)
FRONTEND_URL=http://localhost:3000
DATABASE_URL=mongodb://... (if using database)
NODE_ENV=development
```

### **Frontend (.env)**
```env
REACT_APP_BACKEND_URL=http://localhost:5000
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_xxxxx
```

---

## API Endpoints Summary

### **Backend Server APIs**

| Method | Endpoint | Purpose | Response |
|--------|----------|---------|----------|
| GET | `/api/verify-payment?session_id=xxx` | Verify Stripe payment | `{ success: true, drink: "...", amount: ... }` |
| POST | `/api/stripe-webhook` | Receive Stripe events | `{ received: true }` |
| GET | `/api/health` | Check server status | `{ status: "ok" }` |

---

## Data Flow Diagram

```
┌─────────────────────────────┐
│  Details Page               │
│  User fills form:           │
│  - Name, Email, Phone       │
│  - Date, Time, Party Size   │
│  - Special Requests         │
└──────────────┬──────────────┘
               │ Click "Next"
               ▼
┌─────────────────────────────┐
│  DrinksModal Opens          │
│                             │
│  [SAVE TO localStorage]     │◄─── Save ALL form data
│  - All form fields          │
│  - Generate booking ref     │
│  - Set awaitingPayment=true │
└──────────────┬──────────────┘
               │ Click drink (e.g. Premium Lager)
               │ → Opens Stripe.com
               ▼
┌─────────────────────────────┐
│  Stripe Payment Link        │
│  (User LEAVES your site)    │
└──────────────┬──────────────┘
               │ Complete payment
               │ → Stripe redirects back
               ▼
┌─────────────────────────────┐
│  Payment Success Page       │
│  - Get session_id from URL  │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│  Backend Server             │
│  /api/verify-payment        │
│  - Calls Stripe API         │
│  - Verifies session_id      │
└──────────────┬──────────────┘
               │ Response: 
               │ { success: true, drink: "Premium Lager", amount: 10.00 }
               ▼
┌─────────────────────────────┐
│  localStorage Updated       │
│  - drinkPurchased = true    │
│  - drinkName = "Premium..."│
│  - drinkAmount = 10.00      │
└──────────────┬──────────────┘
               │ "Continue Booking" button
               ▼
┌─────────────────────────────┐
│  Details Page               │
│                             │
│  [RESTORE FROM localStorage]│
│  ✓ Name: "John Doe"        │◄─── Restored
│  ✓ Email: "john@..."       │◄─── Restored
│  ✓ Phone, Date, Time...    │◄─── Restored
│  ✓ Special Requests:       │
│    "Pre-ordered: Premium   │◄─── Added drink info
│     Lager - £10.00"        │
└──────────────┬──────────────┘
               │ Submit booking
               ▼
┌─────────────────────────────┐
│  Final Booking Submission   │
│  [CLEAR localStorage]       │◄─── Clean up after success
└─────────────────────────────┘
```

---

## Code Examples: localStorage Implementation

### **Example 1: DrinksModal - Save Data Before Stripe Redirect**

```javascript
// In DrinksModal.js
import { v4 as uuidv4 } from 'uuid';

const DrinksModal = ({ 
  isOpen, 
  onClose, 
  formData // Pass all form data from Details page: { name, email, phone, date, time, etc. }
}) => {
  
  // Function to save data before redirecting to Stripe
  const handleDrinkSelection = (drinkName, stripeUrl) => {
    // 1. Generate unique booking reference
    const bookingRef = uuidv4(); // e.g., "a3f7b2c1-4d5e-6f7a-8b9c-0d1e2f3a4b5c"
    
    // 2. Prepare complete booking data
    const bookingData = {
      // All form fields
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      date: formData.date,
      time: formData.time,
      partySize: formData.partySize,
      specialRequests: formData.specialRequests,
      selectedArea: formData.selectedArea,
      restaurant: formData.restaurant,
      
      // Tracking info
      bookingReference: bookingRef,
      selectedDrink: drinkName,
      awaitingPayment: true,
      timestamp: Date.now()
    };
    
    // 3. Save to localStorage
    localStorage.setItem('pendingBookingData', JSON.stringify(bookingData));
    localStorage.setItem('bookingReference', bookingRef);
    localStorage.setItem('awaitingPayment', 'true');
    
    // 4. Now redirect to Stripe
    window.location.href = stripeUrl;
  };
  
  return (
    <div className="modal">
      <h2>Pre-Order Drinks</h2>
      
      {/* Option 1: Premium Lager */}
      <button onClick={() => handleDrinkSelection(
        'Premium Lager',
        'https://buy.stripe.com/test_xxxxx1' // Your Stripe link
      )}>
        Premium Lager - £10.00
      </button>
      
      {/* Option 2: Craft Beer */}
      <button onClick={() => handleDrinkSelection(
        'Craft Beer Selection',
        'https://buy.stripe.com/test_xxxxx2'
      )}>
        Craft Beer Selection - £15.00
      </button>
      
      {/* Option 3: Wine Package */}
      <button onClick={() => handleDrinkSelection(
        'Wine Package',
        'https://buy.stripe.com/test_xxxxx3'
      )}>
        Wine Package - £20.00
      </button>
    </div>
  );
};
```

### **Example 2: PaymentSuccess - Verify & Store Drink Info**

```javascript
// In PaymentSuccess.js
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [drinkInfo, setDrinkInfo] = useState(null);
  
  useEffect(() => {
    const verifyPayment = async () => {
      // 1. Get session_id from URL
      const sessionId = searchParams.get('session_id');
      
      if (!sessionId) {
        setError('No payment session found');
        setLoading(false);
        return;
      }
      
      try {
        // 2. Call backend to verify payment
        const response = await axios.get(
          `http://localhost:5000/api/verify-payment?session_id=${sessionId}`
        );
        
        if (response.data.success && response.data.paid) {
          // 3. Payment verified! Store drink info
          localStorage.setItem('drinkPurchased', 'true');
          localStorage.setItem('drinkName', response.data.drink);
          localStorage.setItem('drinkAmount', response.data.amount.toString());
          
          setDrinkInfo(response.data);
        } else {
          setError('Payment verification failed');
        }
      } catch (err) {
        setError('Error verifying payment: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    
    verifyPayment();
  }, [searchParams]);
  
  const handleContinue = () => {
    // Get booking data to determine which restaurant
    const bookingData = JSON.parse(localStorage.getItem('pendingBookingData'));
    const restaurant = bookingData?.restaurant;
    
    // Redirect back to appropriate Details page
    if (restaurant === 'griffin') {
      navigate('/griffin/details');
    } else if (restaurant === 'longhop') {
      navigate('/longhop/details');
    } else if (restaurant === 'tapandrun') {
      navigate('/tapandrun/details');
    } else {
      navigate('/'); // fallback
    }
  };
  
  if (loading) {
    return <div>Verifying payment...</div>;
  }
  
  if (error) {
    return (
      <div>
        <h2>Payment Verification Failed</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/')}>Go Home</button>
      </div>
    );
  }
  
  return (
    <div>
      <h2>✓ Payment Successful!</h2>
      <p>Thank you for pre-ordering: {drinkInfo.drink}</p>
      <p>Amount paid: £{drinkInfo.amount}</p>
      <button onClick={handleContinue}>Continue with Booking</button>
    </div>
  );
};

export default PaymentSuccess;
```

### **Example 3: Details Page - Restore Form Data & Add Drink**

```javascript
// In Details.js (or longhopDetails.js, topDetails.js)
import { useEffect, useState } from 'react';

const Details = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [partySize, setPartySize] = useState(0);
  const [specialRequests, setSpecialRequests] = useState('');
  
  useEffect(() => {
    // 1. Check if there's pending booking data
    const savedData = localStorage.getItem('pendingBookingData');
    
    if (savedData) {
      const bookingData = JSON.parse(savedData);
      
      // 2. Restore all form fields
      setName(bookingData.name || '');
      setEmail(bookingData.email || '');
      setPhone(bookingData.phone || '');
      setDate(bookingData.date || '');
      setTime(bookingData.time || '');
      setPartySize(bookingData.partySize || 0);
      
      // 3. Check if drink was purchased
      const drinkPurchased = localStorage.getItem('drinkPurchased');
      
      if (drinkPurchased === 'true') {
        const drinkName = localStorage.getItem('drinkName');
        const drinkAmount = localStorage.getItem('drinkAmount');
        
        // 4. Build drink info text
        const drinkInfo = `Pre-ordered: ${drinkName} - £${drinkAmount}`;
        
        // 5. Append to special requests
        const existingRequests = bookingData.specialRequests || '';
        const newRequests = existingRequests 
          ? `${existingRequests}\n${drinkInfo}` 
          : drinkInfo;
        
        setSpecialRequests(newRequests);
        
        // 6. Clear drink flags (keep form data for now)
        localStorage.removeItem('drinkPurchased');
        localStorage.removeItem('drinkName');
        localStorage.removeItem('drinkAmount');
      } else {
        // No drink purchase, just restore special requests
        setSpecialRequests(bookingData.specialRequests || '');
      }
    }
  }, []);
  
  const handleSubmitBooking = async () => {
    // ... submit booking logic ...
    
    // After successful booking submission:
    try {
      // Submit to backend
      const response = await submitBooking({ name, email, phone, date, time, partySize, specialRequests });
      
      if (response.success) {
        // Clear ALL localStorage after successful booking
        localStorage.removeItem('pendingBookingData');
        localStorage.removeItem('bookingReference');
        localStorage.removeItem('awaitingPayment');
        localStorage.removeItem('drinkPurchased');
        localStorage.removeItem('drinkName');
        localStorage.removeItem('drinkAmount');
        
        // Navigate to confirmation page
        navigate('/booked');
      }
    } catch (error) {
      console.error('Booking error:', error);
    }
  };
  
  return (
    <div>
      <h2>Enter Your Details</h2>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" />
      <input value={date} onChange={(e) => setDate(e.target.value)} type="date" />
      <input value={time} onChange={(e) => setTime(e.target.value)} type="time" />
      <input value={partySize} onChange={(e) => setPartySize(e.target.value)} type="number" />
      <textarea 
        value={specialRequests} 
        onChange={(e) => setSpecialRequests(e.target.value)} 
        placeholder="Special Requests"
      />
      
      <button onClick={handleSubmitBooking}>Complete Booking</button>
    </div>
  );
};
```

---

## Database Schema (Optional)

### **Payments Collection/Table**

```javascript
{
  _id: ObjectId,
  session_id: String (unique),
  booking_reference: String,
  drink_name: String,
  amount: Number,
  currency: String,
  payment_status: String, // 'paid', 'unpaid', 'refunded'
  stripe_customer_id: String,
  created_at: Date,
  verified_at: Date
}
```

---

## Success Criteria

✅ User can select drink and pay via Stripe
✅ Payment verification is secure (backend validates with Stripe)
✅ Special Requests field auto-populated after successful payment
✅ Works across all 6 details pages (Griffin, Long Hop, Tap & Run)
✅ Handles errors gracefully (cancelled payments, network issues)
✅ localStorage cleaned after booking complete
✅ Works even if user closes browser after payment

---

## Timeline Estimate

- **Phase 1-2** (Backend Setup): 2-3 hours
- **Phase 3** (Webhooks - Optional): 1-2 hours
- **Phase 4-5** (Frontend Success Page & Modal): 2-3 hours
- **Phase 6** (Details Pages Update): 2-3 hours
- **Phase 7-8** (Routes & Stripe Config): 1 hour
- **Phase 9** (Testing): 2-3 hours
- **Phase 10** (Deployment): 2-3 hours

**Total**: 12-18 hours

---

## Notes & Considerations

1. **Security**: Never trust frontend alone - always verify payments on backend
2. **localStorage**: Good for temporary storage, but not 100% reliable (user can clear)
3. **Webhooks**: Add them for production to have permanent records
4. **Error Handling**: Always show user-friendly messages
5. **Testing**: Test with Stripe test mode extensively before going live
6. **Mobile**: Ensure payment flow works on mobile browsers
7. **Session Expiry**: Stripe sessions expire after 24 hours
8. **Multiple Drinks**: Current design supports 1 drink per booking (adjust if needed)

---

## Questions to Resolve

- [ ] Which database to use? (MongoDB recommended)
- [ ] Where to deploy backend? (Heroku/Railway recommended for easy setup)
- [ ] Should webhooks be implemented in Phase 1 or later?
- [ ] Should users be able to buy multiple drinks per booking?
- [ ] Should drink info be editable in Special Requests after auto-fill?

---

## Next Steps

1. Review this plan and confirm approach
2. Choose database (or skip for MVP)
3. Start with Phase 1: Backend Setup
4. Test each phase before moving to next
5. Deploy when all testing passes

---

**Ready to start implementation!** 🚀

