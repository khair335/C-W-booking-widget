import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web
import bookingReducer from './bookingSlice';

// Redux persist configuration
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['booking'] // Only persist the booking slice
};

// Create a persisted reducer
const persistedReducer = persistReducer(persistConfig, bookingReducer);

export const store = configureStore({
  reducer: {
    booking: persistedReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);