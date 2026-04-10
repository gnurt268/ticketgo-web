import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  eventId: null,
  eventTitle: '',
  eventDate: null,
  eventVenue: '',
  eventAddress: '',
  eventPosterUrl: '',
  selectedTickets: {}, // { [zoneId]: quantity }
  ticketZones: [],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCart: (state, action) => {
      return { ...initialState, ...action.payload };
    },
    updateTicketQuantity: (state, action) => {
      const { zoneId, quantity } = action.payload;
      if (quantity <= 0) {
        delete state.selectedTickets[zoneId];
      } else {
        state.selectedTickets[zoneId] = quantity;
      }
    },
    clearCart: () => initialState,
  },
});

export const { setCart, updateTicketQuantity, clearCart } = cartSlice.actions;

export const selectCart = (state) => state.cart;
export const selectSelectedTickets = (state) => state.cart.selectedTickets;
export const selectCartEventId = (state) => state.cart.eventId;

export default cartSlice.reducer;
