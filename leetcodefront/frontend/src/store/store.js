import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../authsilce"

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});
