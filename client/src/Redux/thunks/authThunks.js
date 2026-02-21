import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

// ------------------------------------------------------------
// LOGIN
// ------------------------------------------------------------
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/auth/login", {
        email,
        password,
      });

      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("user", JSON.stringify(data.user));

      return {
        user: data.user,
        token: data.token,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  },
);

// ------------------------------------------------------------
// LOGOUT
// ------------------------------------------------------------
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");

      return true;
    } catch (error) {
      return rejectWithValue("Logout failed");
    }
  },
);
