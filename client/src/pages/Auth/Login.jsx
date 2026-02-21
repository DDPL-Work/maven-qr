import React, { useState } from "react";
import { FiUser, FiEye, FiEyeOff } from "react-icons/fi";
import { MdAdminPanelSettings } from "react-icons/md";
import LogoImage from "../../assets/maven-logo.svg";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../../Redux/thunks/authThunks";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import LoginIllustration from "../../assets/Character.svg";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error } = useSelector((state) => state.auth);

  const [role, setRole] = useState("RECRUITER");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Enter email & password");
      return;
    }

    const result = await dispatch(loginUser({ email, password }));

    if (result.meta.requestStatus === "fulfilled") {
      toast.success("Login successful!");

      navigate("/qr-generation");
    } else {
      toast.error(result.payload || "Invalid credentials");
    }
  };

  return (
    <div className="relative w-full h-screen bg-[#1F41A9] overflow-hidden flex">
      {/* LEFT CONTENT */}
      <div className="hidden lg:flex flex-col justify-center px-35 -mt-19 w-1/2 z-10">
        <img src={LogoImage} className="w-52 mb-8" alt="Logo" />

        <h1 className="text-white text-4xl font-bold font-serif leading-tight mb-6">
          Welcome to Maven Jobs
        </h1>

        <p className="text-white/90 text-2xl font-medium font-[Calibri] mb-8 max-w-md">
          Your trusted recruitment partner for finding the best talent across
          industries.
        </p>

        <ul className="space-y-3 text-white text-base font-[Calibri]">
          <li className="flex items-center gap-3">
            <span className="w-2 h-2 bg-[#A1DB40] rounded-full"></span>
            Access thousands of qualified candidates
          </li>
          <li className="flex items-center gap-3">
            <span className="w-2 h-2 bg-[#A1DB40] rounded-full"></span>
            Advanced search and filtering tools
          </li>
          <li className="flex items-center gap-3">
            <span className="w-2 h-2 bg-[#A1DB40] rounded-full"></span>
            Real-time analytics and insights
          </li>
        </ul>
      </div>

      {/* RIGHT LOGIN CARD */}
      <div className="flex w-full lg:w-1/2 items-center justify-center z-10">
        <div className="w-full max-w-md bg-white rounded-xl p-8 shadow-sm">
          <h2 className="text-center text-2xl font-bold font-serif text-[#0C0C0C]">
            Sign In
          </h2>

          <p className="text-center text-sm font-[Calibri] text-zinc-500 mt-1">
            Access your recruiter dashboard
          </p>

          {/* ROLE SWITCH */}
          {/* <div className="flex bg-gray-100 rounded-lg p-1 mt-6">
            <button
              onClick={() => setRole("RECRUITER")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-[Calibri]
              ${role === "RECRUITER" ? "bg-white text-black" : "text-zinc-500"}
            `}
            >
              <FiUser size={14} />
              Recruiter
            </button>

            <button
              onClick={() => setRole("ADMIN")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-[Calibri]
              ${role === "ADMIN" ? "bg-white text-black" : "text-zinc-500"}
            `}
            >
              <MdAdminPanelSettings size={14} />
              Admin
            </button>
          </div> */}

          {/* EMAIL */}
          <div className="mt-6">
            <label className="text-sm font-[Calibri] text-[#0C0C0C]">
              Email Address
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full h-10 rounded-lg bg-[#FCFBF8] border border-gray-200 px-4 text-sm font-[Calibri]"
            />
          </div>

          {/* PASSWORD */}
          <div className="mt-4">
            <label className="text-sm font-[Calibri] text-[#0C0C0C]">
              Password
            </label>

            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-10 rounded-lg bg-[#FCFBF8] border border-gray-200 px-4 text-sm font-[Calibri]"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          {/* FORGOT */}
          <div className="flex justify-end mt-2">
            <span className="text-sm font-[Calibri] cursor-pointer text-[#0C0C0C] hover:underline">
              Forgot password?
            </span>
          </div>

          {/* SIGN IN BUTTON */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="mt-6 w-full h-11 rounded-lg bg-[#103C7F] text-white font-[Calibri]"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          {/* FOOTER */}
          <p className="text-center text-xs text-zinc-500 font-[Calibri] mt-6">
            By signing in, you agree to our{" "}
            <span className="underline cursor-pointer">Terms of Service</span>{" "}
            and <span className="underline cursor-pointer">Privacy Policy</span>
          </p>
        </div>
      </div>

      {/* BACKGROUND SHAPES */}
      <div className="absolute -left-66 -top-55  w-[568px] h-[568px] bg-[#274FC7] rounded-full" />
      <div className="absolute -left-106 -bottom-85  w-[568px] h-[568px] bg-[#274FC7] rounded-full" />
      <svg
        className="absolute -right-25 top-65 rotate-25 h-full"
        width="420"
        viewBox="0 0 420 827"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <path
          d="
      M420 0
      L260 0
      C180 140 180 300 260 413
      C340 540 340 700 260 827
      L420 827
      Z
    "
          fill="#264ECA"
        />
      </svg>
      <img
        src={LoginIllustration}
        alt="Recruitment Illustration"
        className="absolute left-0 -bottom-5 w-[250px] h-auto z-20 pointer-events-none"
      />
    </div>
  );
};

export default Login;
