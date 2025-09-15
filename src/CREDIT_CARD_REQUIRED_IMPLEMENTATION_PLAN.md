# CreditCardRequired Status Implementation Plan

## Overview
This document outlines the implementation plan for handling the `CreditCardRequired` status in the booking flow. When the API returns `Status: "CreditCardRequired"`, the application needs to implement a two-step process: first create a booking without payment method, then complete it with Stripe payment method.

## Current State Analysis

### Existing Components
- **TopConfirm.js**: Main booking confirmation page with `handleBooking` function
- **PaymentModal.js**: Modal component for payment processing
- **StripePaymentForm.js**: Stripe payment form component
- **App.js**: Stripe Elements provider setup

### Current Flow Issues
1. The current `handleBooking` function doesn't handle different response statuses
2. No logic to detect `CreditCardRequired` vs `PaymentRequired` status
3. Payment modal is conditionally shown but not properly integrated with the new flow
4. Stripe initialization uses environment variable instead of dynamic keys from API response

## Implementation Plan

### Phase 1: Response Status Detection & Flow Control

#### 1.1 Update TopConfirm.js - handleBooking Function
**File**: `src/Pages/topConfirm/TopConfirm.js`

**Changes**:
- Modify `handleBooking` to handle different response statuses
- Add status detection logic for `CreditCardRequired` and `PaymentRequired`
- Implement conditional flow based on response status

**New Flow**:
```javascript
const handleBooking = async () => {
  setIsLoading(true);
  setError('');
  
  try {
    // First API call without payment method
    const response = await postRequest(/* booking data without stripePaymentMethodId */);
    
    // Check response status
    switch (response.data.Status) {
      case 'CreditCardRequired':
        // Show payment modal with Stripe setup
        setShowPaymentModal(true);
        // Store response data for second API call
        setBookingResponse(response.data);
        break;
      case 'PaymentRequired':
        // Handle payment required flow
        setShowPaymentModal(true);
        setBookingResponse(response.data);
        break;
      case 'Success':
        // Direct success - navigate to booked page
        dispatch(addSuccessBookingData(response.data));
        navigate('/topBooked');
        break;
      default:
        setError('Unexpected response status');
    }
  } catch (error) {
    setError('Booking failed. Please try again.');
  } finally {
    setIsLoading(false);
  }
};
```

#### 1.2 Add New State Variables
**File**: `src/Pages/topConfirm/TopConfirm.js`

**New State**:
```javascript
const [bookingResponse, setBookingResponse] = useState(null);
const [paymentStatus, setPaymentStatus] = useState(null);
```

### Phase 2: Enhanced Payment Modal Integration

#### 2.1 Update PaymentModal Component
**File**: `src/components/PaymentModal/PaymentModal.js`

**Changes**:
- Accept `bookingResponse` prop containing Stripe configuration
- Pass Stripe keys from API response to StripePaymentForm
- Handle different payment statuses

**New Props**:
```javascript
export default function PaymentModal({
  isOpen,
  onClose,
  bookingData,
  bookingResponse, // New: Contains Stripe keys and setup intent
  onSuccess,
  onError
}) {
```

#### 2.2 Update StripePaymentForm Component
**File**: `src/components/StripePaymentForm/StripePaymentForm.js`

**Changes**:
- Accept dynamic Stripe configuration from API response
- Implement two-step booking process
- Handle SetupIntent for 3DS2 authentication
- Use `SetupIntentClientSecret` from API response

**New Flow**:
```javascript
const handleSubmit = async (event) => {
  // 1. Create payment method with Stripe
  const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
    type: 'card',
    card: elements.getElement(CardElement),
  });

  // 2. Confirm setup intent if provided
  if (bookingResponse.SetupIntentClientSecret) {
    const { error: confirmError } = await stripe.confirmSetupIntent(
      bookingResponse.SetupIntentClientSecret,
      {
        payment_method: paymentMethod.id,
      }
    );
  }

  // 3. Second API call with payment method
  const response = await postRequest(/* booking data with stripePaymentMethodId */);
  
  // 4. Handle success
  onSuccess(response.data);
};
```

### Phase 3: Dynamic Stripe Configuration

#### 3.1 Create Stripe Context Provider
**File**: `src/contexts/StripeContext.js` (New)

**Purpose**: Manage dynamic Stripe configuration from API responses

**Features**:
- Store Stripe publishable key and account ID
- Provide Stripe instance with dynamic configuration
- Handle multiple Stripe accounts

#### 3.2 Update App.js
**File**: `src/App.js`

**Changes**:
- Wrap app with StripeContext provider
- Use dynamic Stripe configuration instead of environment variable

### Phase 4: Error Handling & User Experience

#### 4.1 Enhanced Error Handling
**Files**: Multiple components

**Improvements**:
- Specific error messages for different failure scenarios
- Retry mechanisms for failed payments
- Clear user feedback for each step

#### 4.2 Loading States
**Files**: TopConfirm.js, PaymentModal.js, StripePaymentForm.js

**Features**:
- Step-by-step loading indicators
- Disable form during processing
- Clear progress feedback

### Phase 5: Testing & Validation

#### 5.1 Test Scenarios
1. **CreditCardRequired Flow**:
   - First API call returns `CreditCardRequired`
   - Payment modal opens with correct Stripe configuration
   - Payment method creation succeeds
   - Second API call with payment method succeeds
   - Booking confirmation

2. **PaymentRequired Flow**:
   - Similar to CreditCardRequired but with different messaging
   - Payment amount display if applicable

3. **Error Scenarios**:
   - Stripe payment method creation fails
   - Second API call fails
   - Network errors
   - Invalid card details

#### 5.2 Edge Cases
- Expired setup intent
- Multiple payment attempts
- Browser refresh during payment
- Network connectivity issues

## Implementation Steps

### Step 1: Update TopConfirm.js (Priority: High)
- [ ] Modify `handleBooking` function to detect response status
- [ ] Add state management for booking response
- [ ] Implement conditional flow logic
- [ ] Update payment modal integration

### Step 2: Enhance PaymentModal.js (Priority: High)
- [ ] Accept booking response prop
- [ ] Pass Stripe configuration to payment form
- [ ] Update success/error handling

### Step 3: Update StripePaymentForm.js (Priority: High)
- [ ] Implement two-step booking process
- [ ] Add SetupIntent confirmation
- [ ] Handle dynamic Stripe configuration
- [ ] Improve error handling

### Step 4: Create StripeContext.js (Priority: Medium)
- [ ] Implement dynamic Stripe configuration
- [ ] Handle multiple Stripe accounts
- [ ] Provide Stripe instance management

### Step 5: Update App.js (Priority: Medium)
- [ ] Integrate StripeContext provider
- [ ] Remove hardcoded Stripe configuration

### Step 6: Testing & Refinement (Priority: High)
- [ ] Test all payment flows
- [ ] Validate error handling
- [ ] Performance optimization
- [ ] User experience improvements

## API Integration Details

### First API Call (CreateBookingWithStripeToken)
**Endpoint**: `/api/ConsumerApi/v1/Restaurant/CatWicketsTest/BookingWithStripeToken`
**Method**: POST
**Data**: Booking data WITHOUT `stripePaymentMethodId`

**Expected Response for CreditCardRequired**:
```json
{
  "Status": "CreditCardRequired",
  "StripePublishableKey": "pk_test_...",
  "StripeAccountId": "acct_...",
  "SetupIntentClientSecret": "seti_...",
  "Booking": { /* booking details */ }
}
```

### Second API Call (CreateBookingWithStripeToken)
**Endpoint**: `/api/ConsumerApi/v1/Restaurant/CatWicketsTest/BookingWithStripeToken`
**Method**: POST
**Data**: Booking data WITH `stripePaymentMethodId`

**Expected Response for Success**:
```json
{
  "Status": "Success",
  "Booking": { /* confirmed booking details */ }
}
```

## Security Considerations

1. **Stripe Keys**: Use dynamic keys from API response, not hardcoded values
2. **Payment Method**: Never store payment method details on client
3. **Setup Intent**: Use for 3DS2 authentication when required
4. **Error Handling**: Don't expose sensitive error details to users

## Performance Considerations

1. **Lazy Loading**: Load Stripe components only when needed
2. **Caching**: Cache Stripe configuration for session
3. **Error Recovery**: Implement retry mechanisms
4. **Loading States**: Provide clear feedback during processing

## Future Enhancements

1. **Payment Methods**: Support multiple payment methods
2. **Saved Cards**: Allow users to save payment methods
3. **Subscription**: Support recurring payments
4. **Analytics**: Track payment success/failure rates
5. **A/B Testing**: Test different payment flows

## Dependencies

- `@stripe/react-stripe-js`: ^3.7.0 (already installed)
- `@stripe/stripe-js`: ^7.4.0 (already installed)
- React Context API (built-in)
- Existing Redux store for state management

## Timeline Estimate

- **Phase 1-2**: 2-3 days (Core functionality)
- **Phase 3**: 1-2 days (Dynamic configuration)
- **Phase 4**: 1 day (Error handling)
- **Phase 5**: 1-2 days (Testing & refinement)

**Total Estimated Time**: 5-8 days

## Success Criteria

1. ✅ CreditCardRequired status properly detected
2. ✅ Payment modal opens with correct Stripe configuration
3. ✅ Two-step booking process works correctly
4. ✅ 3DS2 authentication handled properly
5. ✅ Error handling covers all scenarios
6. ✅ User experience is smooth and intuitive
7. ✅ All existing functionality remains intact
