// controllers/crm.controller.js

const CrmUser = require("../models/CrmUser");
const bcrypt = require("bcryptjs");

// REGISTER CRM USER
exports.registerCrmUser = async (req, res) => {
  try {
    const { fullName, email, password, phone, role, territory, state } =
      req.body;

    // 1️⃣ Basic Validation
    if (!fullName || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Full Name, Email, Password and Role are required",
      });
    }

    // 2️⃣ Check existing user
    const existingUser = await CrmUser.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "CRM user already exists with this email",
      });
    }

    // 3️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4️⃣ Create user
    const user = await CrmUser.create({
      fullName,
      email,
      password: hashedPassword,
      phone,
      role,
      territory,
      state,
    });

    return res.status(201).json({
      success: true,
      message: "CRM User registered successfully",
      data: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("CRM Register Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


exports.getMyProfile = async (req, res) => {
  try {
    const user = req.user; // coming from protectCRM middleware

    return res.status(200).json({
      success: true,
      data: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        territory: user.territory,
        state: user.state,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
    });
  }
};
