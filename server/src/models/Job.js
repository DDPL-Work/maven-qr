const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    // JOB DETAILS
    designation: { type: String, required: true },
    department: String,
    jobType: String,
    openings: Number,
    experience: String,

    salaryMin: Number,
    salaryMax: Number,

    skills: String,
    deadline: Date,

    // CONTACT PERSON
    contactPerson: String,
    contactRole: String,

    notes: String,

    // APPROVAL WORKFLOW
    approvalStatus: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", jobSchema);
