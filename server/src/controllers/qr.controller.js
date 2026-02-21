const crypto = require("crypto");
const streamifier = require("streamifier");

const Company = require("../models/Company");
const Job = require("../models/Job");
const QRCode = require("../models/QRCode");
const cloudinary = require("../config/cloudinary");

const { generateCompanyQRPDF } = require("../services/pdf.service");

/*
========================================
CREATE COMPANY + JOB + QR + PDF UPLOAD
========================================
*/
exports.createCompanyAndGenerateQR = async (req, res) => {
  try {
    const { company, about, mission, vision, jobs, whyJoinUs } = req.body;

    if (!company) {
      return res.status(400).json({
        success: false,
        message: "Company data is required",
      });
    }

    /*
    ========================================
    1️⃣ Create Company
    ========================================
    */

    const newCompany = await Company.create({
      // ───────── BASIC INFO ─────────
      name: company.name,
      tagline: company.tagline,
      industry: company.industry,
      companySize: company.size,
      foundedYear: company.founded,
      employeesCount: company.employees,
      headquarters: company.headquarters,
      activelyHiring: company.activelyHiring,
      openRoles: Number(company.openings),

      // ───────── CONTACT ─────────
      email: company.contact?.email,
      phone: company.contact?.phone,
      altPhone: company.contact?.altPhone,
      website: company.website,
      linkedIn: company.linkedIn,

      // ───────── LOCATION ─────────
      location: {
        country: company.location?.country,
        region: company.location?.region,
        city: company.location?.city,
        zone: company.location?.zone,
        address: company.location?.address,
        pincode: company.location?.pincode,
      },

      // ───────── CONTENT ─────────
      about,
      mission,
      vision,
      whyJoinUs,


      createdByCRM: req.user._id,
      status: "ACTIVE",
    });

    /*
    ========================================
    2️⃣ Create Jobs
    ========================================
    */

    if (jobs?.length) {
      await Job.insertMany(
        jobs.map((job) => ({
          companyId: newCompany._id,
          title: job.title,
          department: job.department,
          jobType: job.jobType,
          workplaceType: job.workplaceType,
          location: job.location,
          experience: job.exp, // FIX HERE
          salaryMin: job.salaryMin,
          salaryMax: job.salaryMax,
          skills: job.skills,
          deadline: job.deadline,
          description: job.description,
        })),
      );

      newCompany.activeJobCount = jobs.length;
      await newCompany.save();
    }

    /*
    ========================================
    3️⃣ Generate Token + QR URL
    ========================================
    */

    const token = crypto.randomUUID();
    const redirectUrl = `${process.env.FRONTEND_URL}/landing/${token}`;

    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
      redirectUrl,
    )}`;

    /*
    ========================================
    4️⃣ Fetch Jobs From DB (source of truth)
    ========================================
    */

    const companyJobs = await Job.find({
      companyId: newCompany._id,
    });

    /*
    ========================================
    5️⃣ Generate Rich PDF (Service Layer)
    ========================================
    */

    const pdfBuffer = await generateCompanyQRPDF({
      company: newCompany,
      jobs: companyJobs,
      qrImageUrl,
    });

    /*
    ========================================
    6️⃣ Upload PDF to Cloudinary
    ========================================
    */

    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "raw",
          folder: "qr_pdfs",
          public_id: `qr_${token}`,
          format: "pdf",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      );

      streamifier.createReadStream(pdfBuffer).pipe(uploadStream);
    });

    /*
    ========================================
    7️⃣ Save QR Record in DB
    ========================================
    */

    await QRCode.create({
      companyId: newCompany._id,
      token,
      qrImageUrl,
      pdfUrl: uploadResult.secure_url,
      pdfPublicId: uploadResult.public_id,
      createdByCRM: req.user._id,
      isActive: true,
    });

    /*
    ========================================
    RESPONSE
    ========================================
    */

    return res.status(201).json({
      success: true,
      token,
      redirectUrl,
      qrImage: qrImageUrl,
      pdfUrl: uploadResult.secure_url,
    });
  } catch (error) {
    console.error("QR Create Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate QR",
    });
  }
};

/*
========================================
DOWNLOAD QR PDF
========================================
*/

exports.downloadQRPDF = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token is required",
      });
    }

    const qr = await QRCode.findOne({
      token,
      isActive: true,
    }).populate("companyId");

    if (!qr || !qr.pdfUrl) {
      return res.status(404).json({
        success: false,
        message: "QR PDF not found",
      });
    }

    // Permanent redirect to Cloudinary PDF
    return res.redirect(qr.pdfUrl);
  } catch (error) {
    console.error("Download QR Error:", error);

    return res.status(500).json({
      success: false,
      message: "Download failed",
    });
  }
};
