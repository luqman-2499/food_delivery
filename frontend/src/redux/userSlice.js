import { createSlice } from "@reduxjs/toolkit";

const cartFromStorage = JSON.parse(localStorage.getItem("cartItems")) || [];
const userSlice = createSlice({
  name: "user",
  initialState: {
    userData: null,
    currentCity: null,
    currentState: null,
    currentAddress: null,
    shopsInMyCity: null,
    itemsInMyCity: null,
    // cartItems: [],
    cartItems: cartFromStorage,
    totalAmount: cartFromStorage.reduce(
      (sum, i) => sum + i.price * i.quantity,
      0,
    ),
    // totalAmount: 0,
    myOrders: [],
    searchItems: null,
    socket: null,
  },
  reducers: {
    setUserData: (state, action) => {
      state.userData = action.payload;
    },
    setCurrentCity: (state, action) => {
      state.currentCity = action.payload;
    },
    setCurrentState: (state, action) => {
      state.currentState = action.payload;
    },
    setCurrentAddress: (state, action) => {
      state.currentAddress = action.payload;
    },
    setShopsInMyCity: (state, action) => {
      state.shopsInMyCity = action.payload;
    },
    setItemsInMyCity: (state, action) => {
      state.itemsInMyCity = action.payload;
    },
    setSocket: (state, action) => {
      state.socket = action.payload;
    },
    // ADD ITEMS IN CART
    addToCart: (state, action) => {
      // reducer to update cart items: addToCart
      const cartItem = action.payload; // when itms dispatched to cart it is stored in cartItem varaible
      const existingItem = state.cartItems.find((i) => i.id == cartItem.id); // check if any existing item id alreaady present or not
      if (existingItem) {
        // if yes increase qty
        existingItem.quantity = cartItem.quantity;
      } else {
        // else simply push new array of that item with all fields mentioned in frontend
        state.cartItems.push(cartItem);
      }

      // Total amount when item enters in cart
      state.totalAmount = state.cartItems.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0,
      );
      localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
    },

    // UPDATE QUANTITY
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.cartItems.find((i) => i.id == id);
      if (item) {
        item.quantity = quantity;
      }

      // When QTY changed the price auto changes
      state.totalAmount = state.cartItems.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0,
      );
      localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
    },

    // REMOVE ITEMS FROM CART DELETE
    removeCartItem: (state, action) => {
      state.cartItems = state.cartItems.filter((i) => i.id !== action.payload); // Update the state of cart Items by - keep all items EXCEPT that item whoose id is matched with the sent id. i sent item whoose item.id 2499 and in redux remove that item whoose id 2499
      state.totalAmount = state.cartItems.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0,
      );
      localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
    },

    resetCart: (state) => {
      state.cartItems = [];
      state.totalAmount = 0;
    },

    setMyOrders: (state, action) => {
      state.myOrders = action.payload;
    },
    addMyOrder: (state, action) => {
      state.myOrders = [action.payload, ...state.myOrders];
    },

    updateOrderStatus: (state, action) => {
      const { orderId, shopId, status } = action.payload;
      const order = state.myOrders.find((o) => o._id == orderId);
      if (order) {
        if (order.shopOrders && order.shopOrders.shop._id == shopId) {
          order.shopOrders.status = status;
        }
      }
    },

    updateRealtimeOrderStatus: (state, action) => {
      const { orderId, shopId, status } = action.payload;
      const order = state.myOrders.find((o) => o._id == orderId);
      if (order) {
        const shopOrder = order.shopOrders.find((so) => so.shop._id == shopId);
        if (shopOrder) {
          shopOrder.status = status;
        }
      }
    },

    setSearchItems: (state, action) => {
      state.searchItems = action.payload;
    },
  },
});

export const {
  setUserData,
  setCurrentCity,
  setCurrentState,
  setCurrentAddress,
  setShopsInMyCity,
  setItemsInMyCity,
  addToCart,
  updateQuantity,
  removeCartItem,
  setMyOrders,
  addMyOrder,
  updateOrderStatus,
  setSearchItems,
  setSocket,
  updateRealtimeOrderStatus,
  resetCart,
} = userSlice.actions;

export default userSlice.reducer;
