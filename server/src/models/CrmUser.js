// models/CrmUser.js
const mongoose = require("mongoose");

const crmUserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
    },
    role: {
      type: String,
      enum: ["LEAD_GENERATOR", "STATE_MANAGER", "FSE", "APPROVER", "ADMIN"],
      required: true,
    },
    territory: {
      type: String, // useful for Lead Generator
    },
    state: {
      type: String, // useful for State Manager
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CrmUser", crmUserSchema);
