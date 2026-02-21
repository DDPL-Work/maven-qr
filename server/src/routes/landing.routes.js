// routes/landing.routes.js
const express = require("express");
const router = express.Router();

const { getLandingPageData } = require("../controllers/landing.controller");

// Final URL:
// /api/v1/landing/:token
router.get("/:token", getLandingPageData);

module.exports = router;
