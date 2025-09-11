import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartItem, CartState } from '@/types/model';

const initialState: CartState = {
  items: [],
  totalItems: 0.00,
  totalPrice: 0.00,
};

const roundToTwoDecimals = (num: number) => {
  return parseFloat(num.toFixed(2));
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const { id, quantity, promo_price, price } = action.payload;
      const existingItem = state.items.find(item => item.id === id);
      const itemPrice = promo_price || price;
      if (existingItem) {
        existingItem.quantity = quantity;
        existingItem.subtotalPrice = roundToTwoDecimals(existingItem.quantity * itemPrice);
      } else {
        action.payload.subtotalPrice = roundToTwoDecimals(quantity * itemPrice);
        state.items.push(action.payload);
      }
      state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0); // Update totalItems
      state.totalPrice = roundToTwoDecimals(
        state.items.reduce((total, item) => total + (item.subtotalPrice ? item.subtotalPrice : 0), 0)
      ); // Update totalPrice
    },
    removeFromCart: (state, action: PayloadAction<{ itemId: string }>) => {
      const { itemId } = action.payload;
      const existingItem = state.items.find(item => item.id === itemId);
      if (existingItem) {
        state.items = state.items.filter(item => item.id !== itemId);
        state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0); // Update totalItems
        state.totalPrice = roundToTwoDecimals(
          state.items.reduce((total, item) => total + (item.subtotalPrice ? item.subtotalPrice : 0), 0)
        ); // Update totalPrice
      }
    },
    updateCartItem: (state, action: PayloadAction<{ itemId: string, quantity: number }>) => {
      const { itemId, quantity } = action.payload;
      const existingItem = state.items.find(item => item.id === itemId);
      if (existingItem) {
        existingItem.quantity = quantity;
        const itemPrice = existingItem.promo_price || existingItem.price;
        existingItem.subtotalPrice = roundToTwoDecimals(quantity * itemPrice);
        state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0); // Update totalItems
        state.totalPrice = roundToTwoDecimals(
          state.items.reduce((total, item) => total + (item.subtotalPrice ? item.subtotalPrice : 0), 0)
        ); // Update totalPrice
      }
    },
    clearCart: (state) => {
      state.items = [];
      state.totalItems = 0;
      state.totalPrice = 0;
    }
  },
});

export const { addToCart, removeFromCart, updateCartItem, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
