// src/features/store.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import qrReducer from "./slices/qrSlice.js";
import crmReducer from "./slices/crmSlice.js";
import { setupAxiosInterceptors } from "../API/axiosInstance.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    qr: qrReducer,
    crm: crmReducer,
  },
});

// now that store exists, wire axios interceptors that need the store
setupAxiosInterceptors(store);

export default store;
