const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");

const { createCompanyAndGenerateQR, downloadQRPDF } = require("../controllers/qr.controller");

// CRM generates QR
router.post("/generate", auth.protectCRM, createCompanyAndGenerateQR);
router.get("/download/:token", downloadQRPDF);

module.exports = router;
