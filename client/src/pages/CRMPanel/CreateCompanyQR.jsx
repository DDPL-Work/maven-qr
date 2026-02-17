import { useState } from "react";

import {
  FiBriefcase,
  FiMapPin,
  FiMail,
  FiHome,
  FiStar,
  FiUser,
  FiArrowLeft,
  FiArrowRight,
  FiDownload,
  FiRefreshCw,
  FiCheckCircle,
  FiPackage,
} from "react-icons/fi";
import {
  PACKAGES,
  INDUSTRIES,
  COMPANY_SIZES,
  JOB_TYPES,
  SECTIONS,
} from "../../Data/dummyData";

export default function CreateCompanyQR() {
  const [formData, setFormData] = useState({
    companyName: "",
    tagline: "",
    industry: "",
    companySize: "",
    foundedYear: "",
    email: "",
    phone: "",
    altPhone: "",
    website: "",
    linkedIn: "",
    country: "",
    region: "",
    city: "",
    zone: "",
    address: "",
    pincode: "",
    designation: "",
    department: "",
    jobType: "",
    openings: "",
    experience: "",
    salaryMin: "",
    salaryMax: "",
    skills: "",
    deadline: "",
    packageType: "STANDARD",
    contactPerson: "",
    contactRole: "",
    notes: "",
  });

  const [activeSection, setActiveSection] = useState(0);
  const [qrPreview, setQrPreview] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    const qrData = encodeURIComponent(
      `Company:${formData.companyName}|Role:${formData.designation}|City:${formData.city}|Email:${formData.email}|Web:${formData.website}|Exp:${formData.experience}`,
    );
    setQrPreview(
      `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${qrData}&color=1a3a6b&bgcolor=ffffff`,
    );
    setSubmitted(true);
  };

  const filled = Object.values(formData).filter(Boolean).length;
  const total = Object.keys(formData).length;
  const progress = Math.round((filled / total) * 100);

  const inp = `
    w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-800
    bg-white placeholder-gray-400
    focus:outline-none focus:border-[#1a3a6b] focus:ring-2 focus:ring-[#1a3a6b]/10
    transition-all duration-150
  `;

  return (
    <div
      style={{ fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif" }}
      className="w-full"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #f1f5f9; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 8px; }

        .nav-item { transition: background 0.15s ease, color 0.15s ease; }
        .nav-item:hover { background: rgba(141,198,63,0.14); }
        .nav-item.active { background: #8dc63f; color: #fff !important; }

        .tab-btn { transition: all 0.15s ease; }
        .tab-btn:hover:not(.active) { background: #f0f4f8; }
        .tab-btn.active { background: #1a3a6b; color: #fff; border-color: #1a3a6b; }

        .pkg-card { cursor: pointer; transition: all 0.15s ease; }
        .pkg-card:hover { border-color: #1a3a6b; }
        .pkg-card.selected { border-color: #1a3a6b !important; background: #eef2f9 !important; }

        .submit-btn {
          background: linear-gradient(135deg, #8dc63f 0%, #6faa1e 100%);
          transition: filter 0.2s ease, transform 0.15s ease;
        }
        .submit-btn:hover  { filter: brightness(1.07); transform: translateY(-1px); }
        .submit-btn:active { transform: translateY(0); }

        .fade-up { animation: fadeUp 0.25s ease both; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .progress-fill {
          background: linear-gradient(90deg, #1a3a6b, #8dc63f);
          transition: width 0.5s ease;
        }

        input[type="date"]::-webkit-calendar-picker-indicator {
          opacity: 0.5; cursor: pointer;
        }
      `}</style>

      {/* ══ MAIN ══ */}
      <main className="max-w-6xl mx-auto w-full">
        <div className="px-4 md:px-6 py-6">
          {/* Page heading */}
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-[#1a3a6b]">
              Create Company & Generate QR
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Fill in the details below to generate a scannable QR code for job
              postings.
            </p>

            {/* Progress bar */}
            <div className="mt-4 flex items-center gap-3">
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="progress-fill h-full rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs font-bold text-[#1a3a6b] w-10 text-right">
                {progress}%
              </span>
            </div>
          </div>

          {/* Section tabs */}
          <div className="flex gap-2 mb-5 flex-wrap">
            {SECTIONS.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveSection(i)}
                className={`tab-btn flex items-center gap-1.5 px-4 py-2 rounded-xl border text-sm font-medium
                  ${
                    activeSection === i
                      ? "active border-[#1a3a6b]"
                      : "border-gray-200 text-gray-600 bg-white"
                  }`}
              >
                <span>{s.icon}</span>
                <span>{s.title}</span>
              </button>
            ))}
          </div>

          {/* ── Form Card ── */}
          <form onSubmit={handleSubmit}>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-7 fade-up">
              {/* 0 — Company Info */}
              {activeSection === 0 && (
                <div className="space-y-4">
                  <SHead
                    title="Company Identity"
                    sub="Basic details about your organisation"
                  />
                  <Grid2>
                    <F label="Company Name *" span2>
                      <input
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        placeholder="e.g. Acme Corp Pvt. Ltd."
                        required
                        className={inp}
                      />
                    </F>
                    <F label="Tagline / Slogan" span2>
                      <input
                        name="tagline"
                        value={formData.tagline}
                        onChange={handleChange}
                        placeholder="e.g. Innovating the Future of Work"
                        className={inp}
                      />
                    </F>
                    <F label="Industry *">
                      <select
                        name="industry"
                        value={formData.industry}
                        onChange={handleChange}
                        className={inp}
                        required
                      >
                        <option value="">Select Industry</option>
                        {INDUSTRIES.map((i) => (
                          <option key={i}>{i}</option>
                        ))}
                      </select>
                    </F>
                    <F label="Company Size">
                      <select
                        name="companySize"
                        value={formData.companySize}
                        onChange={handleChange}
                        className={inp}
                      >
                        <option value="">Select Size</option>
                        {COMPANY_SIZES.map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </F>
                    <F label="Founded Year">
                      <input
                        name="foundedYear"
                        value={formData.foundedYear}
                        onChange={handleChange}
                        type="number"
                        min="1800"
                        max="2025"
                        placeholder="e.g. 2015"
                        className={inp}
                      />
                    </F>
                  </Grid2>
                </div>
              )}

              {/* 1 — Contact */}
              {activeSection === 1 && (
                <div className="space-y-4">
                  <SHead
                    title="Contact Details"
                    sub="How candidates and partners can reach you"
                  />
                  <Grid2>
                    <F label="Company Email *">
                      <input
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        type="email"
                        placeholder="hr@company.com"
                        required
                        className={inp}
                      />
                    </F>
                    <F label="Primary Phone *">
                      <input
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        type="tel"
                        placeholder="+91 98765 43210"
                        required
                        className={inp}
                      />
                    </F>
                    <F label="Alternate Phone">
                      <input
                        name="altPhone"
                        value={formData.altPhone}
                        onChange={handleChange}
                        type="tel"
                        placeholder="+91 98765 00000"
                        className={inp}
                      />
                    </F>
                    <F label="Website">
                      <input
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        type="url"
                        placeholder="https://www.company.com"
                        className={inp}
                      />
                    </F>
                    <F label="LinkedIn URL" span2>
                      <input
                        name="linkedIn"
                        value={formData.linkedIn}
                        onChange={handleChange}
                        type="url"
                        placeholder="https://linkedin.com/company/yourcompany"
                        className={inp}
                      />
                    </F>
                  </Grid2>
                </div>
              )}

              {/* 2 — Location */}
              {activeSection === 2 && (
                <div className="space-y-4">
                  <SHead
                    title="Location"
                    sub="Office address and regional details"
                  />
                  <Grid2>
                    <F label="Country">
                      <input
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        placeholder="e.g. India"
                        className={inp}
                      />
                    </F>
                    <F label="State / Region">
                      <input
                        name="region"
                        value={formData.region}
                        onChange={handleChange}
                        placeholder="e.g. Uttarakhand"
                        className={inp}
                      />
                    </F>
                    <F label="City *">
                      <input
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="e.g. Dehradun"
                        required
                        className={inp}
                      />
                    </F>
                    <F label="Zone / Area">
                      <input
                        name="zone"
                        value={formData.zone}
                        onChange={handleChange}
                        placeholder="e.g. North Zone"
                        className={inp}
                      />
                    </F>
                    <F label="Full Address" span2>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        rows={2}
                        placeholder="Plot No. 5, Tech Park, Sector 17..."
                        className={inp + " resize-none"}
                      />
                    </F>
                    <F label="PIN / ZIP Code">
                      <input
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleChange}
                        placeholder="e.g. 248001"
                        className={inp}
                      />
                    </F>
                  </Grid2>
                </div>
              )}

              {/* 3 — Job Details */}
              {activeSection === 3 && (
                <div className="space-y-4">
                  <SHead
                    title="Job Details"
                    sub="Role requirements and compensation"
                  />
                  <Grid2>
                    <F label="Designation / Role *">
                      <input
                        name="designation"
                        value={formData.designation}
                        onChange={handleChange}
                        placeholder="e.g. Senior React Developer"
                        required
                        className={inp}
                      />
                    </F>
                    <F label="Department">
                      <input
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        placeholder="e.g. Engineering"
                        className={inp}
                      />
                    </F>
                    <F label="Job Type">
                      <select
                        name="jobType"
                        value={formData.jobType}
                        onChange={handleChange}
                        className={inp}
                      >
                        <option value="">Select Type</option>
                        {JOB_TYPES.map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                    </F>
                    <F label="No. of Openings">
                      <input
                        name="openings"
                        value={formData.openings}
                        onChange={handleChange}
                        type="number"
                        min="1"
                        placeholder="e.g. 3"
                        className={inp}
                      />
                    </F>
                    <F label="Experience Required">
                      <input
                        name="experience"
                        value={formData.experience}
                        onChange={handleChange}
                        placeholder="e.g. 2–4 years"
                        className={inp}
                      />
                    </F>
                    <F label="Application Deadline">
                      <input
                        name="deadline"
                        value={formData.deadline}
                        onChange={handleChange}
                        type="date"
                        className={inp}
                      />
                    </F>
                    <F label="Salary Min (₹ LPA)">
                      <input
                        name="salaryMin"
                        value={formData.salaryMin}
                        onChange={handleChange}
                        type="number"
                        placeholder="e.g. 6"
                        className={inp}
                      />
                    </F>
                    <F label="Salary Max (₹ LPA)">
                      <input
                        name="salaryMax"
                        value={formData.salaryMax}
                        onChange={handleChange}
                        type="number"
                        placeholder="e.g. 12"
                        className={inp}
                      />
                    </F>
                    <F label="Key Skills Required" span2>
                      <input
                        name="skills"
                        value={formData.skills}
                        onChange={handleChange}
                        placeholder="e.g. React, Node.js, TypeScript, REST APIs"
                        className={inp}
                      />
                    </F>
                  </Grid2>
                </div>
              )}

              {/* 4 — Package & Extra */}
              {activeSection === 4 && (
                <div className="space-y-5">
                  <SHead
                    title="Package & Additional Info"
                    sub="Choose your plan and provide extra details"
                  />

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5">
                      Package Type
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {PACKAGES.map((pkg) => (
                        <div
                          key={pkg.value}
                          onClick={() =>
                            setFormData({ ...formData, packageType: pkg.value })
                          }
                          className={`pkg-card border-2 rounded-xl p-4 text-center
                            ${formData.packageType === pkg.value ? "selected" : "border-gray-200 bg-gray-50"}`}
                        >
                          <div className="text-2xl mb-1.5">{pkg.icon}</div>
                          <div className="font-semibold text-sm text-[#1a3a6b]">
                            {pkg.label}
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            {pkg.jobs} job posts
                          </div>
                          {formData.packageType === pkg.value && (
                            <span className="mt-2 inline-block bg-[#1a3a6b] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                              Selected
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <Grid2>
                    <F label="Contact Person Name">
                      <input
                        name="contactPerson"
                        value={formData.contactPerson}
                        onChange={handleChange}
                        placeholder="e.g. Priya Sharma"
                        className={inp}
                      />
                    </F>
                    <F label="Contact Person Role">
                      <input
                        name="contactRole"
                        value={formData.contactRole}
                        onChange={handleChange}
                        placeholder="e.g. HR Manager"
                        className={inp}
                      />
                    </F>
                    <F label="Additional Notes" span2>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Any extra info to encode in the QR or display to applicants..."
                        className={inp + " resize-none"}
                      />
                    </F>
                  </Grid2>
                </div>
              )}

              {/* ── Footer nav ── */}
              <div className="flex items-center justify-between mt-7 pt-5 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() =>
                    setActiveSection(Math.max(0, activeSection - 1))
                  }
                  disabled={activeSection === 0}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600
                    hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  ← Previous
                </button>

                <div className="flex gap-1.5 items-center">
                  {SECTIONS.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveSection(i)}
                      className={`rounded-full transition-all duration-200
                        ${
                          i === activeSection
                            ? "w-6 h-2.5 bg-[#1a3a6b]"
                            : "w-2.5 h-2.5 bg-gray-200 hover:bg-gray-300"
                        }`}
                    />
                  ))}
                </div>

                {activeSection < SECTIONS.length - 1 ? (
                  <button
                    type="button"
                    onClick={() =>
                      setActiveSection(
                        Math.min(SECTIONS.length - 1, activeSection + 1),
                      )
                    }
                    className="px-5 py-2.5 rounded-xl bg-[#1a3a6b] text-white text-sm font-medium
                      hover:bg-[#163060] transition-all"
                  >
                    Next →
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="submit-btn px-7 py-2.5 rounded-xl text-white font-semibold text-sm
                      flex items-center gap-2 shadow-md"
                  >
                    ⬡ Generate QR
                  </button>
                )}
              </div>
            </div>
          </form>

          {/* ── QR Result ── */}
          {submitted && qrPreview && (
            <div className="mt-6 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col md:flex-row md:items-center gap-8 fade-up">
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl shrink-0">
                <img
                  src={qrPreview}
                  alt="Generated QR"
                  className="w-40 h-40 block"
                />
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center gap-2 mb-1 justify-center md:justify-start">
                  <span className="w-2 h-2 rounded-full bg-[#8dc63f] animate-pulse inline-block" />
                  <span className="text-xs font-semibold text-[#8dc63f] uppercase tracking-widest">
                    QR Generated
                  </span>
                </div>
                <h2 className="text-xl font-bold text-[#1a3a6b]">
                  {formData.companyName || "Your Company"}
                </h2>
                <p className="text-gray-500 text-sm mt-0.5">
                  {[formData.designation, formData.city]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                {formData.salaryMin && formData.salaryMax && (
                  <p className="text-[#1a3a6b] font-semibold text-sm mt-1">
                    ₹{formData.salaryMin}–{formData.salaryMax} LPA
                  </p>
                )}
                <span
                  className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full
                  bg-green-50 border border-green-200 text-green-700 text-xs font-semibold"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                  Approved
                </span>

                <div className="flex gap-3 mt-4 justify-center md:justify-start flex-wrap">
                  <a
                    href={qrPreview}
                    download="company-qr.png"
                    className="submit-btn px-5 py-2.5 rounded-xl text-white font-semibold text-sm shadow-sm"
                  >
                    ↓ Download QR
                  </a>
                  <button
                    onClick={() => {
                      setQrPreview(null);
                      setSubmitted(false);
                      setActiveSection(0);
                    }}
                    className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm
                      font-medium hover:bg-gray-50 transition-all"
                  >
                    ↺ Reset Form
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

/* ── Helpers ── */
function SHead({ title, sub }) {
  return (
    <div className="pb-3 border-b border-gray-100 mb-1">
      <h2 className="text-base font-bold text-[#1a3a6b]">{title}</h2>
      <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
    </div>
  );
}

function Grid2({ children }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
  );
}

function F({ label, children, span2 }) {
  return (
    <div className={span2 ? "md:col-span-2" : ""}>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}
