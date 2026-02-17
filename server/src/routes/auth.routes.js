const express = require("express");
const router = express.Router();

const {
  registerCandidate,
  login,
} = require("../controllers/auth.controller");

router.post("/register", registerCandidate);
router.post("/login", login);

module.exports = router;
