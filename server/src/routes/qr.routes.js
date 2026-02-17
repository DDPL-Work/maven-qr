const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");

const {
  createCompanyAndGenerateQR,
  resolveQR,
} = require("../controllers/qr.controller");

// CRM generates QR
router.post("/generate", auth, role("CRM"), createCompanyAndGenerateQR);

// Public route (candidate scan)
router.get("/resolve/:token", resolveQR);

module.exports = router;
