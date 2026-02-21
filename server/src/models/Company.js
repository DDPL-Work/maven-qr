const mongoose = require("mongoose");

const highlightSchema = new mongoose.Schema({
  icon: String,
  title: String,
  desc: String,
});

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    tagline: String,
    industry: String,
    companySize: String,
    foundedYear: String,
    employeesCount: String,
    headquarters: String,

    website: String,
    linkedIn: String,
    activelyHiring: { type: Boolean, default: true },
    openRoles: Number,

    email: { type: String, required: true },
    phone: String,
    altPhone: String,

    location: {
      country: String,
      region: String,
      city: String,
      zone: String,
      address: String,
      pincode: String,
    },

    // ✅ NEW CONTENT FIELDS
    about: String,
    mission: String,
    vision: String,

    whyJoinUs: [highlightSchema],

    createdByCRM: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CrmUser",
      required: true,
    },
    
    activeJobCount: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Company", companySchema);
