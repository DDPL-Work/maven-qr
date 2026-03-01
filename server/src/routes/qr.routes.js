const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");

const { createCompanyAndGenerateQR, downloadQRPDF } = require("../controllers/qr.controller");
const upload = require("../middleware/uploads.middleware");

// CRM generates QR
router.post("/generate", auth.protectCRM,  upload.single("logo"), createCompanyAndGenerateQR);
router.get("/download/:token", downloadQRPDF);

module.exports = router;
