import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Basic booking info
  date: null,
  time: null,
  adults: 0,
  children: 0,
  returnBy: null,

  // Selected area/promotion
  selectedPromotion: null,

  // Customer details
  customerDetails: {
    FirstName: '',
    Surname: '',
    MobileCountryCode: '+44',
    Mobile: '',
    Email: '',
    ReceiveEmailMarketing: false,
    ReceiveSmsMarketing: false,
    ReceiveRestaurantEmailMarketing: false,
    ReceiveRestaurantSmsMarketing: false,
  },

  // Special requests
  specialRequests: '',

  // Current step
  currentStep: 1,

  // Selected pub
  selectedPub: null,

  // Additional state properties
  availablePromotionIds: [],
  pubType: null, // 'top' or 'griffin'
};

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    updateBasicInfo: (state, action) => {
      const {
        date,
        time,
        adults,
        children,
        returnBy,
        availablePromotionIds,
        pubType
      } = action.payload;

      // Log the incoming action payload
      console.log("updateBasicInfo action payload:", action.payload);

      if (date) state.date = date;
      if (time) state.time = time;
      if (adults !== undefined) state.adults = adults;
      if (children !== undefined) state.children = children;
      if (returnBy) state.returnBy = returnBy;

      // Explicitly handle availablePromotionIds
      if (availablePromotionIds) {
        console.log("Updating availablePromotionIds in Redux:", availablePromotionIds);
        state.availablePromotionIds = availablePromotionIds;
      }

      if (pubType) {
        console.log("Updating pubType in Redux:", pubType);
        state.pubType = pubType;
      }
    },
    updateSelectedPromotion: (state, action) => {
      state.selectedPromotion = action.payload;
    },
    updateCustomerDetails: (state, action) => {
      state.customerDetails = { ...state.customerDetails, ...action.payload };
    },
    updateSpecialRequests: (state, action) => {
      state.specialRequests = action.payload;
    },
    updateCurrentStep: (state, action) => {
      state.currentStep = action.payload;
    },
    updateSelectedPub: (state, action) => {
      state.selectedPub = action.payload;
    },
    resetBooking: (state) => {
      return initialState;
    }
  }
});

export const {
  updateBasicInfo,
  updateSelectedPromotion,
  updateCustomerDetails,
  updateSpecialRequests,
  updateCurrentStep,
  updateSelectedPub,
  resetBooking
} = bookingSlice.actions;

export default bookingSlice.reducer;