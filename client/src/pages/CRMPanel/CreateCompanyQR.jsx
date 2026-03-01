import { useEffect, useRef, useState } from "react";
import {
  INDUSTRIES,
  COMPANY_SIZES,
  JOB_TYPES,
  SECTIONS,
  EMPLOYEE_COUNT_OPTIONS,
} from "../../Data/dummyData";
import { useDispatch, useSelector } from "react-redux";
import { downloadQRPDF, generateQR } from "../../Redux/thunks/qrThunks";
import { resetQRState } from "../../Redux/slices/qrSlice";
import { calcProgress } from "../../services/Progressfix";
import { Country, State, City } from "country-state-city";

export default function CreateCompanyQR() {
  const [formData, setFormData] = useState({
    // ── Company Profile ──
    companyName: "",
    tagline: "",
    industry: "",
    industryOther: "",
    logo: null,
    logoPreview: "",
    companySize: "",
    foundedYear: "",
    employeesCount: "",
    headquarters: "",
    website: "",
    googleMapLink: "",
    socialLinks: {
      linkedin: "",
      twitter: "",
      instagram: "",
      facebook: "",
    },
    activelyHiring: true,
    openings: "",

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
        hideSalary: false,
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
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const fileInputRef = useRef(null);

  const dispatch = useDispatch();
  const { loading, error, qrImage, redirectUrl, token, downloading } =
    useSelector((state) => state.qr);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "industry" && value !== "Other") {
      setFormData({
        ...formData,
        industry: value,
        industryOther: "",
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

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

  useEffect(() => {
    const allCountries = Country.getAllCountries();
    setCountries(allCountries);
  }, []);

  useEffect(() => {
    if (!formData.country) return;

    const selectedCountry = countries.find((c) => c.name === formData.country);

    if (!selectedCountry) return;

    const countryStates = State.getStatesOfCountry(selectedCountry.isoCode);

    setStates(countryStates);
    setCities([]);

    setFormData((prev) => ({
      ...prev,
      region: "",
      city: "",
    }));
  }, [formData.country]);

  useEffect(() => {
    if (!formData.region) return;

    const selectedCountry = countries.find((c) => c.name === formData.country);

    const selectedState = states.find((s) => s.name === formData.region);

    if (!selectedCountry || !selectedState) return;

    const stateCities = City.getCitiesOfState(
      selectedCountry.isoCode,
      selectedState.isoCode,
    );

    setCities(stateCities);

    setFormData((prev) => ({
      ...prev,
      city: "",
    }));
  }, [formData.region]);

  const validateForm = () => {
    if (!formData.companyName.trim()) return "Company name is required";

    // if (!formData.industry) return "Industry is required";
    if (!formData.industry) return "Industry is required";

    if (formData.industry === "Other" && !formData.industryOther.trim())
      return "Please specify your industry";

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
        // industry: formData.industry,
        industry:
          formData.industry === "Other"
            ? formData.industryOther
            : formData.industry,
        size: formData.companySize,
        founded: formData.foundedYear,
        employees: formData.employeesCount,
        headquarters: formData.headquarters || formData.city,
        website: formData.website,
        googleMapLink: formData.googleMapLink,
        socialLinks: formData.socialLinks,
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

    // const result = await dispatch(generateQR(payload));
    const formDataToSend = new FormData();

    formDataToSend.append("data", JSON.stringify(payload));

    if (formData.logo) {
      formDataToSend.append("logo", formData.logo);
    }

    const result = await dispatch(generateQR(formDataToSend));

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

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate type
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file.");
      return;
    }

    // Validate size (2MB example)
    if (file.size > 2 * 1024 * 1024) {
      alert("Logo must be under 2MB.");
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    setFormData((prev) => ({
      ...prev,
      logo: file,
      logoPreview: previewUrl,
    }));
  };

  const handleRemoveLogo = () => {
    if (formData.logoPreview) {
      URL.revokeObjectURL(formData.logoPreview); // prevent memory leak
    }

    setFormData((prev) => ({
      ...prev,
      logo: null,
      logoPreview: "",
    }));

    // Reset file input value (important!)
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSocialChange = (platform, value) => {
    setFormData((prev) => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value,
      },
    }));
  };

  const progress = calcProgress(formData);

  const inp = `
    w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-800
    bg-white placeholder-gray-400
    focus:outline-none focus:border-[#1a3a6b] focus:ring-2 focus:ring-[#1a3a6b]/10
    transition-all duration-150
  `;

  const selectClass = `
  w-full appearance-none
  border border-gray-200 rounded-xl
  px-4 py-2.5 pr-10 text-sm text-gray-800
  bg-white
  focus:outline-none focus:border-[#1a3a6b]
  focus:ring-2 focus:ring-[#1a3a6b]/10
  hover:border-gray-300
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

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease forwards;
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
                    <F label="Company Logo">
                      <div className="flex items-center gap-6">
                        {/* Preview / Upload Box */}
                        <div className="relative">
                          <label
                            htmlFor="logoUpload"
                            className={`
          w-28 h-28 flex flex-col items-center justify-center
          border-2 border-dashed rounded-xl cursor-pointer
          transition-all duration-200
          ${
            formData.logoPreview
              ? "border-gray-200 bg-white"
              : "border-gray-300 hover:border-[#1a3a6b] hover:bg-[#f8faff]"
          }
        `}
                          >
                            {formData.logoPreview ? (
                              <img
                                src={formData.logoPreview}
                                alt="Company Logo"
                                className="w-full h-full object-contain p-3"
                              />
                            ) : (
                              <div className="text-center px-2">
                                <div className="text-2xl mb-1">📷</div>
                                <p className="text-xs text-gray-500 leading-tight">
                                  Click to upload
                                </p>
                              </div>
                            )}
                          </label>

                          {/* Hidden Input */}
                          <input
                            id="logoUpload"
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                          />

                          {/* Remove Button */}
                          {formData.logoPreview && (
                            <button
                              type="button"
                              onClick={handleRemoveLogo}
                              className="absolute -top-2 -right-2 w-7 h-7 flex items-center justify-center
                     bg-red-500 text-white text-sm rounded-full shadow-md
                     hover:bg-red-600 transition"
                            >
                              ×
                            </button>
                          )}
                        </div>

                        {/* Info Text */}
                        <div className="text-sm text-gray-500 space-y-1">
                          <p className="font-medium text-gray-700">
                            Upload Company Logo
                          </p>
                          <p className="text-xs">PNG, JPG or SVG • Max 2MB</p>
                          <p className="text-xs text-gray-400">
                            Recommended size: 300×300px
                          </p>
                        </div>
                      </div>
                    </F>
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
                    <F>
                      <div className="relative">
                        <CustomSelect
                          label="Industry"
                          value={formData.industry}
                          required
                          placeholder="Select Industry"
                          options={[...INDUSTRIES, "Other"]}
                          onChange={(val) =>
                            setFormData({
                              ...formData,
                              industry: val,
                              industryOther:
                                val !== "Other" ? "" : formData.industryOther,
                            })
                          }
                        />
                      </div>
                    </F>
                    {formData.industry === "Other" && (
                      <div className="animate-fadeIn">
                        <F label="Specify Industry *">
                          <input
                            name="industryOther"
                            value={formData.industryOther}
                            onChange={handleChange}
                            placeholder="Enter your industry"
                            className={inp}
                            required
                          />
                        </F>
                      </div>
                    )}
                    <F>
                      <CustomSelect
                        label="Company Size"
                        value={formData.companySize}
                        placeholder="Select Size"
                        options={COMPANY_SIZES}
                        onChange={(val) =>
                          setFormData({ ...formData, companySize: val })
                        }
                      />
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

                    <F>
                      <CustomSelect
                        label="Employees Count"
                        value={formData.employeesCount}
                        placeholder="Select Employee Range"
                        options={EMPLOYEE_COUNT_OPTIONS}
                        onChange={(val) =>
                          setFormData({ ...formData, employeesCount: val })
                        }
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
                    <F label="LinkedIn URL">
                      <input
                        type="url"
                        placeholder="https://linkedin.com/company/yourcompany"
                        value={formData.socialLinks.linkedin}
                        onChange={(e) =>
                          handleSocialChange("linkedin", e.target.value)
                        }
                        className={inp}
                      />
                    </F>

                    <F label="Twitter (X)">
                      <input
                        type="url"
                        placeholder="https://twitter.com/yourcompany"
                        value={formData.socialLinks.twitter}
                        onChange={(e) =>
                          handleSocialChange("twitter", e.target.value)
                        }
                        className={inp}
                      />
                    </F>

                    <F label="Instagram">
                      <input
                        type="url"
                        placeholder="https://instagram.com/yourcompany"
                        value={formData.socialLinks.instagram}
                        onChange={(e) =>
                          handleSocialChange("instagram", e.target.value)
                        }
                        className={inp}
                      />
                    </F>

                    <F label="Facebook">
                      <input
                        type="url"
                        placeholder="https://facebook.com/yourcompany"
                        value={formData.socialLinks.facebook}
                        onChange={(e) =>
                          handleSocialChange("facebook", e.target.value)
                        }
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
                  <F label="Google Maps Profile Link">
                    <input
                      name="googleMapLink"
                      type="url"
                      value={formData.googleMapLink}
                      onChange={handleChange}
                      placeholder="https://maps.google.com/?cid=..."
                      className={inp}
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Paste your Google Business profile or location link.
                    </p>
                  </F>
                  <Grid2>
                    <F>
                      <CustomSelect
                        label="Country"
                        value={formData.country}
                        placeholder="Select Country"
                        options={countries.map((c) => c.name)}
                        onChange={(val) =>
                          setFormData({ ...formData, country: val })
                        }
                      />
                    </F>
                    <F>
                      <CustomSelect
                        label="State / Region"
                        value={formData.region}
                        placeholder="Select State"
                        options={states.map((s) => s.name)}
                        onChange={(val) =>
                          setFormData({ ...formData, region: val })
                        }
                      />
                    </F>
                    <F>
                      <CustomSelect
                        label="City *"
                        value={formData.city}
                        placeholder="Select City"
                        options={cities.map((c) => c.name)}
                        onChange={(val) =>
                          setFormData({ ...formData, city: val })
                        }
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
                          <CustomSelect
                            label="Job Type"
                            value={job.jobType}
                            placeholder="Select Job Type"
                            options={JOB_TYPES}
                            onChange={(val) => updateJob(index, "jobType", val)}
                          />
                        </div>

                        {/* Workplace Type */}
<div>
  <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
    Workplace Type
  </label>

  <div className="flex gap-2">
    {["Remote", "Hybrid", "On-site"].map((type) => (
      <button
        key={type}
        type="button"
        onClick={() => updateJob(index, "workplaceType", type)}
        className={`
          flex-1 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150
          border
          ${
            job.workplaceType === type
              ? "bg-[#1a3a6b] text-white border-[#1a3a6b]"
              : "bg-white text-gray-600 border-gray-200 hover:border-[#1a3a6b] hover:bg-[#f5f8ff]"
          }
        `}
      >
        {type}
      </button>
    ))}
  </div>
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

                        <div className="md:col-span-2 flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={job.hideSalary}
                            onChange={(e) => {
                              updateJob(index, "hideSalary", e.target.checked);

                              if (e.target.checked) {
                                updateJob(index, "salaryMin", "");
                                updateJob(index, "salaryMax", "");
                              }
                            }}
                            className="w-4 h-4 accent-[#1a3a6b]"
                          />
                          <label className="text-sm font-medium text-gray-600">
                            Do not display CTC for this job
                          </label>
                        </div>
                        {!job.hideSalary && (
                          <>
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
                          </>
                        )}

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
                {formData.jobs[0] &&
                  !formData.jobs[0].hideSalary &&
                  formData.jobs[0].salaryMin &&
                  formData.jobs[0].salaryMax && (
                    <p className="text-[#1a3a6b] font-semibold text-sm mt-1">
                      ₹{formData.jobs[0].salaryMin}–{formData.jobs[0].salaryMax}{" "}
                      LPA
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
                {redirectUrl && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-1">
                      Public Page URL
                    </p>

                    <div className="flex items-center gap-2">
                      <input
                        value={redirectUrl}
                        readOnly
                        className="flex-1 text-xs px-3 py-2 border border-gray-200 rounded-lg bg-gray-50"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          navigator.clipboard.writeText(redirectUrl)
                        }
                        className="px-3 py-2 text-xs bg-[#1a3a6b] text-white rounded-lg"
                      >
                        Copy
                      </button>

                      <a
                        href={redirectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 text-xs border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        Open
                      </a>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      This link can be shared directly without scanning the QR.
                    </p>
                  </div>
                )}
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

function CustomSelect({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Select option",
  required = false,
  span2 = false,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (open && searchRef.current) {
      searchRef.current.focus();
    }
  }, [open]);

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className={span2 ? "md:col-span-2" : ""}>
      {label && (
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
          {label} {required && "*"}
        </label>
      )}

      <div ref={wrapperRef} className="relative">
        {/* Trigger */}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="
            w-full flex items-center justify-between
            border border-gray-200 rounded-xl
            px-4 py-2.5 text-sm
            bg-white
            hover:border-gray-300
            focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/10
            transition-all
          "
        >
          <span className={value ? "text-gray-800" : "text-gray-400"}>
            {value || placeholder}
          </span>

          <svg
            className={`w-4 h-4 transition-transform ${
              open ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {/* Dropdown */}
        {open && (
          <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg animate-fadeIn">
            {/* Search Field */}
            <div className="p-2 border-b border-gray-100">
              <input
                ref={searchRef}
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="
                  w-full px-3 py-2 text-sm
                  border border-gray-200 rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/10
                "
              />
            </div>

            {/* Options */}
            <div className="max-h-60 overflow-y-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt) => (
                  <div
                    key={opt}
                    onClick={() => {
                      onChange(opt);
                      setOpen(false);
                      setSearch("");
                    }}
                    className={`
                      px-4 py-2.5 text-sm cursor-pointer
                      hover:bg-[#eef2f9]
                      ${
                        value === opt
                          ? "bg-[#1a3a6b] text-white"
                          : "text-gray-700"
                      }
                    `}
                  >
                    {opt}
                  </div>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-gray-400">
                  No results found
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
