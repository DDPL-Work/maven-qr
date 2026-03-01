import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

/*
========================================
THUNK: CREATE COMPANY + JOB + QR
========================================
*/
export const generateQR = createAsyncThunk(
  "qr/generateQR",
  async (formData, { rejectWithValue, getState }) => {
    try {
      const { user } = getState().auth;

      const payload = {
        ...formData,
        // createdBy: user?.id, // send CRM user id
      };

      const res = await api.post("/qr/generate", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "QR generation failed",
      );
    }
  },
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
      return rejectWithValue(error.response?.data?.message || "Invalid QR");
    }
  },
);

/*
========================================
THUNK: DOWNLOAD QR PDF
========================================
*/
export const downloadQRPDF = createAsyncThunk(
  "qr/downloadQRPDF",
  async ({ token, companyName }, { rejectWithValue }) => {
    try {
      if (!token) throw new Error("Invalid token");

      const response = await api.get(`/qr/download/${token}`, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type: "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);

      // ✅ Sanitize company name for file system
      const safeName = companyName
        ?.replace(/[^\w\s-]/g, "") // remove special chars
        ?.replace(/\s+/g, "-") // spaces → dash
        ?.trim();

      const fileName = `${safeName || "Company"}-QR.pdf`;

      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      return rejectWithValue("PDF download failed");
    }
  },
);
