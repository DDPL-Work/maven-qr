const mongoose = require("mongoose");

const highlightSchema = new mongoose.Schema({
  icon: String,
  title: String,
  desc: String,
});

const socialLinksSchema = new mongoose.Schema({
  linkedin: String,
  twitter: String,
  instagram: String,
  facebook: String,
});

const contactSchema = new mongoose.Schema({
  email: { type: String, required: true },
  phone: String,
  altPhone: String,
});

const locationSchema = new mongoose.Schema({
  country: String,
  region: String,
  city: String,
  zone: String,
  address: String,
  pincode: String,
});

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    tagline: String,
    industry: String,

    size: String,
    founded: String,
    employees: String,
    headquarters: String,

    website: String,
    googleMapLink: String,

    logo: {
      type: String,
      default: null,
    },

    logoPublicId: {
      type: String,
      default: null,
    },

    socialLinks: socialLinksSchema,

    activelyHiring: { type: Boolean, default: true },
    openings: { type: Number, default: 0 },

    contact: contactSchema,
    location: locationSchema,

    about: String,
    mission: String,
    vision: String,

    whyJoinUs: [highlightSchema],

    activeJobCount: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },

    createdByCRM: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CrmUser",
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Company", companySchema);
