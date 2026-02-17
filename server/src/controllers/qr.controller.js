const crypto = require("crypto");
const Company = require("../models/Company");
const Job = require("../models/Job");
const QRCode = require("../models/QRCode");

/*
========================================
CREATE COMPANY + JOB + QR
========================================
*/
exports.createCompanyAndGenerateQR = async (req, res) => {
  try {
    const {
      // COMPANY
      companyName,
      tagline,
      industry,
      companySize,
      foundedYear,
      email,
      phone,
      altPhone,
      website,
      linkedIn,
      country,
      region,
      city,
      zone,
      address,
      pincode,
      packageType,

      // JOB
      designation,
      department,
      jobType,
      openings,
      experience,
      salaryMin,
      salaryMax,
      skills,
      deadline,
      contactPerson,
      contactRole,
      notes,
    } = req.body;

    // =========================
    // 1️⃣ Create Company
    // =========================

    const jobLimitMap = {
      STANDARD: 2,
      PREMIUM: 5,
      ELITE: 10,
    };

    const company = await Company.create({
      companyName,
      tagline,
      industry,
      companySize,
      foundedYear,
      email,
      phone,
      altPhone,
      website,
      linkedIn,
      country,
      region,
      city,
      zone,
      address,
      pincode,
      packageType,
      jobLimit: jobLimitMap[packageType] || 2,
      createdByCRM: req.user._id, // from auth middleware
    });

    // =========================
    // 2️⃣ Create Job
    // =========================

    const job = await Job.create({
      companyId: company._id,
      designation,
      department,
      jobType,
      openings,
      experience,
      salaryMin,
      salaryMax,
      skills,
      deadline,
      contactPerson,
      contactRole,
      notes,
      approvalStatus: "APPROVED", // CRM creates → auto approve
    });

    // =========================
    // 3️⃣ Generate Secure Token
    // =========================

    const token = crypto.randomUUID();

    // =========================
    // 4️⃣ Create QR Entry
    // =========================

    await QRCode.create({
      companyId: company._id,
      jobId: job._id,
      token,
      createdByCRM: req.user._id,
    });

    // =========================
    // 5️⃣ Generate QR URL
    // =========================

    const redirectUrl = `${process.env.FRONTEND_URL}/apply/${token}`;

    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
      redirectUrl,
    )}`;

    return res.status(201).json({
      success: true,
      message: "Company, Job and QR created successfully",
      qrImage: qrImageUrl,
      token,
      redirectUrl,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to generate QR",
    });
  }
};

/*
========================================
RESOLVE QR → RETURN FULL DETAILS
========================================
*/
exports.resolveQR = async (req, res) => {
  try {
    const { token } = req.params;

    const qr = await QRCode.findOne({ token, isActive: true })
      .populate("companyId")
      .populate("jobId");

    if (!qr) {
      return res.status(404).json({
        success: false,
        message: "Invalid or expired QR",
      });
    }

    // increment scan count
    qr.scans += 1;
    await qr.save();

    return res.json({
      success: true,
      company: qr.companyId,
      job: qr.jobId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to resolve QR",
    });
  }
};
