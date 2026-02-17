import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
const LOGIN_URL = `${BASE_URL}/auth/login`;

// ------------------------------------------------------------
// LOGIN
// ------------------------------------------------------------
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password, role }, { rejectWithValue }) => {
    try {
      const response = await axios.post(LOGIN_URL, { email, password, role });
      const data = response.data;

      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("user", JSON.stringify(data.user));

      return data.user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Login failed. Try again."
      );
    }
  }
);

// ------------------------------------------------------------
// LOGOUT  (NOW CALLS BACKEND)
// ------------------------------------------------------------
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;

      await axios.post(
        `${BASE_URL}/auth/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");

      return true;
    } catch (err) {
      return rejectWithValue("Logout failed.");
    }
  }
);