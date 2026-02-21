import Logo from '../assets/maven-logo.svg'

export default function Footer() {
  return (
    <footer
      className="text-center px-6 py-8 mt-4"
      style={{
        background: "#0f2550",
        color: "rgba(255,255,255,0.35)",
        fontSize: "13px",
      }}
    >
      <div className="inline-flex items-center gap-2 mb-3">
       <img src={Logo} alt="" />
      </div>

      <div>
        Powered by{" "}
        <a
          href="#"
          className="text-[#00c8d6] font-semibold hover:underline"
        >
          Maven CRM
        </a>{" "}
        · Join. Connect. Grow.
      </div>

      <div className="mt-1.5 text-[12px] text-white/20">
        © {new Date().getFullYear()} Maven Jobs. All rights reserved.
      </div>
    </footer>
  );
}
