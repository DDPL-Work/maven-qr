import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

/*
========================================
THUNK: CREATE COMPANY + JOB + QR
========================================
*/
export const generateQR = createAsyncThunk(
  "qr/generateQR",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await api.post("/qr/generate", formData);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "QR generation failed"
      );
    }
  }
);

/*
========================================
THUNK: RESOLVE QR
========================================
*/
export const resolveQR = createAsyncThunk(
  "qr/resolveQR",
  async (token, { rejectWithValue }) => {
    try {
      const res = await api.get(`/qr/resolve/${token}`);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Invalid QR"
      );
    }
  }
);