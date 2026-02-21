const User = require("../models/User");
const CrmUser = require("../models/CrmUser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateToken = (id, type) => {
  return jwt.sign(
    { id, type }, // type = USER or CRM
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );
};

exports.registerCandidate = async (req, res, next) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(400).json({ message: "Email already exists" });
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashed,
    role: "CANDIDATE",
  });

  res.status(201).json({
    token: generateToken(user._id),
  });
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // 1️⃣ Try normal User model
    let user = await User.findOne({ email });
    let userType = "USER";

    // 2️⃣ If not found, try CRM model
    if (!user) {
      user = await CrmUser.findOne({ email });
      userType = "CRM";
    }

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // 3️⃣ Compare password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // 4️⃣ Send unified response
    res.status(200).json({
      success: true,
      token: generateToken(user._id, userType),
      user: {
        id: user._id,
        name: user.name || user.fullName,
        email: user.email,
        role: user.role,
        type: userType,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
