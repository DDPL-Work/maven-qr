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
    /*
    ========================================
    0️⃣ Parse FormData JSON
    ========================================
    */

    if (!req.body.data) {
      return res.status(400).json({
        success: false,
        message: "Missing payload data",
      });
    }

    const parsed = JSON.parse(req.body.data);
    const { company, about, mission, vision, jobs, whyJoinUs } = parsed;

    if (!company?.name || !company?.contact?.email) {
      return res.status(400).json({
        success: false,
        message: "Company name and email are required",
      });
    }

    /*
    ========================================
    1️⃣ Optional Logo Upload (Cloudinary)
    ========================================
    */

    let logoUrl = null;
    let logoPublicId = null;

    if (req.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "company_logos",
            resource_type: "image",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        );

        streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
      });

      logoUrl = uploadResult.secure_url;
      logoPublicId = uploadResult.public_id;
    }

    /*
    ========================================
    2️⃣ Create Company
    ========================================
    */

    const newCompany = await Company.create({
      name: company.name,
      tagline: company.tagline,
      industry: company.industry,

      size: company.size,
      founded: company.founded,
      employees: company.employees,
      headquarters: company.headquarters,

      website: company.website,
      googleMapLink: company.googleMapLink,
      socialLinks: company.socialLinks,

      activelyHiring: company.activelyHiring,
      openings: Number(company.openings || 0),

      contact: {
        email: company.contact?.email,
        phone: company.contact?.phone,
        altPhone: company.contact?.altPhone,
      },

      location: {
        country: company.location?.country,
        region: company.location?.region,
        city: company.location?.city,
        zone: company.location?.zone,
        address: company.location?.address,
        pincode: company.location?.pincode,
      },

      about,
      mission,
      vision,
      whyJoinUs,

      logo: logoUrl,

      createdByCRM: req.user._id,
      status: "ACTIVE",
    });

    /*
    ========================================
    3️⃣ Create Jobs
    ========================================
    */

    if (jobs?.length) {
      const jobDocs = jobs.map((job) => ({
        companyId: newCompany._id,
        title: job.title,
        department: job.department,
        jobType: job.jobType,
        workplaceType: job.workplaceType,
        location: job.location,
        experience: job.exp,
        salaryMin: job.salaryMin || 0,
        salaryMax: job.salaryMax || 0,
        hideSalary: job.hideSalary || false,
        skills: job.skills || [],
        deadline: job.deadline || null,
        description: job.description,
      }));

      await Job.insertMany(jobDocs);

      newCompany.activeJobCount = jobDocs.length;
      await newCompany.save();
    }

    /*
    ========================================
    4️⃣ Generate Token + Public URL
    ========================================
    */

    const token = crypto.randomUUID();

    const redirectUrl = `${process.env.FRONTEND_URL}/landing/${token}`;

    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
      redirectUrl,
    )}`;

    /*
    ========================================
    5️⃣ Fetch Jobs (Source of Truth)
    ========================================
    */

    const companyJobs = await Job.find({
      companyId: newCompany._id,
      isActive: true,
    });

    /*
    ========================================
    6️⃣ Generate PDF
    ========================================
    */

    const pdfBuffer = await generateCompanyQRPDF({
      company: newCompany,
      jobs: companyJobs,
      qrImageUrl,
    });

    /*
    ========================================
    7️⃣ Upload PDF to Cloudinary
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
    8️⃣ Save QR Record
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
    SUCCESS RESPONSE
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
