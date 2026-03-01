import { useEffect, useState } from "react";
import {
  HiLocationMarker,
  HiUsers,
  HiOfficeBuilding,
  HiBriefcase,
  HiCalendar,
  HiLightningBolt,
  HiShare,
  HiBookmark,
} from "react-icons/hi";
import { RiFacebookBoxLine, RiInstagramLine, RiLinkedinBoxFill, RiTwitterXLine } from "react-icons/ri";
import { MdVerified } from "react-icons/md";
import {
  LinkedinShareButton,
  WhatsappShareButton,
  TwitterShareButton,
  TelegramShareButton,
  FacebookShareButton,
  LinkedinIcon,
  WhatsappIcon,
  TwitterIcon,
  TelegramIcon,
  FacebookIcon,
} from "react-share";
import AppLayout from "../Layout/AppLayout";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchLandingData } from "../Redux/thunks/landingThunks";

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */

function NavTab({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="relative px-6 py-4 text-[14px] font-semibold whitespace-nowrap"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <span
        className={`transition-colors ${
          active ? "text-[#1a3c7a]" : "text-[#8fa3bf] hover:text-[#4a5f82]"
        }`}
      >
        {label}
      </span>

      {active && (
        <div className="absolute bottom-0 left-0 w-full h-0.75 rounded-full bg-linear-to-r from-[#00a8b4] to-[#5cba47]" />
      )}
    </button>
  );
}

function SectionHeading({ title }) {
  return (
    <h2
      className="text-[20px] font-bold text-[#1a3c7a] mb-6"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      {title}
    </h2>
  );
}

/* ─────────────────────────────────────────────
   Page
───────────────────────────────────────────── */

export default function CompanyOverviewPage() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [savedJobs, setSavedJobs] = useState({});
  const [following, setFollowing] = useState(false);

  const { token } = useParams();
  const dispatch = useDispatch();

  const { company, loading, error } = useSelector((state) => state.landing);

  useEffect(() => {
    if (token) {
      dispatch(fetchLandingData(token));
    }
  }, [token, dispatch]);

  const tabs = ["Overview", "Jobs", "Why Join Us"];
  const toggleSave = (i) => setSavedJobs((p) => ({ ...p, [i]: !p[i] }));

  const getEmbedMapUrl = () => {
    if (!location?.address) return null;

    const query = encodeURIComponent(
      `${location.address}, ${location.city}, ${location.region}, ${location.pincode}`,
    );

    return `https://www.google.com/maps?q=${query}&output=embed`;
  };

  if (loading) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  if (error) {
    return <div className="p-10 text-center text-red-500">{error}</div>;
  }

  if (!company) {
    return null;
  }

  const {
    logo,
    name,
    tagline,
    industry,
    employees,
    size,
    headquarters,
    founded,
    activelyHiring,
    openings,
    activeJobCount,
    website,
    googleMapLink,
    about,
    location = {},
    socialLinks = {},
    jobs = [],
    whyJoinUs = [],
  } = company;

  return (
    <AppLayout>
      <div className="animate-[fadeIn_.4s_ease]">
        {/* ───────────────── HERO SECTION ───────────────── */}
        <div className="relative">
          {/* Gradient Cover */}
          <div
            className="h-80 w-full relative overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, #0f2550 0%, #1a3c7a 45%, #00a8b4 100%)",
            }}
          >
            {/* Subtle Overlay */}
            <div className="absolute inset-0 bg-black/10" />

            {/* Decorative Blur Orbs */}
            <div className="absolute -top-20 -right-20 w-96 h-96 bg-[#5cba47]/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-10 w-80 h-80 bg-[#00a8b4]/20 rounded-full blur-3xl" />
          </div>

          {/* Company Card Overlay */}
          <div className="max-w-6xl mx-auto px-6">
            <div className="relative -mt-28 bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-[#e6ecff] p-8 flex flex-col md:flex-row gap-8">
              {/* Logo */}
              <div className="shrink-0">
                {logo ? (
                  <div className="shrink-0">
                    <img
                      src={logo}
                      alt={name}
                      className="w-28 h-28 object-contain rounded-3xl bg-white border border-[#e6ecff] p-4 shadow-xl"
                    />
                  </div>
                ) : (
                  <div
                    className="w-28 h-28 rounded-3xl flex items-center justify-center text-white text-3xl font-extrabold shadow-xl"
                    style={{
                      background: "linear-gradient(135deg,#0f2550,#2d5299)",
                    }}
                  >
                    {name?.charAt(0)}
                  </div>
                )}
              </div>

              {/* Company Info */}
              <div className="flex-1">
                {/* Name + Verified */}
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-3xl md:text-4xl font-extrabold text-[#1a3c7a]">
                    {company.name}
                  </h1>
                  <MdVerified className="text-[#00a8b4] w-6 h-6" />
                </div>

                {/* Tagline */}
                <p className="text-[#4a5f82] mt-3 text-[15px] leading-relaxed max-w-3xl">
                  {company.tagline}
                </p>

                {/* Meta Row */}
                <div className="flex flex-wrap gap-4 mt-4 text-sm text-[#6b7c93]">
                  <span className="flex items-center gap-1">
                    <HiOfficeBuilding /> {company.industry}
                  </span>
                  <span className="flex items-center gap-1">
                    <HiUsers /> {company.employees || company.size}
                  </span>
                  <span className="flex items-center gap-1">
                    <HiLocationMarker />{" "}
                    {company.headquarters || company.location?.city}
                  </span>
                  <span className="flex items-center gap-1">
                    <HiCalendar /> Founded {company.founded}
                  </span>
                </div>

                {/* Badges */}
                <div className="mt-5 flex flex-wrap gap-3">
                  {company.activelyHiring && (
                    <span className="px-4 py-1.5 text-xs font-semibold rounded-full bg-[#e6f9fb] text-[#00a8b4]">
                      Actively Hiring
                    </span>
                  )}

                  <span className="px-4 py-1.5 text-xs font-semibold rounded-full bg-[#eef3ff] text-[#1a3c7a]">
                    {company.openings || company.activeJobCount || 0} Open Roles
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex flex-wrap gap-4">
                  <button
                    onClick={() => setFollowing(!following)}
                    className={`px-6 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                      following
                        ? "bg-[#f0f4ff] border-[#1a3c7a] text-[#1a3c7a]"
                        : "bg-white border-[#d8e4f4] hover:border-[#1a3c7a]"
                    }`}
                  >
                    {following ? "Following" : "Follow"}
                  </button>

                  <a
                    href={company.website}
                    target="_blank"
                    rel="noreferrer"
                    className="px-6 py-2.5 rounded-xl text-sm font-semibold border border-[#d8e4f4] bg-white hover:border-[#00a8b4]"
                  >
                    Visit Website
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="bg-white border-b border-gray-200 sticky  mt-5 z-40">
          <div className="max-w-6xl mx-auto px-6 flex">
            {tabs.map((tab) => (
              <NavTab
                key={tab}
                label={tab}
                active={activeTab === tab}
                onClick={() => setActiveTab(tab)}
              />
            ))}
          </div>
        </div>

        {/* CONTENT */}
        <div className="max-w-6xl mx-auto px-6 py-10 grid lg:grid-cols-[1fr_320px] gap-10">
          {/* LEFT */}
          <div>
            {activeTab === "Overview" && (
              <div className="space-y-10">
                {/* ABOUT */}
                <div className="bg-white/90 backdrop-blur rounded-2xl border border-[#e6ecff] shadow-lg p-8">
                  <SectionHeading title="About Company" />
                  <p className="text-[#4a5f82] leading-relaxed whitespace-pre-line">
                    {company.about}
                  </p>
                </div>
              </div>
            )}

            {activeTab === "Jobs" && (
              <div className="space-y-6">
                <SectionHeading title="Open Positions" />

                {company.jobs?.length === 0 && (
                  <div className="text-gray-500">
                    No open positions available.
                  </div>
                )}

                {company.jobs?.map((job, i) => (
                  <div
                    key={i}
                    className="group bg-white rounded-2xl border border-[#e6ecff] p-6 hover:shadow-xl transition-all"
                  >
                    {/* Title */}
                    <h4 className="text-xl font-bold text-[#1a3c7a]">
                      {job.title}
                    </h4>

                    {/* Meta Row */}
                    <div className="flex flex-wrap gap-3 mt-2 text-sm text-[#6b7c93]">
                      <span className="flex items-center gap-1">
                        <HiLocationMarker /> {job.location}
                      </span>

                      <span className="flex items-center gap-1">
                        <HiBriefcase /> {job.department}
                      </span>

                      <span className="flex items-center gap-1">
                        <HiLightningBolt /> {job.jobType}
                      </span>

                      <span>{job.workplaceType}</span>
                    </div>

                    {/* Experience + Salary */}
                    <div className="mt-3 text-sm text-[#4a5f82]">
                      <div>
                        <strong>Experience:</strong> {job.experience} years
                      </div>

                      <div>
                        <strong>Salary:</strong> ₹{job.salaryMin} – ₹
                        {job.salaryMax} LPA
                      </div>
                    </div>

                    {/* Skills */}
                    {job.skills?.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {job.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 text-xs bg-[#eef3ff] text-[#1a3c7a] rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Description */}
                    {job.description && (
                      <p className="mt-4 text-sm text-[#4a5f82] leading-relaxed">
                        {job.description}
                      </p>
                    )}

                    {/* Deadline */}
                    {job.deadline && (
                      <div className="mt-3 text-xs text-gray-500">
                        Apply before:{" "}
                        {new Date(job.deadline).toLocaleDateString()}
                      </div>
                    )}

                    {/* Action Row */}
                    <div className="mt-5 flex justify-between items-center">
                      <button
                        onClick={() => toggleSave(i)}
                        className="flex items-center gap-1 text-sm font-medium text-[#4a5f82]"
                      >
                        <HiBookmark />
                        {savedJobs[i] ? "Saved" : "Save"}
                      </button>

                      <button className="px-4 py-2 text-xs font-bold text-white rounded-lg bg-gradient-to-r from-[#00a8b4] to-[#5cba47]">
                        Apply Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "Why Join Us" && (
              <div className="grid sm:grid-cols-2 gap-6">
                {company.whyJoinUs.map((item, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl border border-[#e6ecff] p-6 shadow-md"
                  >
                    <div className="text-2xl mb-3">{item.icon}</div>
                    <h4 className="font-bold text-[#1a3c7a] mb-2">
                      {item.title}
                    </h4>
                    <p className="text-sm text-[#4a5f82]">{item.desc}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="sticky top-28 space-y-6">
            <div className="bg-white rounded-2xl border border-[#e6ecff] p-6 shadow-md">
              {location?.address && (
                <div className="">
                  <h3 className="font-bold text-[#1a3c7a] mb-4">Location</h3>

                  {getEmbedMapUrl() && (
                    <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm mb-4">
                      <iframe
                        title="Company Location"
                        src={getEmbedMapUrl()}
                        width="100%"
                        height="220"
                        loading="lazy"
                        className="w-full"
                      />
                    </div>
                  )}

                  <div className="text-sm text-[#4a5f82] space-y-1">
                    <div>{location.address}</div>
                    <div>
                      {location.city}, {location.region}
                    </div>
                    <div>
                      {location.country} – {location.pincode}
                    </div>

                    <a
                      href={googleMapLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block mt-2 text-sm font-semibold text-[#00a8b4] hover:underline"
                    >
                      Open in Google Maps →
                    </a>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-[#e6ecff] p-6 shadow-md">
              <h3 className="font-bold text-[#1a3c7a] mb-4">Follow Us</h3>
              <div className="flex gap-4 text-2xl">
                {socialLinks?.linkedin?.startsWith("http") && (
                  <a
                    href={company.socialLinks.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#0A66C2] hover:scale-110 transition"
                  >
                    <RiLinkedinBoxFill />
                  </a>
                )}

                {socialLinks?.twitter?.startsWith("http") && (
                  <a
                    href={company.socialLinks.twitter}
                    target="_blank"
                    rel="noreferrer"
                    className="text-black hover:scale-110 transition"
                  >
                    <RiTwitterXLine />
                  </a>
                )}

                {socialLinks?.instagram?.startsWith("http") && (
                  <a
                    href={company.socialLinks.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="text-pink-500 hover:scale-110 transition"
                  >
                    <RiInstagramLine />
                  </a>
                )}

                {socialLinks?.facebook?.startsWith("http") && (
                  <a
                    href={company.socialLinks.facebook}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:scale-110 transition"
                  >
                    <RiFacebookBoxLine />
                  </a>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#e6ecff] p-6 shadow-md">
              <h3 className="font-bold text-[#1a3c7a] mb-4">Share Company</h3>

              <div className="flex flex-wrap gap-3">
                <LinkedinShareButton
                  url={window.location.href}
                  title={company.name}
                  summary={company.tagline}
                  source={company.website}
                >
                  <LinkedinIcon size={40} round />
                </LinkedinShareButton>

                <WhatsappShareButton
                  url={window.location.href}
                  title={`${company.name} - ${company.tagline}`}
                >
                  <WhatsappIcon size={40} round />
                </WhatsappShareButton>

                <TwitterShareButton
                  url={window.location.href}
                  title={`${company.name} - ${company.tagline}`}
                >
                  <TwitterIcon size={40} round />
                </TwitterShareButton>

                <TelegramShareButton
                  url={window.location.href}
                  title={`${company.name} - ${company.tagline}`}
                >
                  <TelegramIcon size={40} round />
                </TelegramShareButton>

                <FacebookShareButton
                  url={window.location.href}
                  quote={`${company.name} - ${company.tagline}`}
                >
                  <FacebookIcon size={40} round />
                </FacebookShareButton>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert("Link copied!");
                  }}
                  className="mt-4 w-full py-2 rounded-lg text-sm font-semibold bg-[#f0f4ff] hover:bg-[#e0e8ff]"
                >
                  Copy Link
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fade animation */}
      <style>{`
        @keyframes fadeIn {
          from { opacity:0; transform: translateY(8px); }
          to { opacity:1; transform: translateY(0); }
        }
      `}</style>
    </AppLayout>
  );
}
