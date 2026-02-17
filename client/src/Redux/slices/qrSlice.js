import { createSlice } from "@reduxjs/toolkit";
import { generateQR, resolveQR } from "../thunks/qrThunks";

/*
========================================
SLICE
========================================
*/
const qrSlice = createSlice({
  name: "qr",
  initialState: {
    loading: false,
    error: null,

    qrImage: null,
    redirectUrl: null,
    token: null,

    resolvedCompany: null,
    resolvedJob: null,
  },

  reducers: {
    resetQRState: (state) => {
      state.loading = false;
      state.error = null;
      state.qrImage = null;
      state.redirectUrl = null;
      state.token = null;
      state.resolvedCompany = null;
      state.resolvedJob = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // ===============================
      // GENERATE QR
      // ===============================
      .addCase(generateQR.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateQR.fulfilled, (state, action) => {
        state.loading = false;
        state.qrImage = action.payload.qrImage;
        state.redirectUrl = action.payload.redirectUrl;
        state.token = action.payload.token;
      })
      .addCase(generateQR.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ===============================
      // RESOLVE QR
      // ===============================
      .addCase(resolveQR.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resolveQR.fulfilled, (state, action) => {
        state.loading = false;
        state.resolvedCompany = action.payload.company;
        state.resolvedJob = action.payload.job;
      })
      .addCase(resolveQR.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetQRState } = qrSlice.actions;
export default qrSlice.reducer;
