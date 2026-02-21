import { useState } from "react";
import {
  INDUSTRIES,
  COMPANY_SIZES,
  JOB_TYPES,
  SECTIONS,
} from "../../Data/dummyData";
import { useDispatch, useSelector } from "react-redux";
import { downloadQRPDF, generateQR } from "../../Redux/thunks/qrThunks";
import { resetQRState } from "../../redux/slices/qrSlice";
import { calcProgress } from "../../services/Progressfix";
import { useEffect } from "react";

export default function CreateCompanyQR() {
  const [formData, setFormData] = useState({
    // ── Company Profile ──
    companyName: "",
    tagline: "",
    industry: "",
    companySize: "",
    foundedYear: "",
    employeesCount: "", // NEW (used in overview)
    headquarters: "", // NEW (HQ display)
    website: "",
    linkedIn: "",
    activelyHiring: true, // NEW (used in hero badges)
    openings: "", // NEW (used in hero badge)

    // ── Contact Info ──
    email: "",
    phone: "",
    altPhone: "",

    // ── Location ──
    country: "",
    region: "",
    city: "",
    zone: "",
    address: "",
    pincode: "",

    // ── Job Details ──
    openings: "",

    // ── Additional Contact ──
    contactPerson: "",
    contactRole: "",
    notes: "",

    // ── Company Content ──
    about: "",
    mission: "",
    vision: "",

    // ── Job Positions (Dynamic Array)
    jobs: [
      {
        title: "",
        department: "",
        jobType: "",
        location: "",
        workplaceType: "", // Remote / Hybrid / Onsite
        exp: "",
        salaryMin: "",
        salaryMax: "",
        skills: [],
        deadline: "",
        description: "",
      },
    ],

    // ── Why Join Us (Dynamic Array)
    whyJoinUs: [
      {
        icon: "",
        title: "",
        desc: "",
      },
    ],
  });

  const [activeSection, setActiveSection] = useState(0);

  const [showQR, setShowQR] = useState(false);

  const dispatch = useDispatch();
  const { loading, error, qrImage, redirectUrl, token, downloading } =
    useSelector((state) => state.qr);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  useEffect(() => {
    const maxJobs = Number(formData.openings || 0);

    setFormData((prev) => {
      let updatedJobs = [...prev.jobs];

      if (maxJobs === 0) return prev;

      // Trim if too many
      if (updatedJobs.length > maxJobs) {
        updatedJobs = updatedJobs.slice(0, maxJobs);
      }

      // Add if less
      while (updatedJobs.length < maxJobs) {
        updatedJobs.push({
          title: "",
          department: "",
          jobType: "",
          location: "",
          workplaceType: "",
          exp: "",
          salaryMin: "",
          salaryMax: "",
          skills: [],
          deadline: "",
          description: "",
        });
      }

      return { ...prev, jobs: updatedJobs };
    });
  }, [formData.openings]);

  const validateForm = () => {
    if (!formData.companyName.trim()) return "Company name is required";

    if (!formData.industry) return "Industry is required";

    if (!formData.email.match(/^\S+@\S+\.\S+$/)) return "Invalid email format";

    if (!/^\d{7,15}$/.test(formData.phone)) return "Phone must be 7–15 digits";

    if (!formData.city.trim()) return "City is required";

    if (!formData.jobs[0]?.title.trim())
      return "At least one job title is required";

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errorMsg = validateForm();
    if (errorMsg) {
      alert(errorMsg);
      return;
    }

    const payload = {
      company: {
        name: formData.companyName,
        tagline: formData.tagline,
        industry: formData.industry,
        size: formData.companySize,
        founded: formData.foundedYear,
        employees: formData.employeesCount,
        headquarters: formData.headquarters || formData.city,
        website: formData.website,
        linkedIn: formData.linkedIn,
        activelyHiring: formData.activelyHiring,
        openings: formData.openings,
        contact: {
          email: formData.email,
          phone: formData.phone,
          altPhone: formData.altPhone,
        },
        location: {
          country: formData.country,
          region: formData.region,
          city: formData.city,
          zone: formData.zone,
          address: formData.address,
          pincode: formData.pincode,
        },
      },
      metadata: {
        contactPerson: formData.contactPerson,
        contactRole: formData.contactRole,
        notes: formData.notes,
      },

      about: formData.about,
      mission: formData.mission,
      vision: formData.vision,

      jobs: formData.jobs,
      whyJoinUs: formData.whyJoinUs.filter(
        (item) => item.title.trim() || item.desc.trim() || item.icon.trim(),
      ),
    };

    const result = await dispatch(generateQR(payload));

    if (generateQR.fulfilled.match(result)) {
      setShowQR(true); // 👈 Only show after success
    }
  };

  const updateJob = (index, field, value) => {
    const updated = [...formData.jobs];
    updated[index][field] = value;
    setFormData({ ...formData, jobs: updated });
  };

  const addJob = () => {
    const maxJobs = Number(formData.openings || 0);

    if (!maxJobs) {
      alert("Please enter number of Open Roles first.");
      return;
    }

    if (formData.jobs.length >= maxJobs) {
      alert(`You can only add ${maxJobs} job role(s).`);
      return;
    }

    setFormData({
      ...formData,
      jobs: [
        ...formData.jobs,
        {
          title: "",
          department: "",
          jobType: "",
          location: "",
          workplaceType: "",
          exp: "",
          salaryMin: "",
          salaryMax: "",
          skills: [],
          deadline: "",
          description: "",
        },
      ],
    });
  };

  const removeJob = (index) => {
    const updated = formData.jobs.filter((_, i) => i !== index);
    setFormData({ ...formData, jobs: updated });
  };

  const addSkill = (index, skill) => {
    if (!skill.trim()) return;

    const updated = [...formData.jobs];
    const existingSkills = updated[index].skills;

    if (!existingSkills.includes(skill.trim())) {
      existingSkills.push(skill.trim());
    }

    setFormData({ ...formData, jobs: updated });
  };

  const removeSkill = (jobIndex, skillIndex) => {
    const updated = [...formData.jobs];
    updated[jobIndex].skills.splice(skillIndex, 1);
    setFormData({ ...formData, jobs: updated });
  };

  const updateHighlight = (index, field, value) => {
    const updated = [...formData.whyJoinUs];
    updated[index][field] = value;
    setFormData({ ...formData, whyJoinUs: updated });
  };

  const addHighlight = () => {
    setFormData({
      ...formData,
      whyJoinUs: [...formData.whyJoinUs, { icon: "", title: "", desc: "" }],
    });
  };

  const removeHighlight = (index) => {
    const updated = [...formData.whyJoinUs];
    updated.splice(index, 1);
    setFormData({ ...formData, whyJoinUs: updated });
  };

  const handleNumberInput = (e) => {
    const { name, value } = e.target;

    if (!/^\d*$/.test(value)) return;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const progress = calcProgress(formData);

  const inp = `
    w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-800
    bg-white placeholder-gray-400
    focus:outline-none focus:border-[#1a3a6b] focus:ring-2 focus:ring-[#1a3a6b]/10
    transition-all duration-150
  `;

  return (
    <div
      style={{ fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif" }}
      className="w-full mt-10"
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
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={4}
                        onChange={handleNumberInput}
                        placeholder="e.g. 2015"
                        className={inp}
                      />
                    </F>

                    <F label="Employees Count">
                      <input
                        name="employeesCount"
                        value={formData.employeesCount}
                        onChange={handleNumberInput}
                        placeholder="e.g. 1,001–5,000"
                        className={inp}
                      />
                    </F>

                    <F label="Headquarters">
                      <input
                        name="headquarters"
                        value={formData.headquarters}
                        onChange={handleChange}
                        placeholder="e.g. Bengaluru, Karnataka"
                        className={inp}
                      />
                    </F>

                    <F label="Open Roles">
                      <input
                        name="openings"
                        value={formData.openings}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        onChange={handleNumberInput}
                        placeholder="e.g. 47"
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
                        onChange={handleNumberInput}
                        type="tel"
                        maxLength={10}
                        placeholder="98765 43210"
                        required
                        className={inp}
                      />
                    </F>
                    <F label="Alternate Phone">
                      <input
                        name="altPhone"
                        value={formData.altPhone}
                        onChange={handleNumberInput}
                        type="tel"
                        maxLength={10}
                        placeholder="98765 00000"
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
                        onChange={handleNumberInput}
                        placeholder="e.g. 248001"
                        className={inp}
                      />
                    </F>
                  </Grid2>
                </div>
              )}

              {/* 3 — About Company */}
              {activeSection === 3 && (
                <div className="space-y-4">
                  <SHead
                    title="About Company"
                    sub="Describe your organisation"
                  />
                  <Grid2>
                    <F label="About Company" span2>
                      <textarea
                        name="about"
                        value={formData.about}
                        onChange={handleChange}
                        rows={4}
                        className={inp + " resize-none"}
                      />
                    </F>

                    <F label="Mission" span2>
                      <textarea
                        name="mission"
                        value={formData.mission}
                        onChange={handleChange}
                        rows={2}
                        className={inp + " resize-none"}
                      />
                    </F>

                    <F label="Vision" span2>
                      <textarea
                        name="vision"
                        value={formData.vision}
                        onChange={handleChange}
                        rows={2}
                        className={inp + " resize-none"}
                      />
                    </F>
                  </Grid2>
                </div>
              )}

              {/* 4 — Job Positions */}
              {activeSection === 4 && (
                <div className="space-y-6">
                  <SHead title="Job Positions" sub="Add open roles" />

                  {formData.jobs.map((job, index) => (
                    <div
                      key={index}
                      className="border border-gray-300 p-6 rounded-xl space-y-5 bg-gray-50"
                    >
                      <div className="grid md:grid-cols-2 gap-4">
                        {/* Job Title */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
                            Job Title
                          </label>
                          <input
                            className={inp}
                            value={job.title}
                            onChange={(e) =>
                              updateJob(index, "title", e.target.value)
                            }
                          />
                        </div>

                        {/* Department */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
                            Department
                          </label>
                          <input
                            className={inp}
                            value={job.department}
                            onChange={(e) =>
                              updateJob(index, "department", e.target.value)
                            }
                          />
                        </div>

                        {/* Job Type */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
                            Job Type
                          </label>
                          <select
                            className={inp}
                            value={job.jobType}
                            onChange={(e) =>
                              updateJob(index, "jobType", e.target.value)
                            }
                          >
                            <option value="">Select Job Type</option>
                            {JOB_TYPES.map((t) => (
                              <option key={t}>{t}</option>
                            ))}
                          </select>
                        </div>

                        {/* Workplace Type */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
                            Workplace Type
                          </label>
                          <select
                            className={inp}
                            value={job.workplaceType}
                            onChange={(e) =>
                              updateJob(index, "workplaceType", e.target.value)
                            }
                          >
                            <option value="">Select Workplace Type</option>
                            <option>Remote</option>
                            <option>Hybrid</option>
                            <option>On-site</option>
                          </select>
                        </div>

                        {/* Location */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
                            Location
                          </label>
                          <input
                            className={inp}
                            value={job.location}
                            onChange={(e) =>
                              updateJob(index, "location", e.target.value)
                            }
                          />
                        </div>

                        {/* Experience */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
                            Experience
                          </label>
                          <input
                            className={inp}
                            value={job.exp}
                            onChange={(e) =>
                              updateJob(index, "exp", e.target.value)
                            }
                          />
                        </div>

                        {/* Salary Min */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
                            Salary Min (₹ LPA)
                          </label>
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            className={inp}
                            value={job.salaryMin}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (/^\d*$/.test(value)) {
                                updateJob(index, "salaryMin", value);
                              }
                            }}
                          />
                        </div>

                        {/* Salary Max */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
                            Salary Max (₹ LPA)
                          </label>
                          <input
                            type="number"
                            className={inp}
                            value={job.salaryMax}
                            onChange={(e) =>
                              updateJob(index, "salaryMax", e.target.value)
                            }
                          />
                        </div>

                        {/* Deadline */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
                            Application Deadline
                          </label>
                          <input
                            type="date"
                            className={inp}
                            value={job.deadline}
                            onChange={(e) =>
                              updateJob(index, "deadline", e.target.value)
                            }
                          />
                        </div>

                        {/* Description */}
                        <div className="md:col-span-2">
                          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
                            Job Description
                          </label>
                          <textarea
                            rows={3}
                            className={inp + " resize-none"}
                            value={job.description}
                            onChange={(e) =>
                              updateJob(index, "description", e.target.value)
                            }
                          />
                        </div>

                        {/* Skills */}
                        <div className="md:col-span-2">
                          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
                            Key Skills
                          </label>

                          <input
                            placeholder="Type skill and press Enter"
                            className={inp}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                addSkill(index, e.target.value);
                                e.target.value = "";
                              }
                            }}
                          />

                          <div className="flex flex-wrap gap-2 mt-3">
                            {job.skills.map((skill, skillIndex) => (
                              <span
                                key={skillIndex}
                                className="px-3 py-1 text-xs bg-[#eef3ff] text-[#1a3a6b] rounded-full flex items-center gap-2"
                              >
                                {skill}
                                <button
                                  type="button"
                                  onClick={() => removeSkill(index, skillIndex)}
                                  className="text-red-500 text-xs font-bold"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {formData.jobs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeJob(index)}
                          className="text-red-500 text-sm font-medium"
                        >
                          Remove Job
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addJob}
                    disabled={
                      formData.jobs.length >= Number(formData.openings || 0)
                    }
                    className={`px-4 py-2 rounded-lg text-sm
    ${
      formData.jobs.length >= Number(formData.openings || 0)
        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
        : "bg-[#1a3a6b] text-white"
    }
  `}
                  >
                    + Add Job
                  </button>
                </div>
              )}

              {/* 5 — Why Join Us */}
              {/* 5 — Why Join Us */}
              {activeSection === 5 && (
                <div className="space-y-6">
                  <SHead
                    title="Why Join Us"
                    sub="Add company highlights that attract candidates"
                  />

                  {formData.whyJoinUs.map((item, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 p-6 rounded-xl space-y-4 bg-gray-50"
                    >
                      <div className="grid md:grid-cols-2 gap-4">
                        {/* Icon */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
                            Icon (Emoji)
                          </label>
                          <input
                            placeholder="e.g. 🚀"
                            className={inp}
                            value={item.icon}
                            onChange={(e) =>
                              updateHighlight(index, "icon", e.target.value)
                            }
                          />
                        </div>

                        {/* Title */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
                            Highlight Title
                          </label>
                          <input
                            placeholder="e.g. Move Fast, Ship Often"
                            className={inp}
                            value={item.title}
                            onChange={(e) =>
                              updateHighlight(index, "title", e.target.value)
                            }
                          />
                        </div>

                        {/* Description */}
                        <div className="md:col-span-2">
                          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
                            Description
                          </label>
                          <textarea
                            rows={3}
                            placeholder="Describe why candidates should join..."
                            className={inp + " resize-none"}
                            value={item.desc}
                            onChange={(e) =>
                              updateHighlight(index, "desc", e.target.value)
                            }
                          />
                        </div>
                      </div>

                      {/* Remove button */}
                      {formData.whyJoinUs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeHighlight(index)}
                          className="text-red-500 text-sm font-medium"
                        >
                          Remove Highlight
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addHighlight}
                    className="px-4 py-2 bg-[#1a3a6b] text-white rounded-lg text-sm"
                  >
                    + Add Highlight
                  </button>
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
                    disabled={loading}
                    className="submit-btn px-7 py-2.5 rounded-xl text-white font-semibold text-sm
    flex items-center gap-2 shadow-md disabled:opacity-50"
                  >
                    {loading ? "Generating..." : "⬡ Generate QR"}
                  </button>
                )}
              </div>
            </div>
          </form>

          {/* ── QR Result ── */}
          {showQR && qrImage && (
            <div className="mt-6 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col md:flex-row md:items-center gap-8 fade-up">
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl shrink-0">
                <img
                  src={qrImage}
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
                  <button
                    onClick={() =>
                      dispatch(
                        downloadQRPDF({
                          token,
                          companyName: formData.companyName,
                        }),
                      )
                    }
                    disabled={!token || downloading}
                    className={`submit-btn px-5 py-2.5 rounded-xl text-white font-semibold text-sm shadow-sm
    ${!token ? "opacity-50 cursor-not-allowed" : ""}
  `}
                  >
                    {downloading ? "Downloading..." : "↓ Download PDF"}
                  </button>
                  <button
                    onClick={() => {
                      dispatch(resetQRState());
                      setShowQR(false);
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
