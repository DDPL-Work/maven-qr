const jwt = require("jsonwebtoken");
const User = require("../models/User");
const CrmUser = require("../models/CrmUser");

// ------------------------------------------------
// USER AUTH (Normal Users)
// ------------------------------------------------
const protectUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "User account is inactive" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized access" });
  }
};

// ------------------------------------------------
// CRM AUTH
// ------------------------------------------------
const protectCRM = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await CrmUser.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "CRM account inactive" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized access" });
  }
};

module.exports = {
  protectUser,
  protectCRM,
};
