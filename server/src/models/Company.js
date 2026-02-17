const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },

    createdByFSE: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    managedByCRM: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    packageType: {
      type: String,
      enum: ["STANDARD", "PREMIUM", "ELITE"],
      default: "STANDARD",
    },

    jobLimit: { type: Number, default: 2 }, // Configurable by CRM
    activeJobCount: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Company", companySchema);
