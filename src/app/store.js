import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/features/auth/authSlice';
import { cartReducer } from '@/features/cart';
import { eventsReducer } from '@/features/events';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    events: eventsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  devTools: import.meta.env.DEV,
});

export default store;
