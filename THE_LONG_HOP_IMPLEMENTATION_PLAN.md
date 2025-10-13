# The Long Hop Implementation Plan

## 🎯 Overview
This document outlines the complete implementation plan for adding "The Long Hop" as a third pub to the existing booking widget system. The implementation follows the same pattern as the existing "Tap & Run" and "Griffin Inn" pubs.

## 🔄 User Flow Diagrams

### 📅 New Booking Flow
```
Home Page (/)
    ↓
Pub Selection (/select)
    ↓
Long Hop Main Page (/longhop)
    ↓
Area Selection (/longhoparea)
    ↓
Details Form (/longhopdetails)
    ↓
Confirmation (/longhopconfirm)
    ↓
Payment Processing
    ↓
Booking Success (/longhopbooked)
```

### ✏️ Modify/Edit Existing Booking Flow
```
Booking Number Entry (/longhopbookingnumber)
    ↓
Booking Details Retrieved
    ↓
Modify Options (/longhopmodify)
    ↓
Edit Booking Form (/longhopedit)
    ↓
Pick New Area (/longhoppickarea)
    ↓
Update Details (/longhopredetail)
    ↓
Confirmation (/longhopconfirmed)
    ↓
Updated Success (/longhopupdated)
```

### 🏠 Alternative Entry Points
```
Direct Links:
- Lost Booking (/longhoplost)
- Resend Confirmation (/longhopresent)
- Cancel Booking (/longhopcancel)
- Cancelled Confirmation (/longhopcancelled)
- Home (/longhophome)
```

### 🔄 Complete Flow with All Paths
```
┌─────────────────┐
│   Home Page     │
│       /         │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Pub Selection   │
│    /select      │
└─────────┬───────┘
          │
    ┌─────┼─────┐
    │     │     │
    ▼     ▼     ▼
┌────────┐ ┌────────┐ ┌─────────────┐
│Tap&Run │ │Griffin │ │  Long Hop   │
│/topandrun│ │/griffin│ │  /longhop   │
└────────┘ └────────┘ └─────────────┘
          │
          ▼
┌─────────────────┐
│ Area Selection  │
│ /longhoparea    │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Details Form    │
│/longhopdetails  │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Confirmation    │
│/longhopconfirm  │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Payment Modal   │
│   Processing    │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Booking Success │
│ /longhopbooked  │
└─────────────────┘

┌─────────────────┐
│ Booking Number  │
│/longhopbooking  │
│    number       │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Modify Options  │
│/longhopmodify   │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Edit Booking    │
│/longhopedit     │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Pick New Area   │
│/longhoppickarea │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Update Details  │
│/longhopredetail │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Confirmation    │
│/longhopconfirmed│
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Updated Success │
│/longhopupdated  │
└─────────────────┘
```

### 🔧 Technical Flow with API Interactions
```
┌─────────────────┐
│ User Selects    │
│ "The Long Hop"  │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Navigate to     │
│ /longhop        │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐    ┌─────────────────┐
│ User Fills      │◄──►│ API: Get        │
│ Date/Time/      │    │ Availability    │
│ Party Size      │    │ /availability   │
└─────────┬───────┘    └─────────────────┘
          │
          ▼
┌─────────────────┐
│ Navigate to     │
│ /longhoparea    │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐    ┌─────────────────┐
│ User Selects    │◄──►│ API: Get        │
│ Area/Promotion  │    │ Promotions      │
│                 │    │ /promotion      │
└─────────┬───────┘    └─────────────────┘
          │
          ▼
┌─────────────────┐
│ Navigate to     │
│ /longhopdetails │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ User Fills      │
│ Customer Details│
│ & Special Req.  │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Navigate to     │
│ /longhopconfirm │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐    ┌─────────────────┐
│ Payment Modal   │◄──►│ Stripe API      │
│ Opens           │    │ Payment         │
└─────────┬───────┘    └─────────────────┘
          │
          ▼
┌─────────────────┐    ┌─────────────────┐
│ Payment         │◄──►│ API: Create     │
│ Processing      │    │ Booking         │
│                 │    │ /booking        │
└─────────┬───────┘    └─────────────────┘
          │
          ▼
┌─────────────────┐
│ Navigate to     │
│ /longhopbooked  │
└─────────────────┘
```

### 📝 Modify/Edit Technical Flow
```
┌─────────────────┐
│ User Enters     │
│ Booking Number  │
│ /longhopbooking │
│ number          │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐    ┌─────────────────┐
│ Validate        │◄──►│ API: Get        │
│ Booking Number  │    │ Booking Details │
│                 │    │ /booking-details│
└─────────┬───────┘    └─────────────────┘
          │
          ▼
┌─────────────────┐
│ Navigate to     │
│ /longhopmodify  │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐    ┌─────────────────┐
│ User Selects    │◄──►│ API: Get        │
│ What to Modify  │    │ Current         │
│                 │    │ Availability    │
└─────────┬───────┘    └─────────────────┘
          │
          ▼
┌─────────────────┐
│ Navigate to     │
│ /longhopedit    │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ User Updates    │
│ Date/Time/Area  │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Navigate to     │
│ /longhoppickarea│
└─────────┬───────┘
          │
          ▼
┌─────────────────┐    ┌─────────────────┐
│ User Confirms   │◄──►│ API: Update     │
│ Changes         │    │ Booking         │
└─────────┬───────┘    └─────────────────┘
          │
          ▼
┌─────────────────┐
│ Navigate to     │
│ /longhopupdated │
└─────────────────┘
```

### 🗂️ Data Flow and State Management
```
Redux State Updates:
┌─────────────────┐
│ pubType:        │
│ 'longHop'       │
└─────────────────┘
          │
          ▼
┌─────────────────┐
│ selectedPub:    │
│ 'TheLongHop'    │
└─────────────────┘
          │
          ▼
┌─────────────────┐
│ API Calls Use:  │
│ RestaurantName: │
│ 'TheLongHop'    │
└─────────────────┘
          │
          ▼
┌─────────────────┐
│ All Pages Use:  │
│ Long Hop Branding│
│ & Images        │
└─────────────────┘
```

### 🔄 Flow Comparison: Existing vs New
```
Existing Pubs (Tap & Run / Griffin):
┌─────────────────┐
│ /select         │
└─────────┬───────┘
          │
    ┌─────┴─────┐
    ▼           ▼
┌───────┐  ┌────────┐
│/topandrun│ │/griffin│
└───┬───┘  └───┬────┘
    │          │
    ▼          ▼
┌───────┐  ┌────────┐
│/TopArea│  │/Area   │
└───┬───┘  └───┬────┘
    │          │
    ▼          ▼
┌───────┐  ┌────────┐
│/TopDetails│ │/Details │
└───┬───┘  └───┬────┘
    │          │
    ▼          ▼
┌───────┐  ┌────────┐
│/TopConfirm│ │/Confirm │
└───┬───┘  └───┬────┘
    │          │
    ▼          ▼
┌───────┐  ┌────────┐
│/TopBooked│ │/Booked │
└─────────┘  └────────┘

All Pubs (After Long Hop Addition):
┌─────────────────┐
│ /select         │
└─────────┬───────┘
          │
    ┌─────┼─────┐
    │     │     │
    ▼     ▼     ▼
┌────────┐ ┌────────┐ ┌─────────────┐
│Tap&Run │ │Griffin │ │  Long Hop   │
│/topandrun│ │/griffin│ │  /longhop   │
└────────┘ └────────┘ └─────────────┘

New Long Hop Flow:
┌─────────────────┐
│ /select         │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ /longhop        │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ /longhoparea    │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ /longhopdetails │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ /longhopconfirm │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ /longhopbooked  │
└─────────────────┘
```

### 📊 Page Mapping Reference
```
Existing Griffin Pages → New Long Hop Pages:
/griffin           → /longhop
/Area              → /longhoparea
/Details           → /longhopdetails
/Confirm           → /longhopconfirm
/Booked            → /longhopbooked
/Modify            → /longhopmodify
/Edit              → /longhopedit
/PickArea          → /longhoppickarea
/ReDetail          → /longhopredetail
/Confirmed         → /longhopconfirmed
/Updated           → /longhopupdated
/Cancel            → /longhopcancel
/BookingN          → /longhopbookingnumber
/Lost              → /longhoplost
/ReSent            → /longhopresent
/Cancelled         → /longhopcancelled
/home              → /longhophome

Existing Tap & Run Pages → New Long Hop Pages:
/topandrun         → /longhop
/TopArea           → /longhoparea
/TopDetails        → /longhopdetails
/TopConfirm        → /longhopconfirm
/TopBooked         → /longhopbooked
/TopModify         → /longhopmodify
/TopEdit           → /longhopedit
/TopPickArea       → /longhoppickarea
/TopReDetail       → /longhopredetail
/TopConfirmed      → /longhopconfirmed
/TopUpdate         → /longhopupdated
/TopCancel         → /longhopcancel
/TopBookingNumber  → /longhopbookingnumber
/TopLost           → /longhoplost
/TopResent         → /longhopresent
/TopCancelled      → /longhopcancelled
/TopHome           → /longhophome
```

## 📋 Implementation Steps

### 1. **API Configuration Updates**

#### 1.1 Update `src/config/api.js`
- **Action**: Add "TheLongHop" to restaurant IDs configuration
- **Changes**:
  ```javascript
  // Add to both sandbox and production configs
  restaurantIds: {
    tapAndRun: 'TheTapRun',
    griffin: 'TheGriffinInn',
    longHop: 'TheLongHop'  // NEW
  },
  promotionIds: {
    tapAndRun: [],
    griffin: [],
    longHop: []  // NEW - to be updated with production IDs
  }
  ```

#### 1.2 Update `src/utils/restaurantUtils.js`
- **Action**: Extend `getCurrentRestaurant` function to handle 'longHop' pubType
- **Changes**:
  ```javascript
  // Add case for 'longHop' pubType
  case 'longHop':
    return 'TheLongHop';
  ```

#### 1.3 Update `src/store/bookingSlice.js`
- **Action**: Ensure pubType supports 'longHop' value
- **Note**: Current implementation already supports dynamic pubType values

### 2. **API Proxy Updates**

#### 2.1 Update `api/availability.js`
- **Action**: Add "TheLongHop" to URL detection logic
- **Changes**:
  ```javascript
  // Add to URL checks
  originalUrl.includes('/api/ConsumerApi/v1/Restaurant/TheLongHop/AvailabilitySearch')
  ```

#### 2.2 Update `api/availability-range.js`
- **Action**: Add "TheLongHop" to URL detection logic
- **Changes**:
  ```javascript
  // Add to URL checks
  originalUrl.includes('/api/ConsumerApi/v1/Restaurant/TheLongHop/AvailabilityForDateRangeV2')
  ```

#### 2.3 Update `api/booking.js`
- **Action**: Add "TheLongHop" to fallback defaults
- **Changes**:
  ```javascript
  // Update fallback logic to handle TheLongHop
  const restaurantName = req.body.RestaurantName || 'TheTapRun';
  ```

#### 2.4 Update `api/booking-details.js`
- **Action**: Add "TheLongHop" to URL detection logic
- **Changes**:
  ```javascript
  // Add to URL checks for booking details
  originalUrl.includes('/api/ConsumerApi/v1/Restaurant/TheLongHop/Booking/')
  ```

#### 2.5 Update `api/promotion.js`
- **Action**: Add "TheLongHop" to fallback defaults
- **Changes**:
  ```javascript
  // Update fallback logic
  const restaurantName = req.query.restaurantName || 'TheTapRun';
  ```

### 3. **Axios Interceptor Updates**

#### 3.1 Update `src/config/AxiosRoutes/index.js`
- **Action**: Add "TheLongHop" to all URL transformation logic
- **Changes**:
  ```javascript
  // Add to AvailabilitySearch checks
  originalUrl.includes('/api/ConsumerApi/v1/Restaurant/TheLongHop/AvailabilitySearch')
  
  // Add to AvailabilityForDateRangeV2 checks
  originalUrl.includes('/api/ConsumerApi/v1/Restaurant/TheLongHop/AvailabilityForDateRangeV2')
  
  // Add to BookingWithStripeToken checks
  originalUrl.includes('/api/ConsumerApi/v1/Restaurant/TheLongHop/BookingWithStripeToken')
  
  // Add to BookingDetails checks
  originalUrl.includes('/api/ConsumerApi/v1/Restaurant/TheLongHop/Booking/')
  ```

### 4. **Page Components Creation**

#### 4.1 Create Main Booking Page
- **File**: `src/Pages/longhop/LongHop.js`
- **Based on**: `src/Pages/griffin/griffin.js`
- **Changes**:
  - Import Long Hop logo: `import logo from "../../images/The Long Hop - text.png"`
  - Import Long Hop main image: `import sectionimage from "../../images/TheLongHop_MainiMAGE.jpg"`
  - Set `pubType: 'longHop'` in Redux dispatch
  - Update component name and styling references

#### 4.2 Create Area Selection Page
- **File**: `src/Pages/longhopArea/LongHopArea.js`
- **Based on**: `src/Pages/Area/Area.js`
- **Changes**:
  - Update pubType references to 'longHop'
  - Update restaurant name to 'TheLongHop'

#### 4.3 Create Details Page
- **File**: `src/Pages/longhopDetails/LongHopDetails.js`
- **Based on**: `src/Pages/Details/Details.js`
- **Changes**:
  - Update pubType references to 'longHop'
  - Update restaurant name to 'TheLongHop'

#### 4.4 Create Confirmation Page
- **File**: `src/Pages/longhopConfirm/LongHopConfirm.js`
- **Based on**: `src/Pages/confirm/Confirm.js`
- **Changes**:
  - Update pubType references to 'longHop'
  - Update restaurant name to 'TheLongHop'

#### 4.5 Create Booked Success Page
- **File**: `src/Pages/longhopBooked/LongHopBooked.js`
- **Based on**: `src/Pages/booked/Booked.js`
- **Changes**:
  - Update pubType references to 'longHop'
  - Update restaurant name to 'TheLongHop'

#### 4.6 Create Modify Page
- **File**: `src/Pages/longhopModify/LongHopModify.js`
- **Based on**: `src/Pages/Modify/Modify.js`
- **Changes**:
  - Update pubType references to 'longHop'
  - Update restaurant name to 'TheLongHop'

#### 4.7 Create Edit Page
- **File**: `src/Pages/longhopEdit/LongHopEdit.js`
- **Based on**: `src/Pages/edit/Edit.js`
- **Changes**:
  - Update pubType references to 'longHop'
  - Update restaurant name to 'TheLongHop'

#### 4.8 Create Pick Area Page
- **File**: `src/Pages/longhopPickArea/LongHopPickArea.js`
- **Based on**: `src/Pages/PickArea/PickArea.js`
- **Changes**:
  - Update pubType references to 'longHop'
  - Update restaurant name to 'TheLongHop'

#### 4.9 Create Re-Detail Page
- **File**: `src/Pages/longhopReDetail/LongHopReDetail.js`
- **Based on**: `src/Pages/reDetail/ReDetail.js`
- **Changes**:
  - Update pubType references to 'longHop'
  - Update restaurant name to 'TheLongHop'

#### 4.10 Create Confirmed Page
- **File**: `src/Pages/longhopConfirmed/LongHopConfirmed.js`
- **Based on**: `src/Pages/confrimed/Confirmed.js`
- **Changes**:
  - Update pubType references to 'longHop'
  - Update restaurant name to 'TheLongHop'

#### 4.11 Create Updated Page
- **File**: `src/Pages/longhopUpdated/LongHopUpdated.js`
- **Based on**: `src/Pages/updated/Updated.js`
- **Changes**:
  - Update pubType references to 'longHop'
  - Update restaurant name to 'TheLongHop'

#### 4.12 Create Cancel Page
- **File**: `src/Pages/longhopCancel/LongHopCancel.js`
- **Based on**: `src/Pages/cancel/Cancel.js`
- **Changes**:
  - Update pubType references to 'longHop'
  - Update restaurant name to 'TheLongHop'

#### 4.13 Create Booking Number Page
- **File**: `src/Pages/longhopBookingNumber/LongHopBookingNumber.js`
- **Based on**: `src/Pages/bookingNumber/BookingN.js`
- **Changes**:
  - Update pubType references to 'longHop'
  - Update restaurant name to 'TheLongHop'

#### 4.14 Create Lost Page
- **File**: `src/Pages/longhopLost/LongHopLost.js`
- **Based on**: `src/Pages/lost/Lost.js`
- **Changes**:
  - Update pubType references to 'longHop'
  - Update restaurant name to 'TheLongHop'

#### 4.15 Create Resent Page
- **File**: `src/Pages/longhopResent/LongHopResent.js`
- **Based on**: `src/Pages/reSent/ReSent.js`
- **Changes**:
  - Update pubType references to 'longHop'
  - Update restaurant name to 'TheLongHop'

#### 4.16 Create Cancelled Page
- **File**: `src/Pages/longhopCancelled/LongHopCancelled.js`
- **Based on**: `src/Pages/cancelled/cancelled.js`
- **Changes**:
  - Update pubType references to 'longHop'
  - Update restaurant name to 'TheLongHop'

#### 4.17 Create Home Page
- **File**: `src/Pages/longhopHome/LongHopHome.js`
- **Based on**: `src/Pages/home/Home.js`
- **Changes**:
  - Update pubType references to 'longHop'
  - Update restaurant name to 'TheLongHop'

### 5. **CSS Module Files Creation**

#### 5.1 Create CSS Files for Each Page
- **Files**: Create corresponding `.module.css` files for each Long Hop page
- **Based on**: Copy existing CSS files from Griffin or Tap & Run pages
- **Changes**: Update class names and styling as needed for Long Hop branding

### 6. **Routing Configuration**

#### 6.1 Update `src/config/router/index.js`
- **Action**: Add all Long Hop routes
- **Changes**:
  ```javascript
  // Import all Long Hop components
  import LongHop from '../../Pages/longhop/LongHop'
  import LongHopArea from '../../Pages/longhopArea/LongHopArea'
  import LongHopDetails from '../../Pages/longhopDetails/LongHopDetails'
  // ... import all other Long Hop components
  
  // Add routes
  <Route path="/longhop" element={<LongHop />} />
  <Route path="/longhoparea" element={<LongHopArea />} />
  <Route path="/longhopdetails" element={<LongHopDetails />} />
  // ... add all other Long Hop routes
  ```

### 7. **Pub Selection Page Update**

#### 7.1 Update `src/Pages/select/Select.js`
- **Action**: Add Long Hop option to pub selection
- **Changes**:
  ```javascript
  // Add Long Hop section
  <div className={styles.select_typee}>
    <img src={longhoplogo} alt="Logo_The Long Hop" className={styles.logos} />
    <p className={styles.texttoprun}>
      [Long Hop Address] <br /> [Post Code], United Kingdom
    </p>
    <a href="tel:+44[PhoneNumber]" className={styles.numbrtag}>
      +44[PhoneNumber]
    </a>
    <CustomButton
      label="SELECT"
      to="/longhop"
      bgColor="#C39A7B"
      color="#FFFCF7"
    />
  </div>
  ```

### 8. **Image Assets**

#### 8.1 Image Files Already Available
- ✅ `src/images/The Long Hop - text.png` - Logo (already in project)
- ✅ `src/images/TheLongHop_MainiMAGE.jpg` - Main image (already in project)

#### 8.2 Update CSS for Long Hop Styling
- **Action**: Update any CSS files that reference specific pub images
- **Note**: Ensure Long Hop images are properly referenced in components

### 9. **Environment Configuration**

#### 9.1 Production Deployment
- **Action**: Update production environment variables if needed
- **Note**: Ensure "TheLongHop" is configured in the backend API system

#### 9.2 API Endpoints
- **Action**: Verify all API endpoints support "TheLongHop" microsite name
- **Endpoints to verify**:
  - Availability Search
  - Availability For Date Range
  - Booking With Stripe Token
  - Promotion
  - Booking Details

### 10. **Testing Checklist**

#### 10.1 Functional Testing
- [ ] Pub selection page shows Long Hop option
- [ ] Long Hop booking flow works end-to-end
- [ ] API calls use correct "TheLongHop" microsite name
- [ ] All Long Hop pages render correctly
- [ ] Navigation between Long Hop pages works
- [ ] Payment integration works for Long Hop
- [ ] Booking confirmation works for Long Hop

#### 10.2 Visual Testing
- [ ] Long Hop logo displays correctly
- [ ] Long Hop main image displays correctly
- [ ] All Long Hop pages have consistent styling
- [ ] Responsive design works on mobile/tablet

#### 10.3 API Testing
- [ ] Availability search returns data for Long Hop
- [ ] Booking creation works for Long Hop
- [ ] Promotion data loads for Long Hop
- [ ] Booking details retrieval works for Long Hop

## 📁 File Structure After Implementation

```
src/
├── Pages/
│   ├── longhop/
│   │   ├── LongHop.js
│   │   └── LongHop.module.css
│   ├── longhopArea/
│   │   ├── LongHopArea.js
│   │   └── LongHopArea.module.css
│   ├── longhopDetails/
│   │   ├── LongHopDetails.js
│   │   └── LongHopDetails.module.css
│   ├── longhopConfirm/
│   │   ├── LongHopConfirm.js
│   │   └── LongHopConfirm.module.css
│   ├── longhopBooked/
│   │   ├── LongHopBooked.js
│   │   └── LongHopBooked.module.css
│   ├── longhopModify/
│   │   ├── LongHopModify.js
│   │   └── LongHopModify.module.css
│   ├── longhopEdit/
│   │   ├── LongHopEdit.js
│   │   └── LongHopEdit.module.css
│   ├── longhopPickArea/
│   │   ├── LongHopPickArea.js
│   │   └── LongHopPickArea.module.css
│   ├── longhopReDetail/
│   │   ├── LongHopReDetail.js
│   │   └── LongHopReDetail.module.css
│   ├── longhopConfirmed/
│   │   ├── LongHopConfirmed.js
│   │   └── LongHopConfirmed.module.css
│   ├── longhopUpdated/
│   │   ├── LongHopUpdated.js
│   │   └── LongHopUpdated.module.css
│   ├── longhopCancel/
│   │   ├── LongHopCancel.js
│   │   └── LongHopCancel.module.css
│   ├── longhopBookingNumber/
│   │   ├── LongHopBookingNumber.js
│   │   └── LongHopBookingNumber.module.css
│   ├── longhopLost/
│   │   ├── LongHopLost.js
│   │   └── LongHopLost.module.css
│   ├── longhopResent/
│   │   ├── LongHopResent.js
│   │   └── LongHopResent.module.css
│   ├── longhopCancelled/
│   │   ├── LongHopCancelled.js
│   │   └── LongHopCancelled.module.css
│   └── longhopHome/
│       ├── LongHopHome.js
│       └── LongHopHome.module.css
├── config/
│   └── api.js (updated)
├── utils/
│   └── restaurantUtils.js (updated)
├── store/
│   └── bookingSlice.js (already supports dynamic pubType)
└── config/AxiosRoutes/
    └── index.js (updated)
```

## 🔧 Implementation Priority

1. **High Priority** (Core Functionality):
   - API configuration updates
   - Main Long Hop booking page
   - Routing configuration
   - Pub selection page update

2. **Medium Priority** (Complete Booking Flow):
   - Area selection page
   - Details page
   - Confirmation page
   - Booked success page

3. **Lower Priority** (Additional Features):
   - Modify/Edit pages
   - All other utility pages
   - CSS styling refinements

## ⚠️ Important Notes

1. **Microsite Name**: All API requests must use "TheLongHop" as the microsite name
2. **Consistency**: Follow the same naming conventions as existing pubs
3. **Testing**: Thoroughly test the complete booking flow before production deployment
4. **Promotion IDs**: Update promotion IDs in production configuration once available
5. **Address/Phone**: Update Long Hop contact information in the pub selection page

## 🚀 Deployment Steps

1. Implement all configuration changes
2. Create all page components
3. Update routing
4. Test in development environment
5. Deploy to production
6. Verify API endpoints work with "TheLongHop" microsite name
7. Test complete booking flow in production

This implementation plan ensures a seamless integration of "The Long Hop" as a third pub while maintaining consistency with the existing architecture and following the same patterns established for the other pubs.
